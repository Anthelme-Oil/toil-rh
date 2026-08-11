'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Filter,
  Sparkles,
  HeartHandshake,
  Shield,
  Monitor,
  Award,
  RefreshCw,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { HeroOnboarding } from '@/components/onboarding/HeroOnboarding';
import { ModuleCard } from '@/components/onboarding/ModuleCard';
import { VideoPlayerModal } from '@/components/onboarding/VideoPlayerModal';
import { KitBienvenueSection } from '@/components/onboarding/KitBienvenueSection';
import type { OnboardingModule, UserOnboardingProgress } from '@/types';

export default function OnboardingPage() {
  const { userEmail, userName } = useUser();

  const [modules, setModules] = useState<OnboardingModule[]>([]);
  const [progress, setProgress] = useState<UserOnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modale vidéo active
  const [activeModule, setActiveModule] = useState<OnboardingModule | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  // Cache client pour l'onboarding (2 min)
  const onboardingCacheRef = useRef<{
    data: { modules: OnboardingModule[]; progress: UserOnboardingProgress } | null;
    fetchedAt: number;
  }>({ data: null, fetchedAt: 0 });

  const loadData = async (forceRefresh = false) => {
    if (!userEmail) return;

    // Cache client instantané
    if (!forceRefresh && onboardingCacheRef.current.data) {
      const age = Date.now() - onboardingCacheRef.current.fetchedAt;
      if (age < 2 * 60 * 1000) {
        setModules(onboardingCacheRef.current.data.modules);
        setProgress(onboardingCacheRef.current.data.progress);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/onboarding?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
        setProgress(data.progress || null);

        onboardingCacheRef.current = {
          data: { modules: data.modules, progress: data.progress },
          fetchedAt: Date.now(),
        };
      }
    } catch (err) {
      console.error('Erreur chargement onboarding:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userEmail]);

  // Marquer un module comme vu / non vu
  const handleToggleComplete = async (moduleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!userEmail) return;

    // Mise à jour optimiste de l'UI
    const currentCompletes = progress?.modulesCompletes || [];
    const isCompleted = currentCompletes.includes(moduleId);
    const newCompletes = isCompleted
      ? currentCompletes.filter((id) => id !== moduleId)
      : [...currentCompletes, moduleId];

    const total = modules.length;
    const newPercentage = total > 0 ? Math.round((newCompletes.length / total) * 100) : 0;

    const newProgressObj: UserOnboardingProgress = {
      userEmail,
      modulesCompletes: newCompletes,
      pourcentageGlobal: newPercentage,
    };

    setProgress(newProgressObj);

    // Mettre à jour le cache local
    if (onboardingCacheRef.current.data) {
      onboardingCacheRef.current.data.progress = newProgressObj;
    }

    // Requête API en tâche de fond
    try {
      const res = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, moduleId }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.progress) setProgress(result.progress);
      }
    } catch (err) {
      console.error('Erreur bascule statut module:', err);
    }
  };

  // Ouverture de la vidéo
  const handleOpenVideo = (mod: OnboardingModule) => {
    setActiveModule(mod);
    setIsVideoModalOpen(true);
  };

  // Modules filtrés
  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const matchCat =
        selectedCategory === 'tous' || mod.categorie.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        searchQuery.trim() === '' ||
        mod.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [modules, selectedCategory, searchQuery]);

  // Durée totale de visionnage
  const totalDuration = useMemo(() => {
    return modules.reduce((acc, m) => acc + (m.dureeMinutes || 0), 0);
  }, [modules]);

  const categories = [
    { id: 'tous', label: 'Tous les modules', icon: Sparkles },
    { id: 'culture', label: 'Culture & Valeurs', icon: HeartHandshake },
    { id: 'securite', label: 'Sécurité & HSE', icon: Shield },
    { id: 'it', label: 'Outils IT & Digital', icon: Monitor },
    { id: 'rh', label: 'Guide & Avantages RH', icon: Award },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Fil d'Ariane & Bouton Retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>

        <button
          onClick={() => loadData(true)}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors bg-white border border-border px-3 py-1.5 rounded-lg shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Rafraîchir
        </button>
      </div>

      {/* Hero Banner de Bienvenue */}
      <HeroOnboarding
        userName={userName}
        progress={progress}
        totalModules={modules.length}
        totalDuration={totalDuration}
      />

      {/* Barre de Recherche & Filtres par Catégorie */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Onglets des catégories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                      : 'bg-white text-text-secondary border-border hover:bg-surface-alt hover:text-primary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Champ de recherche */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Rechercher un module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Liste des Modules (Grille) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-white border border-border animate-pulse p-4 space-y-4"
            >
              <div className="h-44 bg-surface-alt rounded-xl" />
              <div className="h-4 bg-surface-alt rounded w-3/4" />
              <div className="h-3 bg-surface-alt rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center space-y-3">
          <Filter className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-text-primary">Aucun module trouvé</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Aucune capsule d'intégration ne correspond à votre filtre de recherche.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('tous');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-primary hover:underline pt-2"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((mod) => {
            const isCompleted = progress?.modulesCompletes?.includes(mod.id) || false;
            return (
              <ModuleCard
                key={mod.id}
                module={mod}
                isCompleted={isCompleted}
                onOpenVideo={handleOpenVideo}
                onToggleComplete={handleToggleComplete}
              />
            );
          })}
        </div>
      )}

      {/* Section Kit de Bienvenue & Téléchargements */}
      <KitBienvenueSection />

      {/* Modale Lecteur Vidéo */}
      <VideoPlayerModal
        module={activeModule}
        isOpen={isVideoModalOpen}
        isCompleted={
          activeModule ? progress?.modulesCompletes?.includes(activeModule.id) || false : false
        }
        onClose={() => setIsVideoModalOpen(false)}
        onToggleComplete={(modId) => handleToggleComplete(modId)}
      />
    </div>
  );
}
