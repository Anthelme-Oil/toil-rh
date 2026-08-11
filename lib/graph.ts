// ═══════════════════════════════════════════════════════════════
// Microsoft Graph Client — Connexion sécurisée côté serveur
// ═══════════════════════════════════════════════════════════════
//
// Ce module initialise le client Microsoft Graph avec les
// identifiants Azure AD (Application Registration).
// Il utilise le flux Client Credentials (app-only) pour les
// opérations serveur, et le flux On-Behalf-Of pour les requêtes
// au nom de l'utilisateur connecté.
// ═══════════════════════════════════════════════════════════════

import 'server-only';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

// ── Variables d'environnement Azure AD ──
const TENANT_ID = process.env.AZURE_AD_TENANT_ID;
const CLIENT_ID = process.env.AZURE_AD_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET;

// ── SharePoint site identifiers ──
export const SHAREPOINT_SITE_ID = process.env.SHAREPOINT_SITE_ID;
export const SHAREPOINT_HOSTNAME = process.env.SHAREPOINT_HOSTNAME || 'votre-domaine.sharepoint.com';

// ── Microsoft Lists IDs ──
export const LIST_ACTUALITES_ID = process.env.LIST_ACTUALITES_ID || 'Actualites';
export const LIST_DEMANDES_ID = process.env.LIST_DEMANDES_ID || 'DemandesInternes';
export const LIST_CONGES_ID = process.env.LIST_CONGES_ID || 'e8b6d5aa-a928-46eb-b70f-7ed51cc64efd';
export const LIST_EVENEMENTS_ID = process.env.LIST_EVENEMENTS_ID || 'Evenements';
export const LIST_ANNONCES_ID = process.env.LIST_ANNONCES_ID || 'Annonces';
export const LIST_ROLES_ID = process.env.LIST_ROLES_ID || 'Autorisation par utilisateurs';

// ── Bibliothèques documentaires ──
export const DRIVE_PROCEDURES_IT = process.env.DRIVE_PROCEDURES_IT || 'Procedures_IT';
export const DRIVE_PROCEDURES_RH = process.env.DRIVE_PROCEDURES_RH || 'Procedures_RH';
// Bibliothèque pour les images de couverture des articles de blog (ex: "T-oil Intranet Files")
export const DRIVE_BLOG_IMAGES = process.env.DRIVE_BLOG_IMAGES || process.env.DRIVE_PROCEDURES_IT || 'Procedures_IT';

/**
 * Vérifie si les identifiants Azure AD et SharePoint sont configurés.
 */
export function isGraphConfigured(): boolean {
  return Boolean(TENANT_ID && CLIENT_ID && CLIENT_SECRET && SHAREPOINT_SITE_ID);
}

/**
 * Crée un client Graph avec le flux Client Credentials (app-only).
 * Utilisé pour les opérations serveur qui ne nécessitent pas
 * le contexte d'un utilisateur spécifique.
 */
export function getGraphClient(): Client | null {
  if (!isGraphConfigured()) {
    return null;
  }

  try {
    const credential = new ClientSecretCredential(
      TENANT_ID!,
      CLIENT_ID!,
      CLIENT_SECRET!
    );

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });

    return Client.initWithMiddleware({
      authProvider,
      debugLogging: process.env.NODE_ENV === 'development',
    });
  } catch (err) {
    console.error('[Microsoft Graph] Échec d\'initialisation du client:', err);
    return null;
  }
}

/**
 * Crée un client Graph avec un token d'accès utilisateur (OBO).
 * Utilisé pour les requêtes au nom de l'utilisateur connecté,
 * respectant ainsi ses permissions M365.
 *
 * @param accessToken - Le token JWT de l'utilisateur depuis NextAuth
 */
export function getGraphClientOnBehalfOf(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

/**
 * Helper pour construire l'URL de base du site SharePoint.
 */
export function getSiteApiBase(): string {
  if (!SHAREPOINT_SITE_ID) return '/sites/unconfigured';
  return `/sites/${SHAREPOINT_SITE_ID}`;
}
