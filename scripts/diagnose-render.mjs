// Script de diagnostic côté rendu — node scripts/diagnose-render.mjs
// Simule exactement ce que le serveur Next.js retourne aux composants

import { readFileSync } from 'fs';
import { resolve } from 'path';

const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && !key.startsWith('#') && rest.length > 0) {
    env[key.trim()] = rest.join('=').trim();
  }
}

const TENANT_ID     = env.AZURE_AD_TENANT_ID;
const CLIENT_ID     = env.AZURE_AD_CLIENT_ID;
const CLIENT_SECRET = env.AZURE_AD_CLIENT_SECRET;
const SITE_ID       = env.SHAREPOINT_SITE_ID;
const LIST_ID       = env.LIST_ACTUALITES_ID;
const HOSTNAME      = env.SHAREPOINT_HOSTNAME || 'togooil.sharepoint.com';

async function getToken() {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });
  const res = await fetch(url, { method: 'POST', body });
  const data = await res.json();
  return data.access_token;
}

// Reproduit exactement formatSharePointUrl de lib/sharepoint.ts
function formatSharePointUrl(rawUrl) {
  if (!rawUrl) return '';
  const url = rawUrl.trim();
  if (url.startsWith('data:') || url.startsWith('/')) return url;
  if (url.includes('sharepoint.com') || url.includes('graph.microsoft.com') || url.includes('1drv.ms')) {
    return `/api/images/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

// Reproduit exactement extractImageUrl de lib/sharepoint.ts
function extractImageUrl(fields, itemId) {
  if (fields.ImageUrl) {
    return formatSharePointUrl(fields.ImageUrl);
  }
  if (fields.Image) {
    try {
      const imgObj = typeof fields.Image === 'string' ? JSON.parse(fields.Image) : fields.Image;
      if (imgObj.serverRelativeUrl) {
        return `https://${HOSTNAME}${imgObj.serverRelativeUrl}`;
      }
      if (imgObj.fileName) {
        return `https://${HOSTNAME}/sites/NotrePortail/Lists/Actualites/Attachments/${itemId}/${encodeURIComponent(imgObj.fileName)}`;
      }
    } catch {}
  }
  return undefined;
}

(async () => {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('DIAGNOSTIC RENDU — Ce que les composants reçoivent réellement');
  console.log('═══════════════════════════════════════════════════════\n');

  const token = await getToken();

  // Récupérer TOUS les champs bruts de la liste
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists/${LIST_ID}/items?$expand=fields&$top=10&$orderby=createdDateTime desc`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();

  console.log(`Total articles récupérés: ${(data.value||[]).length}\n`);

  for (const item of data.value || []) {
    const fields = item.fields;
    const id = item.id;
    const imageUrl = extractImageUrl(fields, id);

    console.log(`── Article #${id} : "${fields.Title || '(sans titre)'}"`);
    console.log(`   fields.ImageUrl (brut)   : ${fields.ImageUrl ? `"${fields.ImageUrl.substring(0,100)}"` : '❌ undefined/vide'}`);
    console.log(`   fields.Image (brut)      : ${fields.Image ? `"${JSON.stringify(fields.Image).substring(0,120)}"` : '❌ undefined/vide'}`);
    console.log(`   → imageUrl retourné      : ${imageUrl ? `"${imageUrl.substring(0,120)}"` : '❌ undefined → isBroken=true → Placeholder affiché'}`);

    if (imageUrl) {
      // Tester que l'URL proxy répond bien avec une vraie image
      const proxyUrl = `http://localhost:3000${imageUrl}`;
      try {
        const pr = await fetch(proxyUrl);
        const ct = pr.headers.get('content-type') || '';
        const size = pr.headers.get('content-length') || '?';
        if (ct.includes('svg')) {
          console.log(`   → Proxy test             : ⚠️  FALLBACK SVG retourné — l'image ne s'affichera PAS`);
        } else if (ct.startsWith('image/')) {
          console.log(`   → Proxy test             : ✅ image/${ct.split('/')[1]} (${size} bytes) — devrait s'afficher`);
        } else {
          console.log(`   → Proxy test             : ❌ réponse non-image: ${ct} HTTP ${pr.status}`);
        }
      } catch (e) {
        console.log(`   → Proxy test             : ❌ erreur réseau: ${e.message}`);
      }
    }
    console.log('');
  }

  // Vérifier aussi si le serveur Next.js est bien en train de lire le .env.local mis à jour
  console.log('── Vérification cohérence serveur Next.js ──');
  try {
    const svRes = await fetch('http://localhost:3000/api/images/proxy', { method: 'GET' });
    const ct = svRes.headers.get('content-type') || '';
    console.log(`   /api/images/proxy (sans url): HTTP ${svRes.status} [${ct}]`);
    if (ct.includes('svg')) {
      console.log('   ✅ Proxy actif et accessible (retourne SVG fallback sans param)');
    }
  } catch(e) {
    console.log('   ❌ Serveur inaccessible:', e.message);
  }
})();
