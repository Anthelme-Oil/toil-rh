// Script de diagnostic — exécuter avec: node scripts/diagnose-images.mjs
// Ce script appelle directement Microsoft Graph pour afficher les données réelles des articles
// et identifier pourquoi les images ne s'affichent pas.

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Charger les variables d'environnement depuis .env.local
const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && !key.startsWith('#') && rest.length > 0) {
    env[key.trim()] = rest.join('=').trim();
  }
}

const TENANT_ID    = env.AZURE_AD_TENANT_ID;
const CLIENT_ID    = env.AZURE_AD_CLIENT_ID;
const CLIENT_SECRET = env.AZURE_AD_CLIENT_SECRET;
const SITE_ID      = env.SHAREPOINT_SITE_ID;
const LIST_ID      = env.LIST_ACTUALITES_ID;
const DRIVE_IT     = env.DRIVE_PROCEDURES_IT;

console.log('\n═══════════════════════════════════════════');
console.log('DIAGNOSTIC IMAGES SHAREPOINT');
console.log('═══════════════════════════════════════════');
console.log('TENANT_ID    :', TENANT_ID ? '✅ présent' : '❌ manquant');
console.log('CLIENT_ID    :', CLIENT_ID ? '✅ présent' : '❌ manquant');
console.log('CLIENT_SECRET:', CLIENT_SECRET ? '✅ présent' : '❌ manquant');
console.log('SITE_ID      :', SITE_ID || '❌ manquant');
console.log('LIST_ID      :', LIST_ID || '❌ manquant');
console.log('DRIVE_IT     :', DRIVE_IT ? DRIVE_IT.substring(0, 30) + '...' : '❌ manquant');

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
  if (!data.access_token) {
    throw new Error('Impossible d\'obtenir un token: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function graphGet(token, path) {
  const url = `https://graph.microsoft.com/v1.0${path}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  if (!res.ok) throw new Error(`GraphAPI ${res.status}: ${text}`);
  return JSON.parse(text);
}

(async () => {
  try {
    console.log('\n── 1. Obtention du token OAuth ──');
    const token = await getToken();
    console.log('✅ Token obtenu');

    // ── 2. Lister tous les Drives du site ──
    console.log('\n── 2. Drives disponibles sur le site SharePoint ──');
    const drives = await graphGet(token, `/sites/${SITE_ID}/drives?$select=id,name,driveType,webUrl`);
    for (const d of drives.value || []) {
      const isCurrent = d.id === DRIVE_IT;
      console.log(`  ${isCurrent ? '👉' : '  '} [${d.driveType}] "${d.name}"`);
      console.log(`     ID: ${d.id}`);
      console.log(`     URL: ${d.webUrl}`);
    }

    // ── 3. Articles de la liste Actualités ──
    console.log('\n── 3. Derniers articles SharePoint (champ ImageUrl) ──');
    const items = await graphGet(
      token,
      `/sites/${SITE_ID}/lists/${LIST_ID}/items?$expand=fields($select=Title,ImageUrl,Image)&$top=5&$orderby=createdDateTime desc`
    );
    
    let hasImages = 0;
    for (const item of items.value || []) {
      const f = item.fields;
      const imageUrl = f.ImageUrl || '';
      const imageField = f.Image || '';
      const hasImg = imageUrl.length > 0;
      if (hasImg) hasImages++;
      
      console.log(`\n  📰 Article ID: ${item.id}`);
      console.log(`     Titre: ${f.Title || '(sans titre)'}`);
      console.log(`     ImageUrl: ${imageUrl ? imageUrl.substring(0, 100) : '❌ VIDE'}`);
      console.log(`     Image (champ JSON): ${imageField ? String(imageField).substring(0, 100) : '❌ VIDE'}`);
      
      if (imageUrl) {
        // Tester si l'URL est accessible directement
        try {
          const imgRes = await fetch(imageUrl, {
            headers: { Authorization: `Bearer ${token}` },
            redirect: 'manual'
          });
          console.log(`     Accès avec token: HTTP ${imgRes.status} [${imgRes.headers.get('content-type') || 'no content-type'}]`);
        } catch (e) {
          console.log(`     Accès avec token: ❌ Erreur réseau: ${e.message}`);
        }

        // Tester via le proxy local
        const proxyUrl = `http://localhost:3000/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
        try {
          const proxyRes = await fetch(proxyUrl);
          const ct = proxyRes.headers.get('content-type') || '';
          const isSvg = ct.includes('svg');
          console.log(`     Via proxy local: HTTP ${proxyRes.status} [${ct}] ${isSvg ? '⚠️ SVG fallback (image non servie)' : '✅ image réelle'}`);
        } catch (e) {
          console.log(`     Via proxy local: ❌ ${e.message}`);
        }
      }
    }

    console.log(`\n── Résumé: ${hasImages}/${(items.value||[]).length} articles ont un champ ImageUrl rempli ──`);

    // ── 4. Contenu du dossier Blogs dans le Drive ──
    console.log('\n── 4. Dossier "Blogs" dans le Drive configuré ──');
    try {
      const blogFolder = await graphGet(
        token,
        `/sites/${SITE_ID}/drives/${DRIVE_IT}/root:/Blogs:/children?$select=id,name,webUrl,@microsoft.graph.downloadUrl&$top=5`
      );
      if ((blogFolder.value || []).length === 0) {
        console.log('  ⚠️ Dossier "Blogs" vide ou inexistant dans ce Drive');
      }
      for (const f of blogFolder.value || []) {
        console.log(`  📁 ${f.name}`);
        console.log(`     webUrl: ${f.webUrl}`);
        console.log(`     downloadUrl: ${f['@microsoft.graph.downloadUrl'] ? f['@microsoft.graph.downloadUrl'].substring(0, 80) + '...' : 'N/A'}`);
      }
    } catch (e) {
      console.log('  ❌ Erreur accès dossier Blogs:', e.message);
    }

  } catch (err) {
    console.error('\n❌ ERREUR FATALE:', err.message);
  }
})();
