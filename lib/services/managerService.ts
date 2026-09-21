import { prisma } from '@/lib/prisma';

export interface UserContextData {
  id?: string;
  name?: string;
  displayName?: string;
  email?: string;
  userPrincipalName?: string;
  managerEmail?: string | null;
  manager?: {
    email?: string;
    displayName?: string;
  } | null;
}

export class ManagerService {
  /**
   * Extrait de manière sécurisée l'email du manager depuis le contexte utilisateur (useUser / Graph)
   */
  static getManagerEmail(user: UserContextData | null | undefined): string | null {
    if (!user) return null;

    const email = user.managerEmail || user.manager?.email || null;
    return email && email.trim() !== '' ? email.trim() : null;
  }

  /**
   * Vérifie si un utilisateur possède un supérieur hiérarchique configuré
   */
  static hasManager(user: UserContextData | null | undefined): boolean {
    return this.getManagerEmail(user) !== null;
  }

  /**
   * Résout les destinataires de la notification :
   * Renvoie le manager N+1 s'il est spécifié, sinon récupère TOUS les administrateurs système.
   */
  static async resolveApproverEmails(managerEmail?: string | null): Promise<{
    emails: string[];
    isFallbackToAdmin: boolean;
  }> {
    if (managerEmail && managerEmail.trim() !== '') {
      return {
        emails: [managerEmail.trim()],
        isFallbackToAdmin: false,
      };
    }

    // Aucun N+1 -> Récupération de tous les administrateurs du système
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });

    const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

    return {
      emails: adminEmails,
      isFallbackToAdmin: true,
    };
  }
}