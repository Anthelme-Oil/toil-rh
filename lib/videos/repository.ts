import { prisma, withRetry } from '@/lib/prisma';
import { Video } from '@/types';

function mapDatabaseVideo(doc: any): Video {
  return {
    id: doc.id,
    titre: doc.titre,
    categorie: doc.categorie,
    duree: doc.duree,
    date: doc.date
      ? new Date(doc.date).toISOString()
      : new Date().toISOString(),
    thumbnailUrl: doc.thumbnailUrl,
    videoUrl: doc.videoUrl,
    description: doc.description,
  };
}

export const videosRepository = {
  async findAll(): Promise<Video[]> {
    return withRetry(async () => {
      const rows = await prisma.video.findMany({
        orderBy: { date: 'desc' },
      });
      return rows.map(mapDatabaseVideo);
    });
  },

  async findById(id: string): Promise<Video | null> {
    return withRetry(async () => {
      const row = await prisma.video.findUnique({
        where: { id },
      });
      if (!row) return null;
      return mapDatabaseVideo(row);
    });
  },

  async create(data: Omit<Video, 'id'>): Promise<Video> {
    return withRetry(async () => {
      const created = await prisma.video.create({
        data: {
          titre: data.titre,
          categorie: data.categorie,
          duree: data.duree,
          thumbnailUrl: data.thumbnailUrl,
          videoUrl: data.videoUrl,
          description: data.description,
          date: data.date ? new Date(data.date) : new Date(),
        },
      });
      return mapDatabaseVideo(created);
    });
  },

  async update(id: string, data: Partial<Video>): Promise<Video> {
    return withRetry(async () => {
      const { id: _, date, ...updateData } = data;
      const updated = await prisma.video.update({
        where: { id },
        data: {
          ...updateData,
          ...(date && { date: new Date(date) }),
        },
      });
      return mapDatabaseVideo(updated);
    });
  },

  async delete(id: string): Promise<Video> {
    return withRetry(async () => {
      const deleted = await prisma.video.delete({
        where: { id },
      });
      return mapDatabaseVideo(deleted);
    });
  },
};