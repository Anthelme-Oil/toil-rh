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
    const lists = await client.api(`/sites/${siteId}/lists?$select=id,displayName,name,system`).get();
    const userList = lists.value.find(l => l.name === 'users' || l.displayName.includes("utilisateur"));

    if (userList) {
      console.log(`FOUND User List ID: ${userList.id} (${userList.displayName})`);
      const items = await client.api(`/sites/${siteId}/lists/${userList.id}/items?expand=fields`).get();
      console.log(`Nombre d'utilisateurs SharePoint répertoriés: ${items.value.length}\n`);
      items.value.forEach(item => {
        const f = item.fields;
        console.log(`ID: ${item.id.padStart(3, ' ')} | Title: ${(f.Title || '').padEnd(30, ' ')} | EMail: ${(f.EMail || f.UserName || '').padEnd(35, ' ')} | Name: ${f.Name || ''}`);
      });
    } else {
      console.log('User List not found');
    }
  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

main();
