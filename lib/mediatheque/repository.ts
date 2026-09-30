
import { execute, query } from '../db';

import type {
  MediaDocument,
  MediaDocumentFilters,
  MediaDocumentQuery,
  MediaDocumentSort,
} from '@/types';

/**
 * Ligne retournée par MySQL.
 *
 * On garde volontairement les champs SQL séparés
 * avant de les transformer en MediaDocument.
 */
interface MediaDocumentRow {
  id: number;

  title: string;
  description: string | null;
  objective: string | null;

  department: string;
  category: string | null;
  format: string;
  extension: string;

  fileName: string;
  fileUrl: string;
  fileSize: number | string | null;

  version: string | null;

  previousVersionId: number | null;
  replacedById: number | null;

  status: string;
  isPublished: number | boolean;
  visibility: string;

  authorId: string | null;
  authorName: string | null;
  authorEmail: string | null;

  publishedById: string | null;
  publishedByName: string | null;
  publishedByEmail: string | null;

  publishedAt: Date | string | null;
  archivedAt: Date | string | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  views: number;
  downloads: number;

  tags: string | null;
}

/**
 * Résultat paginé.
 */
export interface MediaDocumentsRepositoryResult {
  documents: MediaDocument[];
  total: number;
}

/**
 * Mapping SQL -> MediaDocument
 */
function mapMediaDocument(
  row: MediaDocumentRow
): MediaDocument {
  let tags: string[] | undefined;

  if (row.tags) {
    try {
      const parsed = JSON.parse(row.tags);

      if (Array.isArray(parsed)) {
        tags = parsed.filter(
          (tag): tag is string =>
            typeof tag === 'string'
        );
      }
    } catch {
      tags = undefined;
    }
  }

  return {
    id: String(row.id),

    title: row.title,

    description:
      row.description ?? undefined,

    objective:
      row.objective ?? undefined,

    department:
      row.department as MediaDocument['department'],

    category:
      row.category as MediaDocument['category'],

    format:
      row.format as MediaDocument['format'],

    extension:
      row.extension,

    fileName:
      row.fileName,

    fileUrl:
      row.fileUrl,

    fileSize:
      row.fileSize !== null
        ? Number(row.fileSize)
        : undefined,

    version:
      row.version ?? undefined,

    tags,

    author:
      row.authorName
        ? {
            id:
              row.authorId ?? undefined,

            name:
              row.authorName,

            email:
              row.authorEmail ?? undefined,
          }
        : undefined,

    publishedBy:
      row.publishedByName
        ? {
            id:
              row.publishedById ?? undefined,

            name:
              row.publishedByName,

            email:
              row.publishedByEmail ?? undefined,
          }
        : undefined,

    publishedAt:
      row.publishedAt ?? undefined,

    updatedAt:
      row.updatedAt,

    createdAt:
      row.createdAt,

    views:
      Number(row.views ?? 0),

    downloads:
      Number(row.downloads ?? 0),

    status:
      row.status as MediaDocument['status'],

    isPublished:
      Boolean(row.isPublished),

    visibility:
      row.visibility as MediaDocument['visibility'],

    archivedAt:
      row.archivedAt ?? undefined,

    replacedById:
      row.replacedById !== null
        ? String(row.replacedById)
        : undefined,

    previousVersionId:
      row.previousVersionId !== null
        ? String(row.previousVersionId)
        : undefined,
  };
}

/**
 * Colonnes utilisées par les SELECT.
 *
 * On évite SELECT * pour garder la requête explicite
 * et stable si la table évolue.
 */
const SELECT_COLUMNS = `
  id,
  title,
  description,
  objective,
  department,
  category,
  format,
  extension,
  fileName,
  fileUrl,
  fileSize,
  version,
  previousVersionId,
  replacedById,
  status,
  isPublished,
  visibility,
  authorId,
  authorName,
  authorEmail,
  publishedById,
  publishedByName,
  publishedByEmail,
  publishedAt,
  archivedAt,
  createdAt,
  updatedAt,
  views,
  downloads,
  tags
`;

/**
 * Récupérer un document par son ID.
 */
