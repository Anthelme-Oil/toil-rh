import { NextResponse } from 'next/server';
import { getGraphClient } from '@/lib/graph';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL manquante', { status: 400 });
  }

  // Si c'est une image locale ou data URL, on redirige vers l'URL directe
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return NextResponse.redirect(new URL(imageUrl, request.url));
  }

  try {
    const graphClient = getGraphClient();

    // Si on a un client Graph et que l'URL est sur SharePoint, tenter de récupérer l'image via Graph
    if (graphClient && imageUrl.includes('sharepoint.com')) {
      try {
        const res = await fetch(imageUrl, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Authorization: `Bearer ${(graphClient as any).config?.authProvider?.getAccessToken?.() || ''}`,
          },
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || 'image/jpeg';
          const arrayBuffer = await res.arrayBuffer();
          return new NextResponse(arrayBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
          });
        }
      } catch {
        // Ignorer et tenter le fetch direct
      }
    }

    // Fetch simple pour les URLs publiques
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new NextResponse('Image non disponible', { status: 404 });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('[Proxy Image] Erreur:', error);
    return new NextResponse('Erreur proxy image', { status: 500 });
  }
}
