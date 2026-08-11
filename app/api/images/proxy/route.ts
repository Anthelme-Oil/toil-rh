import { NextResponse } from 'next/server';
import { ClientSecretCredential } from '@azure/identity';

// ── Fallback SVG ──
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

function fallback() {
  return new NextResponse(FALLBACK_SVG, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=60' },
  });
}

// Cache token en mémoire pour éviter de le régénérer à chaque requête image
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) return null;

  // Réutiliser le token s'il est encore valide (marge de 5 minutes)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.value;
  }

  try {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
    if (!tokenResponse?.token) return null;

    cachedToken = {
      value: tokenResponse.token,
      // expires_in est généralement 3600s (1h)
      expiresAt: Date.now() + (tokenResponse.expiresOnTimestamp - Date.now()),
    };
    return cachedToken.value;
  } catch (err) {
    console.error('[Proxy] Erreur obtention token:', err);
    return null;
  }
}

/**
 * Convertit un lien de partage SharePoint (/:i:/ ou /:f:/) en URL de contenu
 * via l'API Graph shares endpoint.
 *
 * SharePoint génère des liens du type :
 *   https://tenant.sharepoint.com/:i:/s/SiteName/ENCODED_ID?e=TOKEN
 *
 * L'API Graph peut déréférencer ces liens via :
 *   GET /shares/{shareId}/driveItem/content
 *
 * Le shareId est calculé comme : u! + base64url(url)
 */
async function resolveSharePointShareLink(shareUrl: string, token: string): Promise<ArrayBuffer | null> {
  try {
    // Encoder l'URL en base64url pour l'API Graph Shares
    const encoded = Buffer.from(shareUrl).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const shareId = `u!${encoded}`;

    const res = await fetch(`https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem/content`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.startsWith('image/')) {
        return res.arrayBuffer();
      }
    }

    console.warn('[Proxy] Share link résolution échouée:', res.status, shareUrl.substring(0, 80));
    return null;
  } catch (err) {
    console.error('[Proxy] Erreur résolution share link:', err);
    return null;
  }
}

/**
 * Tente de récupérer l'image via l'URL directe avec le token Bearer.
 */
async function fetchWithToken(imageUrl: string, token: string): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.startsWith('image/')) {
      return { buffer: await res.arrayBuffer(), contentType };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  // Pas d'URL → fallback
  if (!imageUrl) return fallback();

  // URL locale ou data URL → redirection directe
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return NextResponse.redirect(new URL(imageUrl, request.url));
  }

  try {
    const isSharePoint = imageUrl.includes('sharepoint.com') || imageUrl.includes('graph.microsoft.com');

    if (isSharePoint) {
      const token = await getAccessToken();

      if (token) {
        // ── Stratégie 1 : Lien de partage SharePoint (/:i:/ /:f:/ etc.) ──
        const isShareLink = /\/:(?:i|f|b|u|w|e|v|p):\//i.test(imageUrl);
        if (isShareLink) {
          const buffer = await resolveSharePointShareLink(imageUrl, token);
          if (buffer) {
            // Détecter le type depuis les premiers octets
            const bytes = new Uint8Array(buffer.slice(0, 4));
            let contentType = 'image/jpeg';
            if (bytes[0] === 0x89 && bytes[1] === 0x50) contentType = 'image/png';
            else if (bytes[0] === 0x47 && bytes[1] === 0x49) contentType = 'image/gif';
            else if (bytes[0] === 0x52 && bytes[1] === 0x49) contentType = 'image/webp';

            return new NextResponse(buffer, {
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
              },
            });
          }
        }

        // ── Stratégie 2 : URL directe avec token Bearer ──
        const result = await fetchWithToken(imageUrl, token);
        if (result) {
          return new NextResponse(result.buffer, {
            headers: {
              'Content-Type': result.contentType,
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
          });
        }

        console.warn('[Proxy] Toutes les stratégies SharePoint ont échoué pour:', imageUrl.substring(0, 100));
      }
    } else {
      // ── URL publique non-SharePoint : fetch direct ──
      const res = await fetch(imageUrl);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.startsWith('image/')) {
        return new NextResponse(await res.arrayBuffer(), {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        });
      }
    }
  } catch (err) {
    console.error('[Proxy] Erreur inattendue:', err);
  }

  return fallback();
}
