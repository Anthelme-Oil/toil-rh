import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import Credentials from 'next-auth/providers/credentials';

import { query } from '../db';
import { getUserPermissionsByEmail } from '../roles';
import { createUser } from '../users/repository';

export const authProviders = [
  MicrosoftEntraID({
    id: 'azure-ad',

    clientId: process.env.AZURE_AD_CLIENT_ID || '',

    clientSecret:
      process.env.AZURE_AD_CLIENT_SECRET || '',

    issuer:
      `https://login.microsoftonline.com/` +
      `${process.env.AZURE_AD_TENANT_ID || 'common'}/v2.0`,

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
      email: {
        label: 'Email',
        type: 'text',
      },
    },

    async authorize(credentials) {
      const rawEmail = credentials?.email as
        | string
        | undefined;

      if (!rawEmail) {
        return null;
      }

      const email = rawEmail.toLowerCase().trim();

      const adminDefaultEmail = (
        process.env.ADMIN_EMAIL_DEFAULT ||
        'it.helpdesktogo@togosh.com'
      )
        .toLowerCase()
        .trim();

      const rows = await query<any>(
        `
          SELECT *
          FROM utilisateurs
          WHERE LOWER(email) = ?
          LIMIT 1
        `,
        [email]
      );

      const isDefaultAdmin =
        email === adminDefaultEmail;

      if (rows.length === 0 && !isDefaultAdmin) {
        console.warn(
          `[Auth] Email non enregistré: ${email}`
        );

        return null;
      }

      const dbUser = rows[0];

      const permissions =
        await getUserPermissionsByEmail(email);

      const displayName =
        dbUser?.nom ||
        permissions.name ||
        email.split('@')[0];

      if (!dbUser && isDefaultAdmin) {
        const newUser = await createUser({
          id: crypto.randomUUID(),
          nom: displayName,
          email,
          role: 'ADMIN',
          est_rh: true,
          est_com: false,
        });

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.nom,
          role: newUser.role,
          isRH: newUser.est_rh,
          isCom: newUser.est_com,
          dbUserId: newUser.id,
        };
      }

      if (!dbUser) {
        return null;
      }

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.nom,
        role: permissions.role || dbUser.role,
        isRH: Boolean(dbUser.est_rh),
        isCom: Boolean(dbUser.est_com),
        dbUserId: dbUser.id,
      };
    },
  }),
];