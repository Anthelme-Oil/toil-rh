'use client';

// ═══════════════════════════════════════════════════════════════
// Composant Client — Liste des Actualités (Design Inspiré TogoTech/FARI)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  Search,
  ArrowUpDown,
  ChevronDown,
  Tag,
  ArrowRight,
  Filter,
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
  const [visibleCount, setVisibleCount] = useState<number>(8);
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

  // Filtrer et trier la liste
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
    <div className="space-y-8">
      {/* ── Barre de recherche et filtres ── */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Recherche texte */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une actualité par mot-clé..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-slate-800"
            />
          </div>

          {/* Tri par Date */}
          <div className="relative flex-1 md:flex-initial">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'recent' | 'ancien')}
              className="w-full md:w-auto appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:border-emerald-500 focus:border-emerald-500 outline-none cursor-pointer transition-all shadow-xs"
            >
              <option value="recent">Plus récents en premier</option>
              <option value="ancien">Plus anciens en premier</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Pilules de catégories */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(8);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat === 'TOUTES' ? 'Toutes' : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {categoriesWithCount[cat]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Compteur ── */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
        <p>
          Affichage de <span className="font-bold text-slate-800">{displayedArticles.length}</span> sur{' '}
          <span className="font-bold text-slate-800">{filteredActualites.length}</span> actualité(s)
        </p>
      </div>

      {/* ── GRILLE DES ARTICLES (2 Colonnes comme sur le Wireframe / Exemple) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayedArticles.map((actu) => {
          const isBroken = brokenImages[actu.id] || !actu.imageUrl;
          return (
            <Link
              key={actu.id}
              href={`/informations/${actu.id}`}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 border-b-4 border-b-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Couverture 16:9 sans déformation */}
                <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden">
                  {!isBroken ? (
                    <img
                      src={actu.imageUrl}
                      alt={actu.titre}
                      onError={() => handleImageError(actu.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-teal-950 flex flex-col items-center justify-center p-6 text-center text-white/50">
                      <Newspaper className="w-12 h-12 text-emerald-400 mb-1" />
                      <span className="text-xs font-bold text-emerald-200">T-OIL STSL</span>
                    </div>
                  )}

                  {/* Badge Catégorie facultatif */}
                  {actu.categorie && (
                    <span className="absolute top-3 left-3 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs border border-white">
                      {actu.categorie}
                    </span>
                  )}
                </div>

                {/* Contenu textuel */}
                <div className="p-6 space-y-3">
                  <h2 className="text-lg font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {actu.titre}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {actu.description}
                  </p>
                </div>
              </div>

              {/* Pied de Carte (Date avec icône verte au bas à gauche) */}
              <div className="px-6 pb-5 pt-1 flex items-center justify-between border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>{formatDate(actu.datePublication)}</span>
                </div>

                <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all inline-flex items-center gap-1">
                  Lire <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Bouton Charger Plus ── */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + 8)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all duration-200"
          >
            <span>Voir plus d&apos;actualités ({filteredActualites.length - visibleCount} restantes)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Aucun résultat ── */}
      {filteredActualites.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <Tag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aucune actualité trouvée</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Aucun article ne correspond à votre filtre.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('TOUTES');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors mt-2"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
