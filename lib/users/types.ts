export type UserRole = 'EMPLOYE' | 'MANAGER' | 'RH' | 'ADMIN' | 'DRH';

export interface InternalUser {
  id: string;
  nom: string;
  email: string;
  azure_id?: string | null;
  role: UserRole;
  est_rh: boolean;
  est_drh: boolean;
  est_com: boolean;
  email_manager?: string | null;
  cree_le?: Date | string | null;
  mis_a_jour_le?: Date | string | null;
}

export interface CreateInternalUserInput {
  id?: string;
  nom: string;
  email: string;
  azure_id?: string | null;
  role?: UserRole;
  est_rh?: boolean;
  est_com?: boolean;
}

export const ROLE_ACTIONS = [
  'ADMIN',
  'MANAGER',
  'RH',
  'EMPLOYE',
  'DRH',
  'COM',
] as const;

export type RoleAction = (typeof ROLE_ACTIONS)[number];