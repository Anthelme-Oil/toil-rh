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
const TENANT_ID = process.env.AZURE_AD_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_AD_CLIENT_ID!;
const CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET!;

// ── SharePoint site identifiers ──
export const SHAREPOINT_SITE_ID = process.env.SHAREPOINT_SITE_ID!;
export const SHAREPOINT_HOSTNAME = process.env.SHAREPOINT_HOSTNAME || 'votre-domaine.sharepoint.com';

// ── Microsoft Lists IDs ──
export const LIST_ACTUALITES_ID = process.env.LIST_ACTUALITES_ID || 'Actualites';
export const LIST_DEMANDES_ID = process.env.LIST_DEMANDES_ID || 'DemandesInternes';
export const LIST_EVENEMENTS_ID = process.env.LIST_EVENEMENTS_ID || 'Evenements';
export const LIST_ANNONCES_ID = process.env.LIST_ANNONCES_ID || 'Annonces';

// ── Bibliothèques documentaires ──
export const DRIVE_PROCEDURES_IT = process.env.DRIVE_PROCEDURES_IT || 'Procedures_IT';
export const DRIVE_PROCEDURES_RH = process.env.DRIVE_PROCEDURES_RH || 'Procedures_RH';

/**
 * Crée un client Graph avec le flux Client Credentials (app-only).
 * Utilisé pour les opérations serveur qui ne nécessitent pas
 * le contexte d'un utilisateur spécifique.
 */
export function getGraphClient(): Client {
  const credential = new ClientSecretCredential(
    TENANT_ID,
    CLIENT_ID,
    CLIENT_SECRET
  );

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  });

  return Client.initWithMiddleware({
    authProvider,
    debugLogging: process.env.NODE_ENV === 'development',
  });
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
  return `/sites/${SHAREPOINT_SITE_ID}`;
}
