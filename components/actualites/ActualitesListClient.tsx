'use client';

// ═══════════════════════════════════════════════════════════════
// Composant Client — Actualités & Informations
// Format Blog Réduit & Équilibré — T-OIL STSL
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  Search,
  ChevronDown,
  ArrowRight,
  X,
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

export default function ActualitesListClient({ initialActualites }: ActualitesListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUTES');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'ancien'>('recent');
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  // Compteurs par catégorie
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

  // Filtrage et tri
  const filteredActualites = useMemo(() => {
    return initialActualites
      .filter((actu) => {
        if (selectedCategory !== 'TOUTES') {
          const cat = (actu.categorie || 'Général').trim().toLowerCase();
          if (cat !== selectedCategory.toLowerCase()) return false;
        }
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
    <div className="space-y-5">
      {/* ── Bande Verte : Titre, Recherche & Rubriques sur un seul bandeau épuré ── */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Ligne 1 : Rubrique / Titre à gauche, Barre de recherche à droite */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Actualités & Informations
            </h1>
            <p className="text-xs text-emerald-100/80">
              Communication interne et vie de l&apos;entreprise
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Barre de recherche */}
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(9);
                }}
                placeholder="Rechercher une actualité..."
                className="w-full pl-10 pr-8 py-2 rounded-xl bg-white text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  title="Effacer la recherche"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tri */}
            <div className="relative shrink-0">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'recent' | 'ancien')}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-white text-xs font-medium cursor-pointer focus:outline-none hover:bg-emerald-950/80 transition-colors shadow-sm"
              >
                <option value="recent" className="text-slate-800 bg-white">Plus récents</option>
                <option value="ancien" className="text-slate-800 bg-white">Plus anciens</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-200 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Ligne 2 : Rubriques (Filtres de catégories) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-emerald-700/40 scrollbar-none">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(9);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span>{cat === 'TOUTES' ? 'Toutes' : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-black/20 text-emerald-200'
                  }`}
                >
                  {categoriesWithCount[cat]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Compteur de résultats ── */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
        <p>
          Affichage de <span className="font-bold text-slate-700">{displayedArticles.length}</span> sur{' '}
          <span className="font-bold text-slate-700">{filteredActualites.length}</span> actualité(s)
        </p>

        {(searchQuery || selectedCategory !== 'TOUTES') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('TOUTES');
            }}
            className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* ── Grille des Articles Réduite (3 colonnes, hauteur maîtrisée) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedArticles.map((actu) => {
          const isBroken = brokenImages[actu.id] || !actu.imageUrl;
          return (
            <Link
              key={actu.id}
              href={`/informations/${actu.id}`}
              className="bg-white rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Couverture avec hauteur maîtrisée (évite les cartes géantes) */}
                <div className="relative w-full h-40 sm:h-44 bg-slate-100 overflow-hidden">
                  {!isBroken ? (
                    <img
                      src={actu.imageUrl}
                      alt={actu.titre}
                      onError={() => handleImageError(actu.id)}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-teal-950 flex flex-col items-center justify-center p-4 text-center text-white/60">
                      <Newspaper className="w-8 h-8 text-emerald-400 mb-1" />
                      <span className="text-[11px] font-bold text-emerald-200">T-OIL STSL</span>
                    </div>
                  )}

                  {/* Badge Catégorie */}
                  {actu.categorie && (
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded bg-white/95 text-slate-800 shadow-2xs">
                      {actu.categorie}
                    </span>
                  )}
                </div>

                {/* Contenu textuel compact */}
                <div className="p-4 space-y-1.5">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {actu.titre}
                  </h2>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {actu.description}
                  </p>
                </div>
              </div>

              {/* Pied de Carte compact */}
              <div className="px-4 py-2.5 flex items-center justify-between border-t border-slate-100 bg-slate-50/40">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{formatDate(actu.datePublication)}</span>
                </div>

                <span className="text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  Lire <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Bouton Charger Plus ── */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 9)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <span>Voir plus d&apos;actualités ({filteredActualites.length - visibleCount} restantes)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Aucun résultat ── */}
      {filteredActualites.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-sm">
          <Tag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Aucune actualité trouvée</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Aucun article ne correspond à votre filtre ou à votre recherche.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('TOUTES');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors mt-1 cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
