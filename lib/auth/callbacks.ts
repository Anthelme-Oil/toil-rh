import type { Account, Profile, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

import {
  createUser,
  findUserByEmail,
  updateUserAzureId,
} from '../users/repository';
import {
  clearPendingLoginEmail,
  getPendingLoginEmail,
} from './login-intent';

const ALLOWED_DOMAINS = [
  'togosh.com',
  'togooil.com',
  't-oil.tg',
];

function normalizeEmail(email?: string | null): string | null {
  if (!email) {
    return null;
  }

  return email.toLowerCase().trim();
}

function isAllowedEmailDomain(email: string): boolean {
  const domain = email.split('@')[1];

  return Boolean(
    domain && ALLOWED_DOMAINS.includes(domain)
  );
}

// export async function signInCallback({
//   user,
//   account,
//   profile,
// }: {
//   user: User;
//   account?: Account | null;
//   profile?: Profile;
// }) {
//   // Les autres providers restent autorisés.
//   if (account?.provider !== 'azure-ad') {
//     return true;
//   }

//   // Email saisi avant le démarrage de l'authentification Microsoft.
//   const pendingEmail = await getPendingLoginEmail();

//   // Email réellement authentifié par Microsoft Entra ID.
//   const microsoftEmail = normalizeEmail(
//     user?.email ||
//       profile?.email ||
//       profile?.preferred_username
//   );

//   if (!pendingEmail || !microsoftEmail) {
//     await clearPendingLoginEmail();
//     return false;
//   }

//   const requestedEmail = normalizeEmail(pendingEmail);

//   if (!requestedEmail) {
//     await clearPendingLoginEmail();
//     return false;
//   }

//   // L'email saisi doit correspondre à l'identité
//   // réellement authentifiée par Microsoft.
//   if (requestedEmail !== microsoftEmail) {
//     await clearPendingLoginEmail();
//     return false;
//   }

//   await clearPendingLoginEmail();

//   return true;
// }



export async function signInCallback({
  user,
  account,
  profile,
}: {
  user: User;
  account?: Account | null;
  profile?: Profile;
}) {
  // Les autres providers restent autorisés.
  if (account?.provider !== 'azure-ad') {
    return true;
  }

  // Email saisi avant le démarrage de l'authentification Microsoft.
  const pendingEmail = await getPendingLoginEmail();

  // Email réellement authentifié par Microsoft Entra ID.
  const microsoftEmail = normalizeEmail(
    user?.email ||
      profile?.email ||
      profile?.preferred_username
  );

  if (!pendingEmail || !microsoftEmail) {
    await clearPendingLoginEmail();
    return false;
  }

  const requestedEmail = normalizeEmail(pendingEmail);

  if (!requestedEmail) {
    await clearPendingLoginEmail();
    return false;
  }

  // L'email saisi doit correspondre à l'identité
  // réellement authentifiée par Microsoft.
  if (requestedEmail !== microsoftEmail) {
    await clearPendingLoginEmail();
    return false;
  }

  /*
   * À partir d'ici, Microsoft a authentifié
   * l'utilisateur et l'email correspond.
   *
   * On synchronise maintenant notre table utilisateurs.
   */

  let dbUser = await findUserByEmail(
    microsoftEmail
  );
if (!dbUser) {
  dbUser = await createUser({
    nom: user?.name || profile?.name || microsoftEmail,
    email: microsoftEmail,
    azure_id: account?.providerAccountId ?? null,
    role: 'EMPLOYE',
    est_rh: false,
    est_com: false,
  });
} else if (
  account?.providerAccountId &&
  dbUser.azure_id !== account.providerAccountId
) {
  await updateUserAzureId(
    dbUser.id,
    account.providerAccountId
  );
}

  await clearPendingLoginEmail();

  return true;
}





export async function jwtCallback({
  token,
  user,
  account,
  profile,
}: {
  token: JWT;
  user?: User;
  account?: Account | null;
  profile?: Profile;
}) {
  if (account?.provider === 'azure-ad') {
    const email = normalizeEmail(
      user?.email ||
        profile?.email ||
        profile?.preferred_username
    );

    if (!email) {
      return token;
    }

    const dbUser = await findUserByEmail(email);
//     const azureProfile = normalizeAzureProfile(
//   profile as AzureUserProfile
// );

// token.profile = azureProfile;

    if (dbUser) {
      token.dbUserId = dbUser.id;
      token.role = dbUser.role;
      token.isRH = dbUser.est_rh;
      token.isCom = dbUser.est_com;
      token.managerEmail = dbUser.email_manager;
      // token.profile = dbUser.profile;
    }
  }

  return token;
}

export async function sessionCallback({
  session,
  token,
}: {
  session: any;
  token: JWT;
}) {
  if (session.user) {
    session.user.id = token.dbUserId;
    session.user.role = token.role;
    session.user.isRH = token.isRH;
    session.user.isCom = token.isCom;
    session.user.managerEmail = token.managerEmail;
    session.user.profile = token.profile;
  }

  return session;
}