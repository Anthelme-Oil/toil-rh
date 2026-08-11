'use client';

// ═══════════════════════════════════════════════════════════════
// Composant Client — Liste déroulable des actualités & filtres
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  Filter,
  Search,
  ArrowUpDown,
  ChevronDown,
  Sparkles,
  Tag,
} from 'lucide-react';
import type { Actualite } from '@/types';

interface ActualitesListClientProps {
  initialActualites: Actualite[];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getCatStyle(cat?: string) {
  switch (cat?.toLowerCase()) {
    case 'hse':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'politique':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'formation':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ressources humaines':
    case 'rh':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'évènements':
    case 'evenements':
    case 'événement':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default function ActualitesListClient({ initialActualites }: ActualitesListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUTES');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'ancien'>('recent');
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  // Extraire les catégories uniques avec compteur
  const categoriesWithCount = useMemo(() => {
    const counts: Record<string, number> = { TOUTES: initialActualites.length };
    initialActualites.forEach((actu) => {
      const cat = (actu.categorie || 'Général').trim();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [initialActualites]);

  const categoriesList = useMemo(() => {
    return Object.keys(categoriesWithCount);
  }, [categoriesWithCount]);

  // Filtrer et trier la liste
  const filteredActualites = useMemo(() => {
    return initialActualites
      .filter((actu) => {
        // Filtre par catégorie
        if (selectedCategory !== 'TOUTES') {
          const cat = (actu.categorie || 'Général').trim().toLowerCase();
          if (cat !== selectedCategory.toLowerCase()) return false;
        }
        // Filtre par recherche texte
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = actu.titre.toLowerCase().includes(q);
          const matchesDesc = actu.description.toLowerCase().includes(q);
          const matchesCat = (actu.categorie || '').toLowerCase().includes(q);
          return matchesTitle || matchesDesc || matchesCat;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = a.datePublication ? new Date(a.datePublication).getTime() : 0;
        const timeB = b.datePublication ? new Date(b.datePublication).getTime() : 0;
        return sortOrder === 'recent' ? timeB - timeA : timeA - timeB;
      });
  }, [initialActualites, selectedCategory, searchQuery, sortOrder]);

  const displayedArticles = filteredActualites.slice(0, visibleCount);
  const hasMore = visibleCount < filteredActualites.length;

  return (
    <div className="space-y-8">
      {/* ── Barre de Contrôle & Filtres ── */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une actualité par mot-clé..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt/50 text-xs sm:text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Liste Déroulante par Catégorie */}
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setVisibleCount(9);
                }}
                className="w-full sm:w-auto appearance-none pl-9 pr-10 py-2.5 rounded-xl border border-border bg-white text-xs sm:text-sm font-semibold text-text-primary hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none cursor-pointer transition-all shadow-sm"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'TOUTES'
                      ? `Toutes les catégories (${categoriesWithCount['TOUTES']})`
                      : `${cat} (${categoriesWithCount[cat]})`}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Tri par Date */}
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'recent' | 'ancien')}
                className="w-full sm:w-auto appearance-none pl-9 pr-10 py-2.5 rounded-xl border border-border bg-white text-xs sm:text-sm font-semibold text-text-primary hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none cursor-pointer transition-all shadow-sm"
              >
                <option value="recent">Plus récents en premier</option>
                <option value="ancien">Plus anciens en premier</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Pilules de raccourci par catégorie */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none border-t border-border/40">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(9);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-alt text-text-secondary hover:bg-primary-50 hover:text-primary'
                }`}
              >
                <span>{cat === 'TOUTES' ? 'Toutes' : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-border/60 text-text-muted'
                  }`}
                >
                  {categoriesWithCount[cat]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Compteur & Statut ── */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <p>
          Affichage de <span className="font-bold text-text-primary">{displayedArticles.length}</span> sur{' '}
          <span className="font-bold text-text-primary">{filteredActualites.length}</span> actualité(s)
          {selectedCategory !== 'TOUTES' && (
            <span> dans la catégorie <strong className="text-primary">{selectedCategory}</strong></span>
          )}
        </p>
        <span className="font-medium text-emerald-600 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Du plus récent au plus ancien
        </span>
      </div>

      {/* ── Grille / Liste des Actualités ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedArticles.map((actu, i) => {
          const isBroken = brokenImages[actu.id] || !actu.imageUrl;
          return (
            <Link
              key={actu.id}
              href={`/informations/${actu.id}`}
              className="bg-white rounded-2xl overflow-hidden border border-border card-hover flex flex-col justify-between group transition-all duration-200"
              style={{ boxShadow: 'var(--shadow-card)' }}
              id={`article-${actu.id}`}
            >
              <div>
                {/* Visual Cover Image / Placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-50 relative overflow-hidden flex items-center justify-center">
                  {!isBroken ? (
                    <img
                      src={actu.imageUrl}
                      alt={actu.titre}
                      onError={() => handleImageError(actu.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-primary/40 group-hover:scale-110 transition-transform duration-300">
                      <Newspaper className="w-12 h-12" />
                    </div>
                  )}
                  {actu.categorie && (
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border shadow-sm ${getCatStyle(
                        actu.categorie
                      )}`}
                    >
                      {actu.categorie}
                    </span>
                  )}
                </div>

                {/* Contenu de la Carte */}
                <div className="p-5">
                  <h2 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors mb-2 line-clamp-2 leading-snug">
                    {actu.titre}
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-3">
                    {actu.description}
                  </p>
                </div>
              </div>

              {/* Pied de Carte */}
              <div className="px-5 pb-5 pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {formatDate(actu.datePublication)}
                </div>
                <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Lire la suite →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Bouton Déroulant / Charger Plus ── */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 9)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-md transition-all duration-200"
          >
            <span>Charger plus d&apos;actualités ({filteredActualites.length - visibleCount} restantes)</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      )}

      {/* ── Aucun résultat ── */}
      {filteredActualites.length === 0 && (
        <div className="bg-white rounded-2xl border border-border p-12 text-center space-y-3">
          <Tag className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-text-primary">Aucune actualité trouvée</h3>
          <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
            Aucun article ne correspond à votre filtre ou terme de recherche. Essayez de réinitialiser le filtre de catégorie.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('TOUTES');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 text-primary text-xs font-bold hover:bg-primary-100 transition-colors mt-2"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
