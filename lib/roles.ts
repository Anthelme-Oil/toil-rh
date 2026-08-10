import 'server-only';
import { query, execute, generateId } from './db';

export interface UserRoleRecord {
  id: string;
  name: string;
  email: string;
  role: 'EMPLOYE' | 'MANAGER' | 'RH' | 'ADMIN';
  managerEmail: string;
  isRH: boolean;
  isCom: boolean;
}

const DEFAULT_USERS: Omit<UserRoleRecord, 'id'>[] = [
  {
    name: 'IT Helpdesk TogoSH',
    email: 'it.helpdesk@togosh.com',
    role: 'ADMIN',
    managerEmail: '',
    isRH: true,
    isCom: true,
  },
  {
    name: 'Lino Lino',
    email: 'lino@gmail.com',
    role: 'ADMIN',
    managerEmail: '',
    isRH: true,
    isCom: true,
  },
  {
    name: 'IT Helpdesk',
    email: 'it_helpdesk@compel-toil.com',
    role: 'MANAGER',
    managerEmail: 'it.helpdesk@togosh.com',
    isRH: false,
    isCom: false,
  },
  {
    name: 'Responsable RH',
    email: 'rh@compel-toil.com',
    role: 'RH',
    managerEmail: 'it.helpdesk@togosh.com',
    isRH: true,
    isCom: true,
  },
  {
    name: 'Portail Test',
    email: 'portail_test@compel-toil.com',
    role: 'EMPLOYE',
    managerEmail: 'it.helpdesk@togosh.com',
    isRH: false,
    isCom: false,
  },
];

/**
 * Récupère tous les utilisateurs et leurs rôles depuis la base MySQL via mysql2
 */
export async function getAllUserRoles(): Promise<UserRoleRecord[]> {
  try {
    const dbUsers = await query<any>(
      'SELECT id, nom, email, role, email_manager, est_rh, est_com FROM utilisateurs ORDER BY nom ASC'
    );

    if (dbUsers.length === 0) {
      console.log('[Roles] Base vide. Initialisation des utilisateurs par défaut...');
      await seedDefaultRolesToDatabase();
      return getAllUserRoles();
    }

    return dbUsers.map((u) => ({
      id: u.id,
      name: u.nom,
      email: u.email,
      role: u.role as UserRoleRecord['role'],
      managerEmail: u.email_manager || '',
      isRH: Boolean(u.est_rh),
      isCom: Boolean(u.est_com),
    }));
  } catch (error) {
    console.error('[Roles] Erreur lecture MySQL via mysql2:', error);
    return getFallbackUserRoles();
  }
}

/**
 * Obtenir les permissions dynamiques d'un utilisateur par son email
 */
export async function getUserPermissionsByEmail(email?: string | null): Promise<{
  role: 'EMPLOYE' | 'MANAGER' | 'RH' | 'ADMIN';
  isRH: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isCom: boolean;
  managerEmail: string;
  name: string;
}> {
  if (!email) {
    return {
      role: 'EMPLOYE',
      isRH: false,
      isManager: false,
      isAdmin: false,
      isCom: false,
      managerEmail: '',
      name: '',
    };
  }

  const cleanEmail = email.toLowerCase().trim();

  // Le compte it.helpdesk@togosh.com est toujours ADMIN par défaut
  if (cleanEmail === 'it.helpdesk@togosh.com') {
    return {
      role: 'ADMIN',
      isRH: true,
      isManager: true,
      isAdmin: true,
      isCom: true,
      managerEmail: '',
      name: 'IT Helpdesk (Admin)',
    };
  }

  const allRoles = await getAllUserRoles();
  const user = allRoles.find((u) => u.email.toLowerCase().trim() === cleanEmail);

  if (!user) {
    return {
      role: 'EMPLOYE',
      isRH: false,
      isManager: false,
      isAdmin: false,
      isCom: false,
      managerEmail: '',
      name: '',
    };
  }

  const isManager =
    user.role === 'MANAGER' ||
    user.role === 'ADMIN' ||
    allRoles.some((u) => u.managerEmail.toLowerCase().trim() === cleanEmail);
  const isRH = user.isRH || user.role === 'RH' || user.role === 'ADMIN';
  const isAdmin = user.role === 'ADMIN';
  const isCom = user.isCom || isRH || isAdmin;

  return {
    role: user.role,
    isRH,
    isManager,
    isAdmin,
    isCom,
    managerEmail: user.managerEmail,
    name: user.name,
  };
}

/**
 * Crée ou met à jour un utilisateur dans MySQL via mysql2
 */
export async function saveOrUpdateUserRole(data: {
  id?: string;
  name: string;
  email: string;
  role: 'EMPLOYE' | 'MANAGER' | 'RH' | 'ADMIN';
  managerEmail?: string;
  isRH?: boolean;
  isCom?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanManagerEmail = (data.managerEmail || '').toLowerCase().trim();
    const nameTrimmed = data.name.trim();
    const isRHNum = data.isRH ? 1 : 0;
    const isComNum = data.isCom ? 1 : 0;
    const now = new Date();

    const sql = `
      INSERT INTO utilisateurs (id, nom, email, role, email_manager, est_rh, est_com, cree_le, mis_a_jour_le)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nom = VALUES(nom),
        role = VALUES(role),
        email_manager = VALUES(email_manager),
        est_rh = VALUES(est_rh),
        est_com = VALUES(est_com),
        mis_a_jour_le = VALUES(mis_a_jour_le)
    `;

    await execute(sql, [
      data.id || generateId(),
      nameTrimmed,
      cleanEmail,
      data.role,
      cleanManagerEmail,
      isRHNum,
      isComNum,
      now,
      now,
    ]);

    return { success: true };
  } catch (err: unknown) {
    console.error('[Roles] Erreur sauvegarde utilisateur dans MySQL:', err);
    const msg = err instanceof Error ? err.message : 'Erreur base de données';
    return { success: false, error: msg };
  }
}

/**
 * Supprime un utilisateur de la base MySQL
 */
export async function deleteUserRole(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    await execute('DELETE FROM utilisateurs WHERE email = ?', [cleanEmail]);
    return { success: true };
  } catch (err: unknown) {
    console.error('[Roles] Erreur suppression utilisateur MySQL:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Erreur suppression' };
  }
}

/**
 * Seeding initial des utilisateurs par défaut dans MySQL
 */
export async function seedDefaultRolesToDatabase(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    let count = 0;
    for (const u of DEFAULT_USERS) {
      await saveOrUpdateUserRole({
        name: u.name,
        email: u.email,
        role: u.role,
        managerEmail: u.managerEmail,
        isRH: u.isRH,
        isCom: u.isCom,
      });
      count++;
    }
    return { success: true, count };
  } catch (err) {
    console.error('[Roles] Erreur Seeding MySQL:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Erreur seeding' };
  }
}

/**
 * Fallback local si la base de données n'est pas encore connectée
 */
function getFallbackUserRoles(): UserRoleRecord[] {
  return DEFAULT_USERS.map((u, idx) => ({
    id: `local-${idx + 1}`,
    ...u,
  }));
}
