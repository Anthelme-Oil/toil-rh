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
    console.log('--- ITEMS DEMANDE DE CONGE ---');
    const resConges = await client.api(`/sites/${siteId}/lists/${env.LIST_CONGES_ID}/items?expand=fields`).get();
    resConges.value.forEach(item => {
      console.log(`ID: ${item.id} | Title: ${item.fields.Title} | DemandeurLookupId: ${item.fields.DemandeurLookupId} | SupérieurLookupId: ${item.fields.Sup_x00e9_rieurhi_x00e9_rarchiquLookupId} | AuthorLookupId: ${item.fields.AuthorLookupId}`);
    });

    console.log('\n--- ITEMS SUIVI DES DEMANDES ---');
    const resDemandes = await client.api(`/sites/${siteId}/lists/${env.LIST_DEMANDES_ID}/items?expand=fields`).get();
    resDemandes.value.forEach(item => {
      console.log(`ID: ${item.id} | Title: ${item.fields.Title} | DemandeurLookupId: ${item.fields.DemandeurLookupId} | ManagerLookupId: ${item.fields.ManagerLookupId} | AuthorLookupId: ${item.fields.AuthorLookupId}`);
    });
  } catch (err) {
    console.error('Erreur:', err);
  }
}

main();
