// lib/suggestions/repository.ts
import { prisma, withRetry } from '@/lib/prisma';
import { Suggestion, SuggestionStatus } from '@/types'; // Assurez-vous d'avoir vos types définis ou adaptés
import { SuggestionStatus as PrismaSuggestionStatus } from '@prisma/client';

/**
 * Conversion : statut Prisma -> statut applicatif
 */
function mapPrismaStatusToStatus(status: PrismaSuggestionStatus): SuggestionStatus {
  switch (status) {
    case PrismaSuggestionStatus.PENDING:
      return 'PENDING';
    case PrismaSuggestionStatus.REVIEWED:
      return 'REVIEWED';
    case PrismaSuggestionStatus.IMPLEMENTED:
      return 'IMPLEMENTED';
    case PrismaSuggestionStatus.REJECTED:
      return 'REJECTED';
    default:
      throw new Error(`Statut Prisma inconnu : ${status}`);
  }
}

/**
 * Conversion : statut applicatif -> statut Prisma
 */
function mapStatusToPrismaStatus(status: SuggestionStatus): PrismaSuggestionStatus {
  switch (status) {
    case 'PENDING':
      return PrismaSuggestionStatus.PENDING;
    case 'REVIEWED':
      return PrismaSuggestionStatus.REVIEWED;
    case 'IMPLEMENTED':
      return PrismaSuggestionStatus.IMPLEMENTED;
    case 'REJECTED':
      return PrismaSuggestionStatus.REJECTED;
    default:
      throw new Error(`Statut applicatif inconnu : ${status}`);
  }
}

/**
 * Conversion : objet Prisma -> objet applicatif
 */
function mapDatabaseSuggestion(doc: any): Suggestion {
  return {
    id: doc.id,
    content: doc.content,
    status: mapPrismaStatusToStatus(doc.status),
    author: {
      name: doc.authorName,
      email: doc.authorEmail ?? undefined,
      avatar: doc.authorAvatar ?? undefined,
    },
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export const suggestionRepository = {
  /**
   * GET ALL
   */
  async findAll(): Promise<Suggestion[]> {
    return withRetry(async () => {
      const rows = await prisma.suggestion.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return rows.map(mapDatabaseSuggestion);
    });
  },

  /**
   * GET BY ID
   */
  async findById(id: string): Promise<Suggestion | null> {
    return withRetry(async () => {
      const row = await prisma.suggestion.findUnique({
        where: { id },
      });
      if (!row) return null;
      return mapDatabaseSuggestion(row);
    });
  },

  /**
   * CREATE
   */
  async create(data: { content: string; author: { name: string; email?: string; avatar?: string } }): Promise<Suggestion> {
    return withRetry(async () => {
      const created = await prisma.suggestion.create({
        data: {
          content: data.content,
          authorName: data.author.name,
          authorEmail: data.author.email ?? null,
          authorAvatar: data.author.avatar ?? null,
          status: PrismaSuggestionStatus.PENDING,
        },
      });
      return mapDatabaseSuggestion(created);
    });
  },

  /**
   * UPDATE
   */
  async update(id: string, data: Partial<Suggestion> & { status?: SuggestionStatus }): Promise<Suggestion> {
    return withRetry(async () => {
      const updateData: any = {};

      if (data.content !== undefined) {
        updateData.content = data.content;
      }
      if (data.status !== undefined) {
        updateData.status = mapStatusToPrismaStatus(data.status);
      }
      if (data.author) {
        if (data.author.name !== undefined) updateData.authorName = data.author.name;
        if (data.author.email !== undefined) updateData.authorEmail = data.author.email;
        if (data.author.avatar !== undefined) updateData.authorAvatar = data.author.avatar;
      }

      const updated = await prisma.suggestion.update({
        where: { id },
        data: updateData,
      });

      return mapDatabaseSuggestion(updated);
    });
  },

  /**
   * DELETE
   */
  async delete(id: string): Promise<Suggestion> {
    return withRetry(async () => {
      const deleted = await prisma.suggestion.delete({
        where: { id },
      });
      return mapDatabaseSuggestion(deleted);
    });
  },
};