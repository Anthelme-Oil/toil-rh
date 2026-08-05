import 'server-only';
import { getGraphClient, getSiteApiBase } from './graph';

export type UserRole = 'ADMIN' | 'RH' | 'MANAGER' | 'EMPLOYE';

export interface UserPermissions {
  role: UserRole;
  isRH: boolean;
  isManager: boolean;
  isAdmin: boolean;
}

const LIST_ROLES_ID = process.env.LIST_ROLES_ID || 'Configuration_Roles';

/**
 * Interroge la liste SharePoint "Configuration_Roles" pour obtenir le rôle de l'utilisateur.
 * Si l'utilisateur n'y est pas renseigné, son rôle par défaut est "EMPLOYE".
 */
export async function getUserPermissions(email: string): Promise<UserPermissions> {
  if (!email) {
    return { role: 'EMPLOYE', isRH: false, isManager: false, isAdmin: false };
  }

  const graphClient = getGraphClient();
  if (!graphClient) {
    return { role: 'EMPLOYE', isRH: false, isManager: false, isAdmin: false };
  }

  const siteBase = getSiteApiBase();

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_ROLES_ID}/items`)
      .expand('fields')
      .get();

    const items = response.value || [];
    const matched = items.find((item: Record<string, unknown>) => {
      const f = (item.fields || {}) as Record<string, string>;
      const itemEmail = (f.Email || f.EmailUser || f.Title || '').toLowerCase().trim();
      return itemEmail === email.toLowerCase().trim();
    });

    if (matched) {
      const fields = matched.fields as Record<string, string>;
      const rawRole = (fields.Role || fields.R_x00f4_le || fields.Rôle || fields.Title || '').toUpperCase().trim();

      const isRH = rawRole.includes('RH') || rawRole.includes('DRH');
      const isManager = rawRole.includes('RESPONSABLE') || rawRole.includes('MANAGER') || rawRole.includes('CHEF') || rawRole.includes('N1') || isRH;
      const isAdmin = rawRole.includes('ADMIN');

      const role: UserRole = isAdmin ? 'ADMIN' : isRH ? 'RH' : isManager ? 'MANAGER' : 'EMPLOYE';

      return {
        role,
        isRH: isRH || isAdmin,
        isManager: isManager || isAdmin,
        isAdmin,
      };
    }
  } catch (error) {
    console.warn(`[Roles] Erreur lecture liste ${LIST_ROLES_ID}, rôle par défaut attribué (EMPLOYE).`, error);
  }

  return {
    role: 'EMPLOYE',
    isRH: false,
    isManager: false,
    isAdmin: false,
  };
}
