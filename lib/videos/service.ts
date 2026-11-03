import { videosRepository } from './repository';
import { Video } from '@/types';

export const videosServerService = {
  async getAll(): Promise<Video[]> {
    return videosRepository.findAll();
  },

  async getById(id: string): Promise<Video | null> {
    if (!id) throw new Error('ID vidéo requis');
    return videosRepository.findById(id);
  },

  async create(data: Omit<Video, 'id'>): Promise<Video> {
    if (!data.titre || !data.videoUrl || !data.thumbnailUrl) {
      throw new Error('Le titre, l’URL vidéo et la miniature sont requis.');
    }
    return videosRepository.create(data);
  },

  async update(id: string, data: Partial<Video>): Promise<Video> {
    if (!id) throw new Error('ID vidéo requis');
    return videosRepository.update(id, data);
  },

  async delete(id: string): Promise<Video> {
    if (!id) throw new Error('ID vidéo requis');
    return videosRepository.delete(id);
  },
};