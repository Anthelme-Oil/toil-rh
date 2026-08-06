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
    console.log('--- TEST 1: GET SITE USERS ENDPOINT ---');
    try {
      const siteUsers = await client.api(`/sites/${siteId}/siteUsers`).get();
      console.log(`Trouvé ${siteUsers.value.length} siteUsers :`);
      siteUsers.value.forEach(u => {
        console.log(`ID: ${u.id} | Email: ${u.email || u.userPrincipalName} | Title: ${u.displayName}`);
      });
    } catch (e) {
      console.log('siteUsers endpoint error:', e.message);
    }

    console.log('--- TEST 2: ALL LISTS INCLUDING SYSTEM ---');
    const lists = await client.api(`/sites/${siteId}/lists?$select=id,displayName,name,system`).get();
    lists.value.forEach(l => {
      console.log(`- ${l.displayName} | name: ${l.name} | system: ${l.system}`);
    });

  } catch (err) {
    console.error('Erreur globale:', err);
  }
}

main();
