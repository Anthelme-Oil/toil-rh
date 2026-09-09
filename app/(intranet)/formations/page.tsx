'use client';

// ═══════════════════════════════════════════════════════════════
// Page Formations & Parcours d'Intégration Onboarding
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DevNotice from '@/components/incoming/DevNotice';
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  Users,
  CalendarDays,
  Sparkles,
  BookOpen,
  Search,
  RefreshCw,
} from 'lucide-react';
import type { OnboardingModule, UserOnboardingProgress } from '@/types';
import { HeroOnboarding } from '@/components/onboarding/HeroOnboarding';
import { ModuleCard } from '@/components/onboarding/ModuleCard';
import { VideoPlayerModal } from '@/components/onboarding/VideoPlayerModal';
import { KitBienvenueSection } from '@/components/onboarding/KitBienvenueSection';
import { useUser } from '@/context/UserContext';

// Catalogue des formations en présentiel / distanciel
const FORMATIONS_CATALOGUE = [
  {
    id: 1,
    titre: 'Formation Sécurité HSE — Module avancé',
    description: 'Formation approfondie sur les pratiques de sécurité industrielle et les réglementations HSE.',
    duree: '2 jours',
    places: 15,
    placesRestantes: 3,
    date: '15 septembre 2026',
    categorie: 'HSE',
    niveau: 'Avancé',
  },
  {
    id: 2,
    titre: 'Maîtrise de Microsoft 365 & Copilot',
    description: 'Apprenez à utiliser efficacement Teams, SharePoint, OneDrive et les outils collaboratifs.',
    duree: '1 jour',
    places: 20,
    placesRestantes: 8,
    date: '22 septembre 2026',
    categorie: 'IT & Digital',
    niveau: 'Débutant',
  },
  {
    id: 3,
    titre: 'Leadership et management d\'équipe pétrolière',
    description: 'Développez vos compétences en management et en gestion d\'équipe multidisciplinaire sur site.',
    duree: '3 jours',
    places: 12,
    placesRestantes: 0,
    date: '10 octobre 2026',
    categorie: 'Management',
    niveau: 'Intermédiaire',
  },
  {
    id: 4,
    titre: 'Gestion de projet avec Planner & JDE E1',
    description: 'Maîtrisez les outils de gestion de projet et l\'ERP métier pour vos activités quotidiennes.',
    duree: '1 jour',
    places: 20,
    placesRestantes: 12,
    date: '5 novembre 2026',
    categorie: 'IT & Digital',
    niveau: 'Intermédiaire',
  },
];

