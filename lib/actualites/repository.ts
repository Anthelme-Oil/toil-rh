import { prisma, withRetry } from '@/lib/prisma';
import { Actualite } from '@/types';

/**
 * Normalise l'objet renvoyé par Prisma vers l'interface TypeScript Actualite
 */
function mapDatabaseActualite(doc: any): Actualite {
  return {
    id: doc.id,
    titre: doc.titre,
    description: doc.description,
    contenu: doc.contenu ?? undefined,
    datePublication: doc.datePublication 
      ? new Date(doc.datePublication).toISOString() 
      : new Date().toISOString(),
    imageUrl: doc.imageUrl ?? undefined,
    categorie: doc.categorie ?? undefined,
    auteur: doc.auteur ?? undefined,
    tempsLecture: doc.tempsLecture ?? undefined,
    lienVersPage: doc.lienVersPage ?? undefined,
  };
}

export const actualitesRepository = {
  async findAll(): Promise<Actualite[]> {
    return withRetry(async () => {
      const rows = await prisma.actualite.findMany({
        orderBy: { datePublication: 'desc' },
      });
      return rows.map(mapDatabaseActualite);
    });
  },

  async findById(id: string): Promise<Actualite | null> {
    return withRetry(async () => {
      const row = await prisma.actualite.findUnique({
        where: { id },
      });
      if (!row) return null;
      return mapDatabaseActualite(row);
    });
  },

  async create(data: Omit<Actualite, 'id'>): Promise<Actualite> {
    return withRetry(async () => {
      const created = await prisma.actualite.create({
        data: {
          titre: data.titre,
          description: data.description,
          contenu: data.contenu ?? null,
          datePublication: data.datePublication ? new Date(data.datePublication) : new Date(),
          imageUrl: data.imageUrl ?? null,
          categorie: data.categorie ?? null,
          auteur: data.auteur ?? null,
          tempsLecture: data.tempsLecture ?? null,
          lienVersPage: data.lienVersPage ?? null,
        },
      });
      return mapDatabaseActualite(created);
    });
  },

  async update(id: string, data: Partial<Actualite>): Promise<Actualite> {
    return withRetry(async () => {
      const { id: _, datePublication, ...updateData } = data;

      const updated = await prisma.actualite.update({
        where: { id },
        data: {
          ...updateData,
          ...(datePublication && { datePublication: new Date(datePublication) }),
        },
      });
      return mapDatabaseActualite(updated);
    });
  },

  async delete(id: string): Promise<Actualite> {
    return withRetry(async () => {
      const deleted = await prisma.actualite.delete({
        where: { id },
      });
      return mapDatabaseActualite(deleted);
    });
  },
};