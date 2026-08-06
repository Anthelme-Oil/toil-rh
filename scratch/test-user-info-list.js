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
    console.log('Recherche des listes du site pour trouver User Information List...');
    const lists = await client.api(`/sites/${siteId}/lists`).get();
    const userInfoList = lists.value.find(l => l.name === 'User Information List' || l.displayName === 'User Information List');
    
    if (userInfoList) {
      console.log('User Information List trouvée! ID:', userInfoList.id);
      const items = await client.api(`/sites/${siteId}/lists/${userInfoList.id}/items?expand=fields`).get();
      console.log(`Nombre d'utilisateurs trouvés: ${items.value.length}`);
      items.value.forEach(it => {
        console.log(`ID: ${it.id} | Name: ${it.fields.Title || it.fields.Name} | Email: ${it.fields.EMail || it.fields.UserName}`);
      });
    } else {
      console.log('User Information List non trouvée directement dans /lists. Listes disponibles:');
      lists.value.forEach(l => console.log(`- ${l.displayName} (${l.name})`));
    }
  } catch (err) {
    console.error('Erreur:', err);
  }
}

main();
