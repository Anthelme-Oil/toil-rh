import { Annonce } from '@/types';

const API = '/api/requests/annonces';

export const annoncesClientService = {
  async getAll(): Promise<Annonce[]> {
    const res = await fetch(API, { cache: 'no-store' });
    if (!res.ok) throw new Error('Erreur de chargement des annonces');
    return res.json();
  },
  async getById(id: string): Promise<Annonce> {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) throw new Error('Annonce introuvable');
    return res.json();
  },
  async create(data: Omit<Annonce, 'id'>): Promise<Annonce> {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Échec de création');
    return res.json();
  },
  async update(id: string, data: Partial<Annonce>): Promise<Annonce> {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Échec de mise à jour');
    return res.json();
  },
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Échec de suppression');
  },
};