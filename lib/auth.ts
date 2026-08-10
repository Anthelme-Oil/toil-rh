// ═══════════════════════════════════════════════════════════════
// NextAuth.js — Configuration Microsoft Entra ID (Azure AD) + Prisma MySQL Sync
// ═══════════════════════════════════════════════════════════════

import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { prisma } from './prisma';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'EMPLOYE' | 'MANAGER' | 'RH' | 'ADMIN';
      isRH?: boolean;
      managerEmail?: string;
      departement?: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    MicrosoftEntraID({
      id: 'azure-ad',
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID || 'common'}/v2.0`,
      authorization: {
        params: {
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
     * Callback JWT : lors de la connexion Microsoft, upsert automatique dans MySQL 
     * et association avec le rôle / N+1 configuré par l'Admin.
     */
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      const email = user?.email || token.email;
      if (email) {
        try {
          const cleanEmail = email.toLowerCase().trim();
          const azureId = (profile?.sub || account?.providerAccountId || token.sub) as string | undefined;
          const displayName = user?.name || token.name || cleanEmail.split('@')[0];

          // Upsert dans MySQL sans écraser les rôles et le N+1 définis dans la page admin
          const dbUser = await prisma.utilisateur.upsert({
            where: { email: cleanEmail },
            update: {
              nom: displayName,
              ...(azureId ? { azureId } : {}),
            },
            create: {
              email: cleanEmail,
              nom: displayName,
              azureId,
              role: 'EMPLOYE',
              estRH: false,
            },
          });

          token.role = dbUser.role;
          token.isRH = dbUser.estRH;
          token.managerEmail = dbUser.emailManager || '';
          token.dbUserId = dbUser.id;
        } catch (dbErr) {
          console.error('[Auth] Erreur de synchronisation MySQL pour', email, dbErr);
        }
      }

      return token;
    },

    /**
     * Callback Session : transmet les rôles, permissions et N+1 à la session utilisateur
     */
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (token.sub || token.dbUserId) {
        session.user.id = (token.dbUserId || token.sub) as string;
      }
      if (token.role) {
        session.user.role = token.role as 'EMPLOYE' | 'MANAGER' | 'RH' | 'ADMIN';
      }
      if (token.isRH !== undefined) {
        session.user.isRH = Boolean(token.isRH);
      }
      if (token.managerEmail) {
        session.user.managerEmail = token.managerEmail as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

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
