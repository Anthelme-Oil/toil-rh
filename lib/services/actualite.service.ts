const API_URL = '/api/requests/actualites';

import type { ActualitesResponse, Actualite } from '@/types';

export const actualitesClientService = {

  // GET ALL
  async getAll(): Promise<Actualite[]> {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Impossible de charger les actualités');
    }

    return response.json();
  },

  // GET BY ID
  async getById(id: string): Promise<Actualite> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Actualité introuvable');
    }

    return response.json();
  },

  // CREATE
  async create(data: Omit<Actualite, 'id'>): Promise<Actualite> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Impossible de créer l'actualité");
    }

    return response.json();
  },

  // UPDATE
  async update(id: string, data: Partial<Actualite>): Promise<Actualite> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || "Impossible de mettre à jour l'actualité"
      );
    }

    return response.json();
  },

  // DELETE
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || "Impossible de supprimer l'actualité"
      );
    }
  },
};