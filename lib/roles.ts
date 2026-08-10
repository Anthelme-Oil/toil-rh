import 'server-only';
import { prisma } from './prisma';

export interface UserRoleRecord {
  id: string;
  name: string;
  email: string;
  role: 'EMPLOYE' | 'MANAGER' | 'RH' | 'ADMIN';
  managerEmail: string;
  isRH: boolean;
}

const DEFAULT_USERS: Omit<UserRoleRecord, 'id'>[] = [
  {
    name: 'Lino Lino',
    email: 'lino@gmail.com',
    role: 'ADMIN',
    managerEmail: '',
    isRH: true,
  },
  {
    name: 'IT Helpdesk',
    email: 'it_helpdesk@compel-toil.com',
    role: 'MANAGER',
    managerEmail: 'lino@gmail.com',
    isRH: false,
  },
  {
    name: 'Responsable RH',
    email: 'rh@compel-toil.com',
    role: 'RH',
    managerEmail: 'lino@gmail.com',
    isRH: true,
  },
  {
    name: 'Portail Test',
    email: 'portail_test@compel-toil.com',
    role: 'EMPLOYE',
    managerEmail: 'it_helpdesk@compel-toil.com',
    isRH: false,
  },
];

/**
 * Récupère tous les utilisateurs et leurs rôles depuis la base de données MySQL via Prisma
 */
export async function getAllUserRoles(): Promise<UserRoleRecord[]> {
  try {
    const dbUsers = await prisma.utilisateur.findMany({
      orderBy: {
        nom: 'asc',
      },
    });

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
      managerEmail: u.emailManager || '',
      isRH: u.estRH,
    }));
  } catch (error) {
    console.error('[Roles] Erreur lecture MySQL via Prisma:', error);
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
  managerEmail: string;
  name: string;
}> {
  if (!email) {
    return {
      role: 'EMPLOYE',
      isRH: false,
      isManager: false,
      isAdmin: false,
      managerEmail: '',
      name: '',
    };
  }

  const cleanEmail = email.toLowerCase().trim();
  const allRoles = await getAllUserRoles();
  const user = allRoles.find((u) => u.email.toLowerCase().trim() === cleanEmail);

  if (!user) {
    return {
      role: 'EMPLOYE',
      isRH: false,
      isManager: false,
      isAdmin: false,
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

  return {
    role: user.role,
    isRH,
    isManager,
    isAdmin,
    managerEmail: user.managerEmail,
    name: user.name,
  };
}

/**
 * Crée ou met à jour un utilisateur dans MySQL via Prisma
 */
export async function saveOrUpdateUserRole(data: {
  id?: string;
  name: string;
  email: string;
  role: 'EMPLOYE' | 'MANAGER' | 'RH' | 'ADMIN';
  managerEmail?: string;
  isRH?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanManagerEmail = (data.managerEmail || '').toLowerCase().trim();

    await prisma.utilisateur.upsert({
      where: { email: cleanEmail },
      update: {
        nom: data.name.trim(),
        role: data.role,
        emailManager: cleanManagerEmail,
        estRH: Boolean(data.isRH),
      },
      create: {
        nom: data.name.trim(),
        email: cleanEmail,
        role: data.role,
        emailManager: cleanManagerEmail,
        estRH: Boolean(data.isRH),
      },
    });

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
    await prisma.utilisateur.delete({
      where: { email: cleanEmail },
    });
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
      await prisma.utilisateur.upsert({
        where: { email: u.email },
        update: {
          nom: u.name,
          role: u.role,
          emailManager: u.managerEmail,
          estRH: u.isRH,
        },
        create: {
          nom: u.name,
          email: u.email,
          role: u.role,
          emailManager: u.managerEmail,
          estRH: u.isRH,
        },
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