export async function findMediaDocumentById(
  id: number
): Promise<MediaDocument | null> {
  const rows = await query<MediaDocumentRow>(
    `
      SELECT
        ${SELECT_COLUMNS}
      FROM mediaDocument
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapMediaDocument(rows[0]);
}

/**
 * Construire dynamiquement la partie WHERE.
 */
function buildWhereClause(
  filters: MediaDocumentFilters = {}
): {
  where: string;
  params: unknown[];
} {
  const conditions: string[] = [];
  const params: unknown[] = [];

  /**
   * Recherche globale.
   */
  if (filters.search?.trim()) {
    const search = `%${filters.search.trim()}%`;

    conditions.push(`
      (
        title LIKE ?
        OR description LIKE ?
        OR objective LIKE ?
        OR fileName LIKE ?
        OR authorName LIKE ?
      )
    `);

    params.push(
      search,
      search,
      search,
      search,
      search
    );
  }

  /**
   * Département.
   */
  if (
    filters.department &&
    filters.department !== 'ALL'
  ) {
    conditions.push(
      'department = ?'
    );

    params.push(
      filters.department
    );
  }

  /**
   * Catégorie.
   */
  if (
    filters.category &&
    filters.category !== 'ALL'
  ) {
    conditions.push(
      'category = ?'
    );

    params.push(
      filters.category
    );
  }

  /**
   * Format.
   */
  if (
    filters.format &&
    filters.format !== 'ALL'
  ) {
    conditions.push(
      'format = ?'
    );

    params.push(
      filters.format
    );
  }

  /**
   * Statut.
   */
  if (
    filters.status &&
    filters.status !== 'ALL'
  ) {
    conditions.push(
      'status = ?'
    );

    params.push(
      filters.status
    );
  }

  /**
   * Visibilité.
   */
  if (
    filters.visibility &&
    filters.visibility !== 'ALL'
  ) {
    conditions.push(
      'visibility = ?'
    );

    params.push(
      filters.visibility
    );
  }

  /**
   * Tag.
   *
   * Les tags sont stockés en JSON.
   * JSON_CONTAINS permet de rechercher
   * un tag précis.
   */
  if (filters.tag?.trim()) {
    conditions.push(
      'JSON_CONTAINS(tags, ?)'
    );

    params.push(
      JSON.stringify(
        filters.tag.trim()
      )
    );
  }

  /**
   * Date de début.
   */
  if (filters.dateFrom) {
    conditions.push(
      'publishedAt >= ?'
    );

    params.push(
      filters.dateFrom
    );
  }

  /**
   * Date de fin.
   */
  if (filters.dateTo) {
    conditions.push(
      'publishedAt <= ?'
    );

    params.push(
      filters.dateTo
    );
  }

  if (conditions.length === 0) {
    return {
      where: '',
      params,
    };
  }

  return {
    where: `
      WHERE ${conditions.join(
        '\nAND '
      )}
    `,
    params,
  };
}

/**
 * Retourne le ORDER BY correspondant
 * au tri demandé.
 *
 * IMPORTANT :
 * Les valeurs viennent d'un enum connu.
 * Elles ne sont jamais injectées directement
 * depuis une saisie utilisateur.
 */
function getOrderBy(
  sort: MediaDocumentSort = 'LATEST'
): string {
  switch (sort) {
    case 'OLDEST':
      return `
        publishedAt ASC,
        id ASC
      `;

    case 'MOST_VIEWED':
      return `
        views DESC,
        publishedAt DESC,
        id DESC
      `;

    case 'MOST_DOWNLOADED':
      return `
        downloads DESC,
        publishedAt DESC,
        id DESC
      `;

    case 'TITLE_ASC':
      return `
        title ASC,
        id ASC
      `;

    case 'TITLE_DESC':
      return `
        title DESC,
        id DESC
      `;

    case 'LATEST':
    default:
      return `
        publishedAt DESC,
        createdAt DESC,
        id DESC
      `;
  }
}

/**
 * Liste paginée des documents.
 */
export async function findMediaDocuments(
  queryParams: MediaDocumentQuery = {}
): Promise<MediaDocumentsRepositoryResult> {
  const page = Math.max(
    Number(queryParams.page ?? 1),
    1
  );

  const limit = Math.min(
    Math.max(
      Number(queryParams.limit ?? 9),
      1
    ),
    100
  );

  const offset =
    (page - 1) * limit;

  const {
    where,
    params,
  } = buildWhereClause(
    queryParams.filters
  );

  const orderBy =
    getOrderBy(
      queryParams.sort
    );

  /**
   * Documents.
   */
  const documents = await query<MediaDocumentRow>(
    `
      SELECT
        ${SELECT_COLUMNS}
      FROM mediaDocument
      ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `,
    [
      ...params,
      limit,
      offset,
    ]
  );

  /**
   * Total.
   */
  const countRows = await query<{
    total: number;
  }>(
    `
      SELECT
        COUNT(*) AS total
      FROM mediaDocument
      ${where}
    `,
    params
  );

  return {
    documents:
      documents.map(
        mapMediaDocument
      ),

    total:
      Number(
        countRows[0]?.total ?? 0
      ),
  };
}

/**
 * Créer un document.
 */
export async function createMediaDocument(
  data: {
    title: string;
    description?: string;
    objective?: string;

    department: string;
    category?: string;
    format: string;
    extension: string;

    fileName: string;
    fileUrl: string;
    fileSize?: number;

    version?: string;

    status?: string;
    isPublished?: boolean;
    visibility?: string;

    authorId?: string;
    authorName?: string;
    authorEmail?: string;

    publishedById?: string;
    publishedByName?: string;
    publishedByEmail?: string;

    publishedAt?: Date;

    tags?: string[];
  }
): Promise<MediaDocument> {
  const result = await execute(
    `
      INSERT INTO mediaDocument (
        title,
        description,
        objective,

        department,
        category,
        format,
        extension,

        fileName,
        fileUrl,
        fileSize,

        version,

        status,
        isPublished,
        visibility,

        authorId,
        authorName,
        authorEmail,

        publishedById,
        publishedByName,
        publishedByEmail,

        publishedAt,

        tags
      )
      VALUES (
        ?,
        ?,
        ?,

        ?,
        ?,
        ?,
        ?,

        ?,
        ?,
        ?,

        ?,

        ?,
        ?,
        ?,

        ?,
        ?,
        ?,

        ?,
        ?,
        ?,

        ?,

        ?
      )
    `,
    [
      data.title,
      data.description ?? null,
      data.objective ?? null,

      data.department,
      data.category ?? null,
      data.format,
      data.extension,

      data.fileName,
      data.fileUrl,
      data.fileSize ?? null,

      data.version ?? null,

      data.status ?? 'DRAFT',
      data.isPublished ? 1 : 0,
      data.visibility ?? 'PUBLIC',

      data.authorId ?? null,
      data.authorName ?? null,
      data.authorEmail ?? null,

      data.publishedById ?? null,
      data.publishedByName ?? null,
      data.publishedByEmail ?? null,

      data.publishedAt ?? null,

      JSON.stringify(
        data.tags ?? []
      ),
    ]
  );

  const created =
    await findMediaDocumentById(
      Number(result.insertId)
    );

  if (!created) {
    throw new Error(
      'MEDIA_DOCUMENT_CREATE_FAILED'
    );
  }

  return created;
}

/**
 * Mettre à jour un document.
 *
 * Seuls les champs fournis sont modifiés.
 */
export async function updateMediaDocument(
  id: number,
  data: {
    title?: string;
    description?: string;
    objective?: string;

    department?: string;
    category?: string;
    format?: string;
    extension?: string;

    fileName?: string;
    fileUrl?: string;
    fileSize?: number;

    version?: string;

    status?: string;
    isPublished?: boolean;
    visibility?: string;

    publishedById?: string;
    publishedByName?: string;
    publishedByEmail?: string;

    publishedAt?: Date | null;
    archivedAt?: Date | null;

    tags?: string[];

    previousVersionId?: number | null;
    replacedById?: number | null;
  }
): Promise<MediaDocument> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    params.push(data.title);
  }

  if (data.description !== undefined) {
    fields.push(
      'description = ?'
    );

    params.push(
      data.description
    );
  }

  if (data.objective !== undefined) {
    fields.push(
      'objective = ?'
    );

    params.push(
      data.objective
    );
  }

  if (data.department !== undefined) {
    fields.push(
      'department = ?'
    );

    params.push(
      data.department
    );
  }

  if (data.category !== undefined) {
    fields.push(
      'category = ?'
    );

    params.push(
      data.category
    );
  }

  if (data.format !== undefined) {
    fields.push(
      'format = ?'
    );

    params.push(
      data.format
    );
  }

  if (data.extension !== undefined) {
    fields.push(
      'extension = ?'
    );

    params.push(
      data.extension
    );
  }

  if (data.fileName !== undefined) {
    fields.push(
      'fileName = ?'
    );

    params.push(
      data.fileName
    );
  }

  if (data.fileUrl !== undefined) {
    fields.push(
      'fileUrl = ?'
    );

    params.push(
      data.fileUrl
    );
  }

  if (data.fileSize !== undefined) {
    fields.push(
      'fileSize = ?'
    );

    params.push(
      data.fileSize
    );
  }

  if (data.version !== undefined) {
    fields.push(
      'version = ?'
    );

    params.push(
      data.version
    );
  }

  if (data.status !== undefined) {
    fields.push(
      'status = ?'
    );

    params.push(
      data.status
    );
  }

  if (data.isPublished !== undefined) {
    fields.push(
      'isPublished = ?'
    );

    params.push(
      data.isPublished ? 1 : 0
    );
  }

  if (data.visibility !== undefined) {
    fields.push(
      'visibility = ?'
    );

    params.push(
      data.visibility
    );
  }

  if (data.publishedById !== undefined) {
    fields.push(
      'publishedById = ?'
    );

    params.push(
      data.publishedById
    );
  }

  if (data.publishedByName !== undefined) {
    fields.push(
      'publishedByName = ?'
    );

    params.push(
      data.publishedByName
    );
  }

  if (data.publishedByEmail !== undefined) {
    fields.push(
      'publishedByEmail = ?'
    );

    params.push(
      data.publishedByEmail
    );
  }

  if (data.publishedAt !== undefined) {
    fields.push(
      'publishedAt = ?'
    );

    params.push(
      data.publishedAt
    );
  }

  if (data.archivedAt !== undefined) {
    fields.push(
      'archivedAt = ?'
    );

    params.push(
      data.archivedAt
    );
  }

  if (data.tags !== undefined) {
    fields.push(
      'tags = ?'
    );

    params.push(
      JSON.stringify(
        data.tags
      )
    );
  }

  if (
    data.previousVersionId !==
    undefined
  ) {
    fields.push(
      'previousVersionId = ?'
    );

    params.push(
      data.previousVersionId
    );
  }

  if (
    data.replacedById !==
    undefined
  ) {
    fields.push(
      'replacedById = ?'
    );

    params.push(
      data.replacedById
    );
  }

  if (fields.length === 0) {
    const existing =
      await findMediaDocumentById(id);

    if (!existing) {
      throw new Error(
        'MEDIA_DOCUMENT_NOT_FOUND'
      );
    }

    return existing;
  }

  fields.push(
    'updatedAt = NOW()'
  );

  await execute(
    `
      UPDATE mediaDocument
      SET
        ${fields.join(',\n        ')}
      WHERE id = ?
    `,
    [
      ...params,
      id,
    ]
  );

  const updated =
    await findMediaDocumentById(id);

  if (!updated) {
    throw new Error(
      'MEDIA_DOCUMENT_NOT_FOUND'
    );
  }

  return updated;
}

/**
 * Publier un document.
 */
export async function publishMediaDocument(
  id: number,
  publisher?: {
    id?: string;
    name?: string;
    email?: string;
  }
): Promise<MediaDocument> {
  await execute(
    `
      UPDATE mediaDocument
      SET
        status = 'PUBLISHED',
        isPublished = 1,
        publishedAt = NOW(),
        publishedById = ?,
        publishedByName = ?,
        publishedByEmail = ?,
        updatedAt = NOW()
      WHERE id = ?
    `,
    [
      publisher?.id ?? null,
      publisher?.name ?? null,
      publisher?.email ?? null,
      id,
    ]
  );

  const document =
    await findMediaDocumentById(id);

  if (!document) {
    throw new Error(
      'MEDIA_DOCUMENT_NOT_FOUND'
    );
  }

  return document;
}

/**
 * Archiver un document.
 */
export async function archiveMediaDocument(
  id: number
): Promise<MediaDocument> {
  await execute(
    `
      UPDATE mediaDocument
      SET
        status = 'ARCHIVED',
        isPublished = 0,
        archivedAt = NOW(),
        updatedAt = NOW()
      WHERE id = ?
    `,
    [id]
  );

  const document =
    await findMediaDocumentById(id);

  if (!document) {
    throw new Error(
      'MEDIA_DOCUMENT_NOT_FOUND'
    );
  }

  return document;
}

/**
 * Supprimer définitivement.
 */
export async function deleteMediaDocument(
  id: number
): Promise<void> {
  await execute(
    `
      DELETE FROM mediaDocument
      WHERE id = ?
    `,
    [id]
  );
}

/**
 * Incrémenter les consultations.
 */
export async function incrementMediaDocumentViews(
  id: number
): Promise<void> {
  await execute(
    `
      UPDATE mediaDocument
      SET
        views = views + 1,
        updatedAt = updatedAt
      WHERE id = ?
    `,
    [id]
  );
}

/**
 * Incrémenter les téléchargements.
 */
export async function incrementMediaDocumentDownloads(
  id: number
): Promise<void> {
  await execute(
    `
      UPDATE mediaDocument
      SET
        downloads = downloads + 1,
        updatedAt = updatedAt
      WHERE id = ?
    `,
    [id]
  );
}

/**
 * Compter les documents publiés.
 */
export async function countPublishedMediaDocuments(): Promise<number> {
  const rows = await query<{
    total: number;
  }>(
    `
      SELECT COUNT(*) AS total
      FROM mediaDocument
      WHERE status = 'PUBLISHED'
        AND isPublished = 1
    `
  );

  return Number(
    rows[0]?.total ?? 0
  );
}

/**
 * Compter les documents par département.
 */
export async function countMediaDocumentsByDepartment(): Promise<
  Array<{
    department: string;
    total: number;
  }>
> {
  const rows = await query<{
    department: string;
    total: number;
  }>(
    `
      SELECT
        department,
        COUNT(*) AS total
      FROM mediaDocument
      WHERE status = 'PUBLISHED'
        AND isPublished = 1
      GROUP BY department
      ORDER BY department ASC
    `
  );

  return rows.map(
    (row) => ({
      department:
        row.department,

      total:
        Number(row.total),
    })
  );
}
