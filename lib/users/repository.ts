import { execute, generateId, query } from '../db';
import type {
  CreateInternalUserInput,
  InternalUser,
} from './types'

export async function findUserByEmail(
  email: string
): Promise<InternalUser | null> {
  const rows = await query<any>(
    `
      SELECT
        id,
        nom,
        email,
        azure_id,
        role,
        est_rh,
        est_com,
        email_manager,
        cree_le,
        mis_a_jour_le
      FROM utilisateurs
      WHERE LOWER(email) = ?
      LIMIT 1
    `,
    [email.toLowerCase().trim()]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapDatabaseUser(rows[0]);
}

export async function findUserByAzureId(
  azureId: string
): Promise<InternalUser | null> {
  const rows = await query<any>(
    `
      SELECT
        id,
        nom,
        email,
        azure_id,
        role,
        est_rh,
        est_com,
        email_manager,
        cree_le,
        mis_a_jour_le
      FROM utilisateurs
      WHERE azure_id = ?
      LIMIT 1
    `,
    [azureId]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapDatabaseUser(rows[0]);
}

export async function createUser(
  input: CreateInternalUserInput
): Promise<InternalUser> {
  const now = new Date();

  await execute(
    `
      INSERT INTO utilisateurs (
        id,
        nom,
        email,
        azure_id,
        role,
        est_rh,
        est_com,
        cree_le,
        mis_a_jour_le
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.id || generateId(),
      input.nom,
      input.email,
      input.azure_id ?? null,
      input.role ?? 'EMPLOYE',
      input.est_rh ? 1 : 0,
      input.est_com ? 1 : 0,
      now,
      now,
    ]
  );

  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error(
      `Utilisateur créé mais introuvable ensuite: ${input.email}`
    );
  }

  return user;
}

export async function updateUserAzureId(
  userId: string,
  azureId: string
): Promise<void> {
  await execute(
    `
      UPDATE utilisateurs
      SET
        azure_id = ?,
        mis_a_jour_le = ?
      WHERE id = ?
    `,
    [azureId, new Date(), userId]
  );
}

function mapDatabaseUser(row: any): InternalUser {
  return {
    id: String(row.id),
    nom: row.nom ?? '',
    email: row.email ?? '',
    azure_id: row.azure_id ?? null,
    role: row.role,
    est_rh: Boolean(row.est_rh),
    est_drh: Boolean(row.est_drh),
    est_com: Boolean(row.est_com),
    email_manager: row.email_manager ?? null,
    cree_le: row.cree_le ?? null,
    mis_a_jour_le: row.mis_a_jour_le ?? null,
  };
}



export async function findAllUsers(): Promise<InternalUser[]> {
  const rows = await query<any>(`
    SELECT
      id,
      nom,
      email,
      azure_id,
      role,
      est_rh,
      est_drh,
      est_com,
      email_manager,
      cree_le,
      mis_a_jour_le
    FROM utilisateurs
    ORDER BY nom ASC
  `);

  return rows.map(mapDatabaseUser);
}


export async function updateUserRole(
  userId: string,
  data: {
    role?: string;
    est_rh?: boolean;
    est_drh?: boolean;
    est_com?: boolean;
  }
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.role !== undefined) {
    fields.push('role = ?');
    values.push(data.role);
  }

  if (data.est_rh !== undefined) {
    fields.push('est_rh = ?');
    values.push(data.est_rh ? 1 : 0);
  }

  if (data.est_drh !== undefined) {
    fields.push('est_drh = ?');
    values.push(data.est_drh ? 1 : 0);
  }

  if (data.est_com !== undefined) {
    fields.push('est_com = ?');
    values.push(data.est_com ? 1 : 0);
  }

  if (fields.length === 0) {
    return;
  }

  fields.push('mis_a_jour_le = ?');
  values.push(new Date());

  values.push(userId);

  await execute(
    `
      UPDATE utilisateurs
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    values
  );
}