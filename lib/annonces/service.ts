import { annoncesRepository } from './repository';
import { Annonce } from '@/types';

export const annoncesServerService = {
  async getAll(): Promise<Annonce[]> {
    return annoncesRepository.findAll();
  },

  async getById(id: string): Promise<Annonce | null> {
    if (!id) throw new Error("ID d'annonce requis");
    return annoncesRepository.findById(id);
  },

  async create(data: Omit<Annonce, 'id'>): Promise<Annonce> {
    if (!data.titre || !data.contenu || !data.type) {
      throw new Error('Champs requis manquants pour la création de l’annonce.');
    }
    return annoncesRepository.create(data);
  },

  async update(id: string, data: Partial<Annonce>): Promise<Annonce> {
    if (!id) throw new Error("ID d'annonce requis");
    return annoncesRepository.update(id, data);
  },

  async delete(id: string): Promise<Annonce> {
    if (!id) throw new Error("ID d'annonce requis");
    return annoncesRepository.delete(id);
  },
};