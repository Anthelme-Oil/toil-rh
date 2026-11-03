import { actualitesRepository } from './repository';
import { Actualite } from '@/types';

export const actualitesService = {
  async getAllActualites(): Promise<Actualite[]> {
    return actualitesRepository.findAll();
  },

  async getActualiteById(id: string): Promise<Actualite | null> {
    if (!id) throw new Error('ID de l\'actualité requis.');
    return actualitesRepository.findById(id);
  },

  async createActualite(data: Omit<Actualite, 'id'>): Promise<Actualite> {
    if (!data.titre || !data.description) {
      throw new Error('Le titre et la description sont obligatoires.');
    }
    return actualitesRepository.create(data);
  },

  async updateActualite(id: string, data: Partial<Actualite>): Promise<Actualite> {
    if (!id) throw new Error('ID requis pour la mise à jour.');
    return actualitesRepository.update(id, data);
  },

  async deleteActualite(id: string): Promise<Actualite> {
    if (!id) throw new Error('ID requis pour la suppression.');
    return actualitesRepository.delete(id);
  },
};