import { prisma, withRetry } from '@/lib/prisma';
import { Evenement } from '@/types';

function mapDatabaseEvenement(doc: any): Evenement {
  return {
    id: doc.id,
    titre: doc.titre,
    dateDebut: new Date(doc.dateDebut).toISOString(),
    dateFin: doc.dateFin ? new Date(doc.dateFin).toISOString() : undefined,
    lieu: doc.lieu ?? undefined,
    description: doc.description ?? undefined,
  };
}

export const evenementsRepository = {
  async findAll(): Promise<Evenement[]> {
    return withRetry(async () => {
      const rows = await prisma.evenement.findMany({
        orderBy: { dateDebut: 'asc' },
      });
      return rows.map(mapDatabaseEvenement);
    });
  },

  async findById(id: string): Promise<Evenement | null> {
    return withRetry(async () => {
      const row = await prisma.evenement.findUnique({
        where: { id },
      });
      if (!row) return null;
      return mapDatabaseEvenement(row);
    });
  },

  async create(data: Omit<Evenement, 'id'>): Promise<Evenement> {
    return withRetry(async () => {
      const created = await prisma.evenement.create({
        data: {
          titre: data.titre,
          dateDebut: new Date(data.dateDebut),
          dateFin: data.dateFin ? new Date(data.dateFin) : null,
          lieu: data.lieu ?? null,
          description: data.description ?? null,
        },
      });
      return mapDatabaseEvenement(created);
    });
  },

  async update(id: string, data: Partial<Evenement>): Promise<Evenement> {
    return withRetry(async () => {
      const { id: _, dateDebut, dateFin, ...updateData } = data;
      const updated = await prisma.evenement.update({
        where: { id },
        data: {
          ...updateData,
          ...(dateDebut && { dateDebut: new Date(dateDebut) }),
          ...(dateFin !== undefined && {
            dateFin: dateFin ? new Date(dateFin) : null,
          }),
        },
      });
      return mapDatabaseEvenement(updated);
    });
  },

  async delete(id: string): Promise<Evenement> {
    return withRetry(async () => {
      const deleted = await prisma.evenement.delete({
        where: { id },
      });
      return mapDatabaseEvenement(deleted);
    });
  },
};