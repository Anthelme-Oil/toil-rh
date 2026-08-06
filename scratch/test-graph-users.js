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
    console.log('--- RECHERCHE UTILISATEURS VIA GRAPH /USERS ---');
    const users = await client.api('/users').select('id,displayName,mail,userPrincipalName').get();
    console.log(`Trouvé ${users.value.length} utilisateurs dans l'Entra ID :`);
    users.value.forEach(u => {
      console.log(`Entra ID: ${u.id} | Mail: ${u.mail || u.userPrincipalName} | Name: ${u.displayName}`);
    });

    console.log('\n--- VERIFICATION HISTORIQUE LOOKUP IDS DANS LES LISTES SHAREPOINT ---');
    // On consulte les colonnes Personne des items existants pour extraire tous les LookupId connus
    const conges = await client.api(`/sites/${siteId}/lists/${env.LIST_CONGES_ID}/items?expand=fields`).get();
    const map = new Map();
    conges.value.forEach(it => {
      const dId = it.fields.DemandeurLookupId;
      const sId = it.fields.Sup_x00e9_rieurhi_x00e9_rarchiquLookupId;
      if (dId) map.set(dId, `LookupId ${dId}`);
      if (sId) map.set(sId, `LookupId ${sId}`);
    });
    console.log('LookupIds enregistrés dans la liste congés:', Array.from(map.keys()));

  } catch (err) {
    console.error('Erreur:', err);
  }
}

main();
