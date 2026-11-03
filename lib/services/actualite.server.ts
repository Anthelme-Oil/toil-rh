
import type { Actualite } from '@/types';

export const actualitesServerService = {

  async getAll(): Promise<Actualite[]> {
    // Accès direct à SharePoint / DB
    // Exemple :
    // return await getActualitesFromSharePoint();

    throw new Error('À implémenter');
  },

  async getById(id: string): Promise<Actualite> {
    // Accès direct à SharePoint / DB

    throw new Error('À implémenter');
  },

  async create(
    data: Omit<Actualite, 'id'>
  ): Promise<Actualite> {
    // Création directe côté serveur

    throw new Error('À implémenter');
  },

  async update(
    id: string,
    data: Partial<Actualite>
  ): Promise<Actualite> {
    // Modification directe côté serveur

    throw new Error('À implémenter');
  },

  async delete(id: string): Promise<void> {
    // Suppression directe côté serveur

    throw new Error('À implémenter');
  },
};
