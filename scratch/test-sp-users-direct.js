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
    const list = await client.api(`/sites/${siteId}/lists/users?expand=items(expand=fields)`).get();
    console.log('Liste "users" info:', list.id, list.displayName);
    if (list.items) {
      console.log(`Nombre d'utilisateurs: ${list.items.length}`);
      list.items.forEach(it => {
        const f = it.fields;
        console.log(`ID: ${it.id} | Email: ${f.EMail} | Title: ${f.Title} | Name: ${f.Name}`);
      });
    }
  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

main();
