const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
require('dotenv').config({ path: '.env.local' });

const TENANT_ID = process.env.AZURE_AD_TENANT_ID;
const CLIENT_ID = process.env.AZURE_AD_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET;

async function testEmail() {
  console.log('Azure Credentials:', { TENANT_ID, CLIENT_ID, hasSecret: !!CLIENT_SECRET });
  
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing credentials!');
    return;
  }

  const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  });

  const graphClient = Client.initWithMiddleware({ authProvider });

  // Use the sender email from the system settings, which is currently 'it.helpdesktogo@togosh.com'
  const senderEmail = 'it.helpdesktogo@togosh.com'; 
  const recipient = 'it.helpdesktogo@togosh.com';

  console.log(`Attempting to send email from ${senderEmail} to ${recipient}...`);

  try {
    const res = await graphClient.api(`/users/${senderEmail}/sendMail`).post({
      message: {
        subject: '[TEST DIRECT] Diagnostic Graph API',
        body: {
          contentType: 'HTML',
          content: '<h3>Test direct</h3><p>Ceci est un test direct pour diagnostiquer la configuration.</p>',
        },
        toRecipients: [
          {
            emailAddress: {
              address: recipient,
            },
          },
        ],
      },
      saveToSentItems: false,
    });

    console.log('Success! Email sent. Response:', res);
  } catch (error) {
    console.error('Detailed Error during sendMail:');
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Headers:', error.headers);
      console.error('Body details:', error.body);
    } else {
      console.error(error);
    }
  }
}

testEmail();
