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

  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.value;
  }

  try {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
    if (!tokenResponse?.token) return null;

    cachedToken = {
      value: tokenResponse.token,
      expiresAt: Date.now() + (tokenResponse.expiresOnTimestamp - Date.now()),
    };
    return cachedToken.value;
  } catch (err) {
    console.error('[Proxy] Erreur obtention token:', err);
    return null;
  }
}

function toShareId(urlStr: string): string {
  const encoded = Buffer.from(urlStr).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `u!${encoded}`;
}

/**
 * Tente de déréférencer une URL SharePoint (share link, webUrl, ou pièce jointe) via Microsoft Graph API
 */
async function resolveSharePointUrl(shareUrl: string, token: string): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  const siteId = process.env.SHAREPOINT_SITE_ID;
  const driveId = process.env.DRIVE_BLOG_IMAGES || process.env.DRIVE_PROCEDURES_IT;

  // 1. Essayer le Share ID (pour les liens de partage SharePoint / OneDrive)
  const urlsToTry = [shareUrl];
  if (shareUrl.includes('?')) {
    urlsToTry.push(shareUrl.split('?')[0]);
  }
  try {
    const decoded = decodeURIComponent(shareUrl);
    if (decoded !== shareUrl) {
      urlsToTry.push(decoded);
      if (decoded.includes('?')) {
        urlsToTry.push(decoded.split('?')[0]);
      }
    }
  } catch {}

  for (const targetUrl of urlsToTry) {
    try {
      const shareId = toShareId(targetUrl);
      const res = await fetch(`https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        const buffer = await res.arrayBuffer();
        if (buffer.byteLength > 0) return { buffer, contentType: ct };
      }
    } catch {}
  }

  // 2. Extraire le nom de fichier
  const rawFileName = shareUrl.split('/').pop()?.split('?')[0] || '';
  let fileName = rawFileName;
  try { fileName = decodeURIComponent(rawFileName); } catch {}

  if (siteId && fileName) {
    const drivePathsToTry = [
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root`,
    ];
    if (driveId && driveId !== 'Procedures_IT') {
      drivePathsToTry.push(`https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root`);
    }

    for (const basePath of drivePathsToTry) {
      // A. T-oil Intranet Files
      try {
        const res = await fetch(`${basePath}:/T-oil Intranet Files/${encodeURIComponent(fileName)}:/content`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          const buffer = await res.arrayBuffer();
          if (buffer.byteLength > 0) return { buffer, contentType: ct };
        }
      } catch {}

      // B. Blogs
      try {
        const res = await fetch(`${basePath}:/Blogs/${encodeURIComponent(fileName)}:/content`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          const buffer = await res.arrayBuffer();
          if (buffer.byteLength > 0) return { buffer, contentType: ct };
        }
      } catch {}

      // C. Recherche directe par nom de fichier
      try {
        const searchRes = await fetch(`${basePath}/search(q='${encodeURIComponent(fileName)}')`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (searchRes.ok) {
          const searchJson = await searchRes.json();
          const items = searchJson.value || [];
          if (items.length > 0) {
            const match = items[0];
            const downloadUrl = match['@microsoft.graph.downloadUrl'] || (match.id ? `${basePath}/items/${match.id}/content` : null);
            if (downloadUrl) {
              const contentRes = await fetch(downloadUrl, {
                headers: downloadUrl.includes('graph.microsoft.com') ? { Authorization: `Bearer ${token}` } : {},
              });
              if (contentRes.ok) {
                const ct = contentRes.headers.get('content-type') || '';
                const buffer = await contentRes.arrayBuffer();
                if (buffer.byteLength > 0) return { buffer, contentType: ct };
              }
            }
          }
        }
      } catch {}
    }
  }

  // 3. Fallback: Pièces jointes de listes SharePoint (Attachments)
  if (siteId && shareUrl.includes('/Attachments/')) {
    try {
      const parts = shareUrl.split('/Attachments/');
      if (parts.length > 1) {
        const pathAfter = parts[1]; // ex: "12/photo.jpg"
        const [itemId, attachmentName] = pathAfter.split('/');
        const listId = process.env.LIST_ACTUALITES_ID || 'Actualites';

        if (itemId && attachmentName) {
          const attachRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items/${itemId}/attachments`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (attachRes.ok) {
            const json = await attachRes.json();
            const attachments = json.value || [];
            const att = attachments.find((a: any) => a.name === attachmentName || a.name === decodeURIComponent(attachmentName));
            if (att && att.contentBytes) {
              const buffer = Buffer.from(att.contentBytes, 'base64');
              return { buffer: buffer.buffer as ArrayBuffer, contentType: att.contentType || 'image/jpeg' };
            }
          }
        }
      }
    } catch {}
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) return fallback();

  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return NextResponse.redirect(new URL(imageUrl, request.url));
  }

  try {
    const isSharePoint = imageUrl.includes('sharepoint.com') || imageUrl.includes('graph.microsoft.com') || imageUrl.includes('1drv.ms');

    if (isSharePoint) {
      const token = await getAccessToken();

      if (token) {
        // Résolution via Graph API Shares endpoint ou Drive direct
        const resolved = await resolveSharePointUrl(imageUrl, token);
        if (resolved) {
          const { buffer, contentType: rawCt } = resolved;
          let contentType = rawCt;

          if (!contentType || contentType === 'application/octet-stream') {
            const bytes = new Uint8Array(buffer.slice(0, 8));
            if (bytes[0] === 0x89 && bytes[1] === 0x50) contentType = 'image/png';
            else if (bytes[0] === 0x47 && bytes[1] === 0x49) contentType = 'image/gif';
            else if (bytes[0] === 0x52 && bytes[1] === 0x49) contentType = 'image/webp';
            else if (bytes[0] === 0xff && bytes[1] === 0xd8) contentType = 'image/jpeg';
            else if (imageUrl.toLowerCase().includes('.mp4') || (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79)) contentType = 'video/mp4';
            else contentType = 'image/jpeg';
          }

          if (imageUrl.toLowerCase().includes('.mp4')) {
            contentType = 'video/mp4';
          }

          return new NextResponse(buffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
              'Accept-Ranges': 'bytes',
              'Content-Length': buffer.byteLength.toString(),
            },
          });
        }

        // Second fallback: fetch direct avec token
        try {
          const directRes = await fetch(imageUrl, { headers: { Authorization: `Bearer ${token}` } });
          if (directRes.ok) {
            const ct = directRes.headers.get('content-type') || '';
            const isMedia = ct.startsWith('image/') || ct.startsWith('video/');
            if (isMedia) {
              const buffer = await directRes.arrayBuffer();
              return new NextResponse(buffer, {
                headers: {
                  'Content-Type': ct,
                  'Cache-Control': 'public, max-age=86400',
                  'Accept-Ranges': 'bytes',
                  'Content-Length': buffer.byteLength.toString(),
                },
              });
            }
          }
        } catch {}

        console.warn('[Proxy] Échec résolution SharePoint:', imageUrl.substring(0, 100));
      }
    } else {
      const res = await fetch(imageUrl);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && (contentType.startsWith('image/') || contentType.startsWith('video/'))) {
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            'Accept-Ranges': 'bytes',
            'Content-Length': buffer.byteLength.toString(),
          },
        });
      }
    }
  } catch (err) {
    console.error('[Proxy] Erreur inattendue:', err);
  }

  return fallback();
}
