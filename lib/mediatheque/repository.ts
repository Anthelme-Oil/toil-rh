import { prisma, withRetry } from '@/lib/prisma';
import type {
  MediaDocument,
  MediaDocumentFilters,
  MediaDocumentQuery,
  MediaDocumentSort,
} from '@/types';
import type { Prisma } from '@prisma/client';

export interface MediaDocumentsRepositoryResult {
  documents: MediaDocument[];
  total: number;
}

/**
 * Mapper l'objet retourné par Prisma vers le type MediaDocument applicatif
 */
function mapToMediaDocument(doc: any): MediaDocument {
  let tags: string[] | undefined;

  if (doc.tags) {
    try {
      const parsed = typeof doc.tags === 'string' ? JSON.parse(doc.tags) : doc.tags;
      if (Array.isArray(parsed)) {
        tags = parsed.filter((tag): tag is string => typeof tag === 'string');
      }
    } catch {
      tags = undefined;
    }
  }

  return {
    id: String(doc.id),
    title: doc.title,
    description: doc.description ?? undefined,
    objective: doc.objective ?? undefined,
    department: doc.department as MediaDocument['department'],
    category: doc.category as MediaDocument['category'],
    format: doc.format as MediaDocument['format'],
    extension: doc.extension,
    fileName: doc.fileName,
    fileUrl: doc.fileUrl,
    fileSize: doc.fileSize !== null ? Number(doc.fileSize) : undefined,
    version: doc.version ?? undefined,
    tags,
    author: doc.authorName
      ? {
          id: doc.authorId ?? undefined,
          name: doc.authorName,
          email: doc.authorEmail ?? undefined,
        }
      : undefined,
    publishedBy: doc.publishedByName
      ? {
          id: doc.publishedById ?? undefined,
          name: doc.publishedByName,
          email: doc.publishedByEmail ?? undefined,
        }
      : undefined,
    publishedAt: doc.publishedAt ?? undefined,
    updatedAt: doc.updatedAt,
    createdAt: doc.createdAt,
    views: Number(doc.views ?? 0),
    downloads: Number(doc.downloads ?? 0),
    status: doc.status as MediaDocument['status'],
    isPublished: Boolean(doc.isPublished),
    visibility: doc.visibility as MediaDocument['visibility'],
    archivedAt: doc.archivedAt ?? undefined,
    replacedById: doc.replacedById !== null ? String(doc.replacedById) : undefined,
    previousVersionId:
      doc.previousVersionId !== null ? String(doc.previousVersionId) : undefined,
  };
}

/**
 * Filtres Prisma
 */
function buildPrismaWhere(filters: MediaDocumentFilters = {}): Prisma.MediaDocumentWhereInput {
  const where: Prisma.MediaDocumentWhereInput = {};

  if (filters.search?.trim()) {
    const search = filters.search.trim();
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { objective: { contains: search } },
      { fileName: { contains: search } },
      { authorName: { contains: search } },
    ];
  }

  if (filters.department && filters.department !== 'ALL') {
    where.department = filters.department;
  }

  if (filters.category && filters.category !== 'ALL') {
    where.category = filters.category;
  }

  if (filters.format && filters.format !== 'ALL') {
    where.format = filters.format;
  }

  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status;
  }

  if (filters.visibility && filters.visibility !== 'ALL') {
    where.visibility = filters.visibility;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.publishedAt = {
      ...(filters.dateFrom && { gte: filters.dateFrom }),
      ...(filters.dateTo && { lte: filters.dateTo }),
    };
  }

  return where;
}

/**
 * Tri Prisma
 */
function getPrismaOrderBy(
  sort: MediaDocumentSort = 'LATEST'
): Prisma.MediaDocumentOrderByWithRelationInput[] {
  switch (sort) {
    case 'OLDEST':
      return [{ publishedAt: 'asc' }, { id: 'asc' }];
    case 'MOST_VIEWED':
      return [{ views: 'desc' }, { publishedAt: 'desc' }, { id: 'desc' }];
    case 'MOST_DOWNLOADED':
      return [{ downloads: 'desc' }, { publishedAt: 'desc' }, { id: 'desc' }];
    case 'TITLE_ASC':
      return [{ title: 'asc' }, { id: 'asc' }];
    case 'TITLE_DESC':
      return [{ title: 'desc' }, { id: 'desc' }];
    case 'LATEST':
    default:
      return [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }];
  }
}

/**
 * Récupérer un document par son ID
 */
export async function findMediaDocumentById(id: number): Promise<MediaDocument | null> {
  return withRetry(async () => {
    const doc = await prisma.mediaDocument.findUnique({
      where: { id },
    });
    if (!doc) return null;
    return mapToMediaDocument(doc);
  });
}

/**
 * Liste paginée des documents
 */
export async function findMediaDocuments(
  queryParams: MediaDocumentQuery = {}
): Promise<MediaDocumentsRepositoryResult> {
  return withRetry(async () => {
    const page = Math.max(Number(queryParams.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(queryParams.limit ?? 9), 1), 100);
    const skip = (page - 1) * limit;

    const where = buildPrismaWhere(queryParams.filters);
    const orderBy = getPrismaOrderBy(queryParams.sort);

    const [documents, total] = await Promise.all([
      prisma.mediaDocument.findMany({
        where,
        orderBy,
        take: limit,
        skip,
      }),
      prisma.mediaDocument.count({ where }),
    ]);

    return {
      documents: documents.map(mapToMediaDocument),
      total,
    };
  });
}

