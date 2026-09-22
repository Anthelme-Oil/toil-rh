// ═══════════════════════════════════════════════════════════════
// NextAuth.js — Configuration Microsoft Entra ID (Azure AD) + Credentials + MySQL Sync via mysql2
// ═══════════════════════════════════════════════════════════════

import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import Credentials from 'next-auth/providers/credentials';
import { query, execute, generateId } from '../db';
import { getUserPermissionsByEmail } from '../roles';

// declare module 'next-auth' {
//   interface Session {
//     accessToken?: string;
//     user: {
//       id?: string;
//       name?: string | null;
//       email?: string | null;
//       image?: string | null;
//       role?: 'EMPLOYE' | 'MANAGER' | 'RH' | 'ADMIN' | 'DRH';
//       isRH?: boolean;
//       managerEmail?: string;
//       departement?: string;
//       profile?: any; // <-- Ajout pour stocker tout le profil Azure AD
//     };
//   }
// }

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
    Credentials({
      id: 'credentials',
      name: 'Connexion Directe / Démo',
      credentials: {
        email: { label: 'Email', type: 'text' },
      },
      async authorize(credentials) {
        const rawEmail = credentials?.email as string | undefined;
        if (!rawEmail) return null;

        const cleanEmail = rawEmail.toLowerCase().trim();
        
        const rows = await query<any>('SELECT * FROM utilisateurs WHERE email = ?', [cleanEmail]);
        
        const adminDefaultEmail = (process.env.ADMIN_EMAIL_DEFAULT || 'it.helpdesktogo@togosh.com').toLowerCase().trim();
        const isDefaultAdmin = cleanEmail === adminDefaultEmail;

        if (rows.length === 0 && !isDefaultAdmin) {
          console.warn(`[Auth] Tentative de connexion avec un e-mail non enregistré : ${cleanEmail}`);
          return null;
        }

        const dbUser = rows[0];
        const perms = await getUserPermissionsByEmail(cleanEmail);
        const displayName = dbUser?.nom || perms.name || cleanEmail.split('@')[0];
        const now = new Date();

        try {
          const sql = `
            INSERT INTO utilisateurs (id, nom, email, role, est_rh, est_com, cree_le, mis_a_jour_le)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              nom = VALUES(nom),
              mis_a_jour_le = VALUES(mis_a_jour_le)
          `;
          await execute(sql, [
            dbUser?.id || generateId(),
            displayName,
            cleanEmail,
            perms.role,
            perms.isRH ? 1 : 0,
            perms.isCom ? 1 : 0,
            dbUser?.cree_le || now,
            now,
          ]);
        } catch (e) {
          console.warn('[Auth] Avertissement upsert credentials:', e);
        }

        return {
          id: dbUser?.id || cleanEmail,
          email: cleanEmail,
          name: displayName,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('\n========================================');
      console.log('[AUTH] SIGN IN');
      console.log('========================================');
      console.log('[AUTH] Provider:', account?.provider);
      console.log('[AUTH] USER:', JSON.stringify(user, null, 2));
      console.log('[AUTH] PROFILE:', JSON.stringify(profile, null, 2));

      const email = user?.email?.toLowerCase().trim();
      if (!email) return false;

      const adminDefaultEmail = (process.env.ADMIN_EMAIL_DEFAULT || 'it.helpdesktogo@togosh.com').toLowerCase().trim();
      if (email === adminDefaultEmail) return true;

      if (account?.provider === 'azure-ad') {
        const expectedTenantId = process.env.AZURE_AD_TENANT_ID;
        const userTenantId = (profile as any)?.tid || (profile as any)?.tenantId;

        if (expectedTenantId && userTenantId && userTenantId !== expectedTenantId) {
          console.warn(`[Auth Reject] Tenant non autorisé pour ${email}`);
          return false;
        }

        try {
          const rows = await query<any>('SELECT id FROM utilisateurs WHERE email = ?', [email]);
          const existsInDb = rows.length > 0;
          const allowedDomains = ['togosh.com', 'togooil.com', 't-oil.tg'];
          const domain = email.split('@')[1];
          const isAllowedDomain = allowedDomains.includes(domain);

          if (!existsInDb && !isAllowedDomain) {
            console.warn(`[Auth Reject] Compte hors annuaire: ${email}`);
            return false;
          }
        } catch (err) {
          console.error("[Auth Reject] Erreur vérification annuaire:", err);
        }
      }

      return true;
    },

    async jwt({ token, account, profile, user }) {
      console.log('[JWT] Callback JWT exécuté.');

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // Stocker le profil Microsoft Graph complet dans le token pour inspection
      if (profile) {
        token?.profile = profile;
      }

      const email = user?.email || token.email;

      if (email) {
        try {
          const cleanEmail = email.toLowerCase().trim();
          const azureId = (profile?.sub || account?.providerAccountId || token.sub) as string | undefined;
          const displayName = user?.name || token.name || cleanEmail.split('@')[0];
          const now = new Date();

          const sql = `
            INSERT INTO utilisateurs (id, nom, email, azure_id, role, est_rh, est_com, cree_le, mis_a_jour_le)
            VALUES (?, ?, ?, ?, 'EMPLOYE', 0, 0, ?, ?)
            ON DUPLICATE KEY UPDATE
              nom = VALUES(nom),
              azure_id = COALESCE(VALUES(azure_id), azure_id),
              mis_a_jour_le = VALUES(mis_a_jour_le)
          `;

          await execute(sql, [
            generateId(),
            displayName,
            cleanEmail,
            azureId || null,
            now,
            now,
          ]);

          const rows = await query<any>('SELECT * FROM utilisateurs WHERE email = ?', [cleanEmail]);

          if (rows.length > 0) {
            const dbUser = rows[0];
            token.role = dbUser.role;
            token.isRH = Boolean(dbUser.est_rh);
            token.managerEmail = dbUser.email_manager || '';
            token.dbUserId = dbUser.id;
          }
        } catch (dbErr) {
          console.error('[Auth] Erreur MySQL:', dbErr);
        }
      }

      return token;
    },

    async session({ session, token }) {
      console.log('[SESSION] Callback session exécuté.');

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

      // Transmettre le profil Azure AD à la session client
      if (token.profile) {
        session.user.profile = token.profile;
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