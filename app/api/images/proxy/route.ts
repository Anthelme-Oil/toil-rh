import { NextResponse } from 'next/server';
import { ClientSecretCredential } from '@azure/identity';

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

function fallback(cache = 3600) {
  return new NextResponse(FALLBACK_SVG, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': `public, max-age=${cache}`,
    },
  });
}

/**
 * Obtient un token d'accès Microsoft Graph via Client Credentials (app-only).
 */
async function getGraphAccessToken(): Promise<string | null> {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) return null;

  try {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
    return tokenResponse?.token ?? null;
  } catch (err) {
    console.error('[Proxy Image] Impossible d\'obtenir un token Graph:', err);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return fallback();
  }

  // Redirection immédiate si c'est un chemin local relatif ou data URL
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return NextResponse.redirect(new URL(imageUrl, request.url));
  }

  try {
    // 1. Si URL SharePoint, utiliser un vrai token OAuth pour l'accès
    if (imageUrl.includes('sharepoint.com') || imageUrl.includes('graph.microsoft.com')) {
      const accessToken = await getGraphAccessToken();

      if (accessToken) {
        const res = await fetch(imageUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          // Pas de cache ici — on laisse Next.js gérer via les headers de réponse
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

        console.warn('[Proxy Image] Réponse SharePoint non-image:', res.status, contentType, imageUrl.substring(0, 100));
      } else {
        console.warn('[Proxy Image] Pas de token Graph disponible, tentative d\'accès direct.');
      }
    }

    // 2. Fetch direct (pour URLs publiques ou CDN)
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

    // Réponse non-image (401, 403, page HTML login SharePoint) → fallback SVG
    console.warn('[Proxy Image] URL inaccessible:', response.status, imageUrl.substring(0, 100));
    return fallback();
  } catch (error) {
    console.error('[Proxy Image] Erreur réseau:', error);
    return fallback();
  }
}
