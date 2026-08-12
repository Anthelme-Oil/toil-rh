// Script de test d'upload et création d'article — node scripts/test-create-article.mjs

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Créer une image PNG minimale de 1x1 pixel ou 10x10 pour le test
const samplePngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const sampleBuffer = Buffer.from(samplePngBase64, 'base64');

(async () => {
  console.log('── Test création article avec image ──');

  const formData = new FormData();
  formData.append('titre', 'Article Test Image Proxy');
  formData.append('description', 'Test d\'affichage de l\'image créée automatiquement');
  formData.append('contenu', '<p>Ceci est un test de création de blog avec une vraie image.</p>');
  formData.append('categorie', 'COMMUNIQUE');

  const file = new File([sampleBuffer], 'test_image_proxy.png', { type: 'image/png' });
  formData.append('image', file);

  const res = await fetch('http://localhost:3000/api/actualites', {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  console.log('Réponse API POST /api/actualites:', json);
})();
