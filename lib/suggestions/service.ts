// lib/suggestions/service.ts
import { suggestionRepository } from '@/lib/suggestions/repository';
import { Suggestion, SuggestionStatus } from '@/types';

export const suggestionService = {
  async getAllSuggestions(): Promise<Suggestion[]> {
    return await suggestionRepository.findAll();
  },

  async getSuggestionById(id: string): Promise<Suggestion | null> {
    if (!id) throw new Error("L'ID est requis.");
    return await suggestionRepository.findById(id);
  },

  async createSuggestion(data: { content: string; author?: { name: string; email?: string; avatar?: string } }): Promise<Suggestion> {
    if (!data.content || data.content.trim() === '') {
      throw new Error("Le contenu de la suggestion ne peut pas être vide.");
    }

    const payload = {
      content: data.content.trim(),
      author: data.author || { name: 'Collaborateur Anonyme' },
    };

    return await suggestionRepository.create(payload);
  },

  async updateSuggestion(id: string, data: Partial<Suggestion> & { status?: SuggestionStatus }): Promise<Suggestion> {
    if (!id) throw new Error("L'ID de la suggestion est requis pour la mise à jour.");
    
    const existing = await suggestionRepository.findById(id);
    if (!existing) {
      throw new Error("Suggestion introuvable.");
    }

    return await suggestionRepository.update(id, data);
  },

  async deleteSuggestion(id: string): Promise<Suggestion> {
    if (!id) throw new Error("L'ID est requis pour la suppression.");

    const existing = await suggestionRepository.findById(id);
    if (!existing) {
      throw new Error("Suggestion introuvable.");
    }

    return await suggestionRepository.delete(id);
  },
};