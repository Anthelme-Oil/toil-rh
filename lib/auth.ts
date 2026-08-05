// ═══════════════════════════════════════════════════════════════
// NextAuth.js — Configuration Microsoft Entra ID (Azure AD)
// ═══════════════════════════════════════════════════════════════
//
// SSO avec Microsoft 365 via le provider Azure AD.
// Le token d'accès est conservé dans la session pour permettre
// les appels Graph "On-Behalf-Of" côté serveur.
// ═══════════════════════════════════════════════════════════════

import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

// Augmentation des types pour inclure l'accessToken
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      departement?: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          // Scopes nécessaires pour Graph API
          scope: [
            'openid',
            'profile',
            'email',
            'User.Read',
            'Sites.Read.All',
            'Files.Read.All',
          ].join(' '),
        },
      },
    }),
  ],

  callbacks: {
    /**
     * Callback JWT : conserve le token d'accès Microsoft
     * dans le JWT pour les appels Graph ultérieurs.
     */
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },

    /**
     * Callback Session : expose le token d'accès
     * dans l'objet session côté serveur uniquement.
     */
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // Cookie sécurisé en production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
});
