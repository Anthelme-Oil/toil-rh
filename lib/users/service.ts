import {
  findUserByAzureId,
  findUserByEmail,
  createUser,
  updateUserAzureId,
  findAllUsers,
  updateUserRole as updateUserRoleRepository,
} from './repository';

import {
  normalizeAzureProfile,
  type AzureUserProfile,
} from '../azure/user';

import type { InternalUser,RoleAction } from './types';





export interface ResolveUserResult {
  user: InternalUser;
  isFirstLogin: boolean;
}

export async function resolveUserFromAzure(
  profile: AzureUserProfile
): Promise<ResolveUserResult | null> {
  const azureUser = normalizeAzureProfile(profile);

  if (!azureUser) {
    console.warn('[Users] Profil Azure sans adresse email.');
    return null;
  }

  const email = azureUser.email;

  /*
   * 1. Recherche prioritaire par email
   */
  let internalUser = await findUserByEmail(email);

  if (internalUser) {
    /*
     * L'utilisateur existe déjà.
     *
     * On conserve son rôle interne.
     * Microsoft ne doit jamais remplacer :
     *
     * EMPLOYE
     * MANAGER
     * RH
     * ADMIN
     */

    if (
      azureUser.id &&
      internalUser.azure_id !== azureUser.id
    ) {
      await updateUserAzureId(
        internalUser.id,
        azureUser.id
      );

      internalUser = {
        ...internalUser,
        azure_id: azureUser.id,
      };
    }

    return {
      user: internalUser,
      isFirstLogin: false,
    };
  }

  /*
   * 2. L'utilisateur n'existe pas par email.
   *
   * On vérifie maintenant son identité Azure.
   *
   * Si Microsoft nous a authentifiés et fournit une
   * identité valide, on peut créer l'utilisateur.
   */
  if (!azureUser.id) {
    console.warn(
      `[Users] Impossible de créer ${email}: identifiant Azure absent.`
    );

    return null;
  }

  /*
   * 3. Vérification supplémentaire par Azure ID.
   *
   * Cela évite de créer un doublon si l'email a changé
   * mais que l'identité Azure est la même.
   */
  internalUser = await findUserByAzureId(azureUser.id);

  if (internalUser) {
    return {
      user: internalUser,
      isFirstLogin: false,
    };
  }

  /*
   * 4. Première connexion.
   *
   * Nouveau compte interne => EMPLOYE.
   */
  const newUser = await createUser({
    id: crypto.randomUUID(),
    nom: azureUser.name || email.split('@')[0],
    email,
    azure_id: azureUser.id,
    role: 'EMPLOYE',
    est_rh: false,
    est_com: false,
  });

  return {
    user: newUser,
    isFirstLogin: true,
  };
}


export async function getAllUsers(): Promise<InternalUser[]> {
  return findAllUsers();
}




export async function updateUserRole(
  userId: string,
  action: RoleAction
): Promise<void> {
  if (!userId) {
    throw new Error("L'identifiant de l'utilisateur est requis.");
  }

  switch (action) {
    case 'ADMIN':
      await updateUserRoleRepository(userId, {
        role: 'ADMIN',
      });
      return;

    case 'EMPLOYE':
      await updateUserRoleRepository(userId, {
        role: 'EMPLOYE',
         est_rh: false,
         est_drh: false,
      });
      return;

    case 'MANAGER':
      await updateUserRoleRepository(userId, {
        role: 'MANAGER',
        // est_rh: false,
        // est_drh: false,
      });
      return;

    case 'RH':
      await updateUserRoleRepository(userId, {
        role: 'RH',
        est_rh: true,
        est_drh: false,
      });
      return;

    case 'DRH':
      await updateUserRoleRepository(userId, {
        role: 'DRH',
        est_rh: true,
        est_drh: true,
      });
      return;

    case 'COM':
      await updateUserRoleRepository(userId, {
        est_com: true,
        // est_rh: false,
        // est_drh: false,
      });
      return;

    default:
      throw new Error('Action de rôle invalide.');
  }
}