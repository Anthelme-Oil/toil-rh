// components/SuggestionModal.tsx
'use client';

import { useState } from 'react';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { suggestionClientService } from '@/lib/services/suggestion.service';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestionModal({ isOpen, onClose }: SuggestionModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Récupération des informations de l'utilisateur connecté via le contexte
  const { userName, userEmail } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await suggestionClientService.create({
        content,
        author: {
          name: userName || 'Collaborateur Anonyme',
          email: userEmail || undefined,
        },
      });

      setSuccess(true);
      setContent('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l’envoi', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all">
        
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Partager une suggestion <Sparkles className="h-4 w-4 text-amber-500" />
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Votre message sera visible par l’équipe IT en tant que <span className="font-semibold text-gray-700 dark:text-gray-300">{userName || 'Collaborateur'}</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-lg">
                ✓
              </div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Merci pour votre retour !</h4>
              <p className="text-xs text-gray-500">Votre suggestion a bien été transmise et enregistrée.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Votre avis ou suggestion
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Décrivez votre idée, votre besoin ou votre expérience..."
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" /> Évitez d'indiquer des informations personnelles ou sensibles.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {loading ? 'Envoi...' : 'Envoyer le retour'}
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}