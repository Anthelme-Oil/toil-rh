// app/suggestions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Calendar, CheckCircle2, Clock, Trash2, ShieldAlert, AlertCircle, Search, Sparkles } from 'lucide-react';
import { suggestionClientService } from '@/lib/services/suggestion.service';
import { Suggestion } from '@/types';

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSuggestions = async () => {
    try {
      const data = await suggestionClientService.fetchAll();
      // Tri par date de création décroissante (plus récent au plus ancien)
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSuggestions(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cette suggestion ?')) return;
    try {
      await suggestionClientService.remove(id);
      setSuggestions(suggestions.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrage intelligent par contenu ou nom d'utilisateur (username)
  const filteredSuggestions = suggestions.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const contentMatch = item.content.toLowerCase().includes(query);
    const authorMatch = item.author?.name?.toLowerCase().includes(query);
    return contentMatch || authorMatch;
  });

  // Affichage strict des 5 dernières suggestions les plus récentes parmi les résultats filtrés
  const displayedSuggestions = filteredSuggestions.slice(0, 5);

  const getStatusBadge = (status: Suggestion['status']) => {
    switch (status) {
      case 'IMPLEMENTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Réalisé
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Clock className="h-3 w-3" /> En cours d'étude
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
            <AlertCircle className="h-3 w-3" /> Classé sans suite
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock className="h-3 w-3" /> En attente
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fadeIn">
      {/* En-tête de page professionnel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-amber-500" />
            Boîte à Suggestions Intranet
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Affichage des <span className="font-semibold text-gray-700 dark:text-gray-300">5 dernières suggestions</span> les plus récentes partagées par les collaborateurs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {filteredSuggestions.length} résultat{filteredSuggestions.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Barre de recherche haut de gamme */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par contenu ou nom d'auteur..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
        />
      </div>

      {/* Grille des suggestions */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 4].map((n) => (
            <div key={n} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : displayedSuggestions.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <ShieldAlert className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Aucune suggestion trouvée</h3>
          <p className="text-xs text-gray-500 mt-1">
            {searchQuery ? "Aucun résultat ne correspond à votre recherche." : "Soyez le premier à partager une idée via le bandeau d'alerte !"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedSuggestions.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                {/* Auteur et Statut */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {item.author?.name ? item.author.name.substring(0, 2).toUpperCase() : 'TC'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{item.author?.name || 'Collaborateur Anonyme'}</h4>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {getStatusBadge(item.status)}
                </div>

                {/* Contenu */}
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 leading-relaxed">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              {/* Actions sur la carte */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-50 dark:border-gray-800/50">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Supprimer la suggestion"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}