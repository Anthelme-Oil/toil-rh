// lib/services/suggestion.service.ts
import { Suggestion, SuggestionStatus } from '@/types';

export const suggestionClientService = {
  async fetchAll(): Promise<Suggestion[]> {
    const res = await fetch('/api/requests/suggestions');
    if (!res.ok) throw new Error("Erreur lors de la récupération des suggestions");
    return res.json();
  },

  async fetchById(id: string): Promise<Suggestion> {
    const res = await fetch(`/api/requests/suggestions/${id}`);
    if (!res.ok) throw new Error("Suggestion introuvable");
    return res.json();
  },

  async create(payload: { content: string; author: { name: string; email?: string; avatar?: string } }): Promise<Suggestion> {
    const res = await fetch('/api/requests/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de la création");
    }
    return res.json();
  },

  async update(id: string, data: Partial<Suggestion> & { status?: SuggestionStatus }): Promise<Suggestion> {
    const res = await fetch(`/api/requests/suggestions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de la mise à jour");
    }
    return res.json();
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/requests/suggestions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de la suppression");
    }
  },
};