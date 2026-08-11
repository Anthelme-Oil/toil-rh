import { NextResponse } from 'next/server';
import { getGraphClient } from '@/lib/graph';

// Image SVG de fallback propre si l'image SharePoint est bloquée par l'authentification
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0284c7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
  <g transform="translate(400,200)" text-anchor="middle">
    <circle r="40" fill="white" opacity="0.1" />
    <path d="M-15 -10 L15 -10 L15 15 L-15 15 Z" fill="none" stroke="white" stroke-width="2" />
    <text y="50" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="white" opacity="0.8">T-OIL ACTU</text>
  </g>
</svg>`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse(FALLBACK_SVG, {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }

  // Redirection immédiate si c'est un chemin local relatif ou data URL
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return NextResponse.redirect(new URL(imageUrl, request.url));
  }

  try {
    const graphClient = getGraphClient();

    // 1. Si URL SharePoint et Graph disponible, tentative de récupération via Graph API
    if (graphClient && imageUrl.includes('sharepoint.com')) {
      try {
        const res = await fetch(imageUrl, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Authorization: `Bearer ${(graphClient as any).config?.authProvider?.getAccessToken?.() || ''}`,
          },
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.startsWith('image/')) {
          const arrayBuffer = await res.arrayBuffer();
          return new NextResponse(arrayBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
          });
        }
      } catch {
        // Ignorer et passer au fetch classique
      }
    }

    // 2. Fetch direct de l'URL
    const response = await fetch(imageUrl);
    const contentType = response.headers.get('content-type') || '';

    if (response.ok && contentType.startsWith('image/')) {
      const arrayBuffer = await response.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    }

    // Si la réponse n'est pas une image valide (ex: 401/403/page HTML de login SharePoint), retourner le SVG de fallback
    return new NextResponse(FALLBACK_SVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Proxy Image] Erreur:', error);
    return new NextResponse(FALLBACK_SVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }
}
