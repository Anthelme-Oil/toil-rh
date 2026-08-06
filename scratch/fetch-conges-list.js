const fs = require('fs');
const path = require('path');
const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

async function main() {
  const credential = new ClientSecretCredential(
    env.AZURE_AD_TENANT_ID,
    env.AZURE_AD_CLIENT_ID,
    env.AZURE_AD_CLIENT_SECRET
  );

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  });

  const client = Client.initWithMiddleware({ authProvider });
  const siteId = env.SHAREPOINT_SITE_ID;

  try {
    console.log('--- ITEMS DE LA LISTE DEMANDE DE CONGE ---');
    const res = await client.api(`/sites/${siteId}/lists/${env.LIST_CONGES_ID}/items?expand=fields`).get();
    console.log(`Nombre total d'items dans la liste: ${res.value.length}`);
    res.value.forEach(item => {
      console.log(`\nItem ID: ${item.id}`);
      console.log('Fields:', JSON.stringify(item.fields, null, 2));
    });
  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

main();