/**
 * Créer un document
 */
export async function createMediaDocument(data: {
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
}): Promise<MediaDocument> {
  return withRetry(async () => {
    const created = await prisma.mediaDocument.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        objective: data.objective ?? null,
        department: data.department,
        category: data.category ?? null,
        format: data.format,
        extension: data.extension,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize ? BigInt(data.fileSize) : null,
        version: data.version ?? null,
        status: data.status ?? 'DRAFT',
        isPublished: data.isPublished ?? false,
        visibility: data.visibility ?? 'PUBLIC',
        authorId: data.authorId ?? null,
        authorName: data.authorName ?? null,
        authorEmail: data.authorEmail ?? null,
        publishedById: data.publishedById ?? null,
        publishedByName: data.publishedByName ?? null,
        publishedByEmail: data.publishedByEmail ?? null,
        publishedAt: data.publishedAt ?? null,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
      },
    });

    return mapToMediaDocument(created);
  });
}

/**
 * Mettre à jour un document
 */
export async function updateMediaDocument(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    objective: string;
    department: string;
    category: string;
    format: string;
    extension: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    version: string;
    status: string;
    isPublished: boolean;
    visibility: string;
    publishedById: string;
    publishedByName: string;
    publishedByEmail: string;
    publishedAt: Date | null;
    archivedAt: Date | null;
    tags: string[];
    previousVersionId: number | null;
    replacedById: number | null;
  }>
): Promise<MediaDocument> {
  return withRetry(async () => {
    const updated = await prisma.mediaDocument.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.objective !== undefined && { objective: data.objective }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.format !== undefined && { format: data.format }),
        ...(data.extension !== undefined && { extension: data.extension }),
        ...(data.fileName !== undefined && { fileName: data.fileName }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
        ...(data.fileSize !== undefined && {
          fileSize: data.fileSize !== null ? BigInt(data.fileSize) : null,
        }),
        ...(data.version !== undefined && { version: data.version }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.visibility !== undefined && { visibility: data.visibility }),
        ...(data.publishedById !== undefined && { publishedById: data.publishedById }),
        ...(data.publishedByName !== undefined && { publishedByName: data.publishedByName }),
        ...(data.publishedByEmail !== undefined && { publishedByEmail: data.publishedByEmail }),
        ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt }),
        ...(data.archivedAt !== undefined && { archivedAt: data.archivedAt }),
        ...(data.tags !== undefined && { tags: JSON.stringify(data.tags) }),
        ...(data.previousVersionId !== undefined && { previousVersionId: data.previousVersionId }),
        ...(data.replacedById !== undefined && { replacedById: data.replacedById }),
      },
    });

    return mapToMediaDocument(updated);
  });
}

/**
 * Publier un document
 */
export async function publishMediaDocument(
  id: number,
  publisher?: { id?: string; name?: string; email?: string }
): Promise<MediaDocument> {
  return withRetry(async () => {
    const updated = await prisma.mediaDocument.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
        publishedById: publisher?.id ?? null,
        publishedByName: publisher?.name ?? null,
        publishedByEmail: publisher?.email ?? null,
      },
    });

    return mapToMediaDocument(updated);
  });
}

/**
 * Archiver un document
 */
export async function archiveMediaDocument(id: number): Promise<MediaDocument> {
  return withRetry(async () => {
    const updated = await prisma.mediaDocument.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        isPublished: false,
        archivedAt: new Date(),
      },
    });

    return mapToMediaDocument(updated);
  });
}

/**
 * Supprimer définitivement
 */
export async function deleteMediaDocument(id: number): Promise<void> {
  return withRetry(async () => {
    await prisma.mediaDocument.delete({
      where: { id },
    });
  });
}

/**
 * Incrémenter les vues
 */
export async function incrementMediaDocumentViews(id: number): Promise<void> {
  return withRetry(async () => {
    await prisma.mediaDocument.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  });
}

/**
 * Incrémenter les téléchargements
 */
export async function incrementMediaDocumentDownloads(id: number): Promise<void> {
  return withRetry(async () => {
    await prisma.mediaDocument.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });
  });
}

/**
 * Compter les documents publiés
 */
export async function countPublishedMediaDocuments(): Promise<number> {
  return withRetry(async () => {
    return await prisma.mediaDocument.count({
      where: {
        status: 'PUBLISHED',
        isPublished: true,
      },
    });
  });
}

/**
 * Compter les documents par département
 */
export async function countMediaDocumentsByDepartment(): Promise<
  Array<{ department: string; total: number }>
> {
  return withRetry(async () => {
    const result = await prisma.mediaDocument.groupBy({
      by: ['department'],
      where: {
        status: 'PUBLISHED',
        isPublished: true,
      },
      _count: {
        department: true,
      },
      orderBy: {
        department: 'asc',
      },
    });

    return result.map((row) => ({
      department: row.department,
      total: row._count.department,
    }));
  });
}