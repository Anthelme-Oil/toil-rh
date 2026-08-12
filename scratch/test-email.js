const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

async function testSendMail() {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
  const senderEmail = 'it.helpdesktogo@togosh.com';

  console.log('Tenant:', tenantId);
  console.log('Client ID:', clientId);
  console.log('Sender Email:', senderEmail);

  try {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });

    const graphClient = Client.initWithMiddleware({ authProvider });

    const response = await graphClient.api(`/users/${senderEmail}/sendMail`).post({
      message: {
        subject: 'Test Email Direct Microsoft Graph',
        body: {
          contentType: 'HTML',
          content: '<h3>Ceci est un test direct de l\'API Microsoft Graph</h3>',
        },
        toRecipients: [
          {
            emailAddress: {
              address: 'it.helpdesktogo@togosh.com',
            },
          },
        ],
      },
      saveToSentItems: false,
    });

    console.log('SUCCÈS ENVOI MAIL Graph API:', response);
  } catch (err) {
    console.error('ÉCHEC ENVOI MAIL Graph API:', err);
  }
}

testSendMail();