function getCatColor(cat: string) {
  const colors: Record<string, string> = {
    HSE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'IT & Digital': 'bg-blue-50 text-blue-700 border-blue-200',
    Management: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return colors[cat] || 'bg-surface-alt text-text-secondary border-border';
}

function getNiveauColor(niveau: string) {
  const colors: Record<string, string> = {
    Débutant: 'bg-emerald-50 text-emerald-700',
    Intermédiaire: 'bg-amber-50 text-amber-700',
    Avancé: 'bg-rose-50 text-rose-700',
  };
  return colors[niveau] || 'bg-surface-alt text-text-secondary';
}

export default function FormationsPage() {
  const { userName } = useUser();
  const [activeTab, setActiveTab] = useState<'onboarding' | 'catalogue'>('onboarding');
  const [modules, setModules] = useState<OnboardingModule[]>([]);
  const [progress, setProgress] = useState<UserOnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideoModule, setSelectedVideoModule] = useState<OnboardingModule | null>(null);

  // Chargement des données Onboarding
  const loadOnboardingData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/onboarding');
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
        setProgress(data.progress || null);
      }
    } catch (err) {
      console.error('Erreur chargement formations onboarding:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOnboardingData();
  }, []);

  // Basculer l'état "vu" / "non vu" d'un module
  const handleToggleCompleted = async (moduleId: string, isCompleted: boolean) => {
    try {
      const res = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, isCompleted }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.progress) {
          setProgress(data.progress);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la progression:', err);
    }
  };

  // Filtrage des modules
  const filteredModules = modules.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.categorie === selectedCategory;
    const matchesSearch =
      m.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'Tous les modules' },
    { id: 'culture', label: 'Culture & Valeurs' },
    { id: 'securite', label: 'Sécurité & HSE' },
    { id: 'it', label: 'Outils IT & Digital' },
    { id: 'rh', label: 'Guide & Avantages RH' },
  ];

  const totalDurationMinutes = modules.reduce((acc, m) => acc + (m.dureeMinutes || 0), 0);

  return (
    // <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
    //   {/* ── Fil d'Ariane ── */}
    //   <div className="flex items-center justify-between">
    //     <div className="flex items-center gap-2 text-sm text-text-muted">
    //       <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
    //         <ArrowLeft className="w-4 h-4" /> Accueil
    //       </Link>
    //       <span>/</span>
    //       <span className="text-text-primary font-medium">Formations & Onboarding</span>
    //     </div>

    //     <button
    //       onClick={loadOnboardingData}
    //       disabled={isLoading}
    //       className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-primary hover:bg-surface-alt transition-colors"
    //       title="Rafraîchir les formations"
    //     >
    //       <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
    //       Actualiser
    //     </button>
    //   </div>

    //   {/* ── En-tête Principal & Navigation par Onglets ── */}
    //   <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
    //     <div className="flex items-center gap-4">
    //       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-800 text-white flex items-center justify-center shadow-lg flex-shrink-0">
    //         <GraduationCap className="w-8 h-8 text-amber-300" />
    //       </div>
    //       <div>
    //         <h1 className="text-2xl font-extrabold text-text-primary">Espace Formations & Intégration</h1>
    //         <p className="text-sm text-text-secondary mt-0.5">
    //           Découvrez le parcours d'intégration des nouveaux arrivants et les formations professionnelles T-OIL.
    //         </p>
    //       </div>
    //     </div>

    //     {/* Controls / Onglets */}
    //     <div className="flex items-center p-1 bg-surface-alt rounded-xl border border-border/60">
    //       <button
    //         onClick={() => setActiveTab('onboarding')}
    //         className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
    //           activeTab === 'onboarding'
    //             ? 'bg-primary text-white shadow-sm'
    //             : 'text-text-secondary hover:text-text-primary'
    //         }`}
    //       >
    //         <Sparkles className="w-4 h-4 text-amber-300" />
    //         Parcours Onboarding
    //       </button>
    //       <button
    //         onClick={() => setActiveTab('catalogue')}
    //         className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
    //           activeTab === 'catalogue'
    //             ? 'bg-primary text-white shadow-sm'
    //             : 'text-text-secondary hover:text-text-primary'
    //         }`}
    //       >
    //         <BookOpen className="w-4 h-4" />
    //         Catalogue Formations
    //       </button>
    //     </div>
    //   </div>

    //   {/* ── CONTENU ONGLET 1 : PARCOURS ONBOARDING ── */}
    //   {activeTab === 'onboarding' && (
    //     <div className="space-y-8 animate-fadeIn">
    //       {/* Hero Banner Onboarding */}
    //       <HeroOnboarding
    //         userName={userName || 'Collaborateur T-OIL'}
    //         progress={progress}
    //         totalModules={modules.length}
    //         totalDuration={totalDurationMinutes}
    //       />

    //       {/* Filtres & Recherche */}
    //       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
    //         <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
    //           {categories.map((cat) => (
    //             <button
    //               key={cat.id}
    //               onClick={() => setSelectedCategory(cat.id)}
    //               className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
    //                 selectedCategory === cat.id
    //                   ? 'bg-primary text-white shadow-sm'
    //                   : 'bg-surface-alt text-text-secondary hover:bg-primary-50 hover:text-primary'
    //               }`}
    //             >
    //               {cat.label}
    //             </button>
    //           ))}
    //         </div>

    //         {/* Barre de recherche */}
    //         <div className="relative w-full md:w-64">
    //           <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
    //           <input
    //             type="text"
    //             placeholder="Rechercher une vidéo..."
    //             value={searchQuery}
    //             onChange={(e) => setSearchQuery(e.target.value)}
    //             className="w-full pl-9 pr-4 py-1.5 text-xs bg-surface-alt border border-border rounded-xl outline-none focus:border-primary focus:bg-white transition-all"
    //           />
    //         </div>
    //       </div>

    //       {/* Grille de Modules Vidéo */}
    //       {isLoading ? (
    //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    //           {[1, 2, 3, 4, 5, 6].map((n) => (
    //             <div key={n} className="h-72 bg-white rounded-2xl border border-border p-4 animate-pulse space-y-3">
    //               <div className="h-40 bg-slate-200 rounded-xl" />
    //               <div className="h-4 bg-slate-200 rounded w-3/4" />
    //               <div className="h-3 bg-slate-200 rounded w-1/2" />
    //             </div>
    //           ))}
    //         </div>
    //       ) : (
    //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    //           {filteredModules.map((module) => {
    //             const isCompleted = progress?.modulesCompletes?.includes(module.id) || false;
    //             return (
    //               <ModuleCard
    //                 key={module.id}
    //                 module={module}
    //                 isCompleted={isCompleted}
    //                 onOpenVideo={() => setSelectedVideoModule(module)}
    //                 onToggleComplete={(moduleId, e) => {
    //                   e.stopPropagation();
    //                   handleToggleCompleted(moduleId, !isCompleted);
    //                 }}
    //               />
    //             );
    //           })}
    //         </div>
    //       )}

    //       {/* Kit de Bienvenue & Documents RH */}
    //       <KitBienvenueSection />
    //     </div>
    //   )}

    //   {/* ── CONTENU ONGLET 2 : CATALOGUE DE FORMATIONS ── */}
    //   {activeTab === 'catalogue' && (
    //     <div className="space-y-6 animate-fadeIn">
    //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //         {FORMATIONS_CATALOGUE.map((f) => (
    //           <div
    //             key={f.id}
    //             className={`bg-white rounded-2xl p-6 border border-border card-hover shadow-sm flex flex-col justify-between space-y-4 ${
    //               f.placesRestantes === 0 ? 'opacity-75' : ''
    //             }`}
    //           >
    //             <div>
    //               <div className="flex items-start justify-between gap-3 mb-3">
    //                 <h3 className="text-base font-bold text-text-primary">{f.titre}</h3>
    //                 <div className="flex gap-1.5 flex-shrink-0">
    //                   <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${getCatColor(f.categorie)}`}>
    //                     {f.categorie}
    //                   </span>
    //                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getNiveauColor(f.niveau)}`}>
    //                     {f.niveau}
    //                   </span>
    //                 </div>
    //               </div>

    //               <p className="text-sm text-text-secondary leading-relaxed mb-4">{f.description}</p>

    //               <div className="flex items-center gap-4 text-xs text-text-muted mb-4 flex-wrap">
    //                 <span className="flex items-center gap-1 font-medium">
    //                   <CalendarDays className="w-3.5 h-3.5 text-primary" /> {f.date}
    //                 </span>
    //                 <span className="flex items-center gap-1 font-medium">
    //                   <Clock className="w-3.5 h-3.5 text-primary" /> {f.duree}
    //                 </span>
    //                 <span className="flex items-center gap-1 font-medium">
    //                   <Users className="w-3.5 h-3.5 text-primary" /> {f.placesRestantes}/{f.places} places
    //                 </span>
    //               </div>

    //               {/* Jauge d'inscriptions */}
    //               <div className="w-full bg-surface-alt rounded-full h-2">
    //                 <div
    //                   className={`h-2 rounded-full transition-all ${
    //                     f.placesRestantes === 0 ? 'bg-rose-500' : f.placesRestantes <= 3 ? 'bg-amber-500' : 'bg-emerald-600'
    //                   }`}
    //                   style={{ width: `${((f.places - f.placesRestantes) / f.places) * 100}%` }}
    //                 />
    //               </div>
    //             </div>

    //             <button
    //               disabled={f.placesRestantes === 0}
    //               className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
    //                 f.placesRestantes > 0
    //                   ? 'bg-primary text-white hover:bg-primary-dark shadow-sm'
    //                   : 'bg-surface-alt text-text-muted cursor-not-allowed border border-border'
    //               }`}
    //             >
    //               {f.placesRestantes > 0 ? "S'inscrire à cette formation" : 'Complet — Inscription sur liste d\'attente'}
    //             </button>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   )}

    //   {/* ── Modale de Lecture Vidéo ── */}
    //   <VideoPlayerModal
    //     module={selectedVideoModule}
    //     isOpen={Boolean(selectedVideoModule)}
    //     isCompleted={
    //       selectedVideoModule
    //         ? progress?.modulesCompletes?.includes(selectedVideoModule.id) || false
    //         : false
    //     }
    //     onClose={() => setSelectedVideoModule(null)}
    //     onToggleComplete={(moduleId: string) => {
    //       const currentIsCompleted = progress?.modulesCompletes?.includes(moduleId) || false;
    //       handleToggleCompleted(moduleId, !currentIsCompleted);
    //     }}
    //   />
    // </div>
    <DevNotice />
  );
}
