import { prisma, withRetry } from '@/lib/prisma';
import { Annonce, AnnonceType } from '@/types';
import { TypeAnnonce } from '@prisma/client';

/**
 * Conversion : type Prisma -> type applicatif
 */
function mapPrismaTypeToAnnonceType(type: TypeAnnonce): AnnonceType {
  switch (type) {
    case TypeAnnonce.INFO:
      return 'info';

    case TypeAnnonce.URGENT:
      return 'urgent';

    case TypeAnnonce.WARNING:
      return 'warning';

    default:
      throw new Error(`Type d'annonce Prisma inconnu : ${type}`);
  }
}

/**
 * Conversion : type applicatif -> type Prisma
 */
function mapAnnonceTypeToPrismaType(type: AnnonceType): TypeAnnonce {
  switch (type) {
    case 'info':
      return TypeAnnonce.INFO;

    case 'urgent':
      return TypeAnnonce.URGENT;

    case 'warning':
      return TypeAnnonce.WARNING;

    default:
      throw new Error(`Type d'annonce applicatif inconnu : ${type}`);
  }
}

/**
 * Conversion : objet Prisma -> objet applicatif
 */
function mapDatabaseAnnonce(doc: any): Annonce {
  return {
    id: doc.id,
    titre: doc.titre,
    contenu: doc.contenu,

    type: mapPrismaTypeToAnnonceType(doc.type),

    datePublication: doc.datePublication
      ? new Date(doc.datePublication).toISOString()
      : new Date().toISOString(),

    lien: doc.lien ?? undefined,
  };
}

export const annoncesRepository = {
  /**
   * GET ALL
   */
  async findAll(): Promise<Annonce[]> {
    return withRetry(async () => {
      const rows = await prisma.annonce.findMany({
        orderBy: {
          datePublication: 'desc',
        },
      });

      return rows.map(mapDatabaseAnnonce);
    });
  },

  /**
   * GET BY ID
   */
  async findById(id: string): Promise<Annonce | null> {
    return withRetry(async () => {
      const row = await prisma.annonce.findUnique({
        where: {
          id,
        },
      });

      if (!row) {
        return null;
      }

      return mapDatabaseAnnonce(row);
    });
  },

  /**
   * CREATE
   */
  async create(data: Omit<Annonce, 'id'>): Promise<Annonce> {
    return withRetry(async () => {
      const created = await prisma.annonce.create({
        data: {
          titre: data.titre,
          contenu: data.contenu,

          type: mapAnnonceTypeToPrismaType(data.type),

          lien: data.lien ?? null,

          datePublication: data.datePublication
            ? new Date(data.datePublication)
            : new Date(),
        },
      });

      return mapDatabaseAnnonce(created);
    });
  },

  /**
   * UPDATE
   */
  async update(
    id: string,
    data: Partial<Annonce>
  ): Promise<Annonce> {
    return withRetry(async () => {
      const updateData: {
        titre?: string;
        contenu?: string;
        type?: TypeAnnonce;
        lien?: string | null;
        datePublication?: Date;
      } = {};

      if (data.titre !== undefined) {
        updateData.titre = data.titre;
      }

      if (data.contenu !== undefined) {
        updateData.contenu = data.contenu;
      }

      if (data.type !== undefined) {
        updateData.type = mapAnnonceTypeToPrismaType(data.type);
      }

      if (data.lien !== undefined) {
        updateData.lien = data.lien ?? null;
      }

      if (data.datePublication !== undefined) {
        updateData.datePublication = new Date(data.datePublication);
      }

      const updated = await prisma.annonce.update({
        where: {
          id,
        },
        data: updateData,
      });

      return mapDatabaseAnnonce(updated);
    });
  },

  /**
   * DELETE
   */
  async delete(id: string): Promise<Annonce> {
    return withRetry(async () => {
      const deleted = await prisma.annonce.delete({
        where: {
          id,
        },
      });

      return mapDatabaseAnnonce(deleted);
    });
  },
};