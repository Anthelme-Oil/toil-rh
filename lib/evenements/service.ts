import { evenementsRepository } from './repository';
import { Evenement } from '@/types';

export const evenementsServerService = {
  async getAll(): Promise<Evenement[]> {
    return evenementsRepository.findAll();
  },

  async getById(id: string): Promise<Evenement | null> {
    if (!id) throw new Error('ID événement requis');
    return evenementsRepository.findById(id);
  },

  async create(data: Omit<Evenement, 'id'>): Promise<Evenement> {
    if (!data.titre || !data.dateDebut) {
      throw new Error('Le titre et la date de début sont obligatoires.');
    }
    return evenementsRepository.create(data);
  },

  async update(id: string, data: Partial<Evenement>): Promise<Evenement> {
    if (!id) throw new Error('ID événement requis');
    return evenementsRepository.update(id, data);
  },

  async delete(id: string): Promise<Evenement> {
    if (!id) throw new Error('ID événement requis');
    return evenementsRepository.delete(id);
  },
};