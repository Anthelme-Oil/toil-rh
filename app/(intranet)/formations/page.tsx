// ═══════════════════════════════════════════════════════════════
// Page Formations
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Clock, Users, CalendarDays, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Formations',
  description: 'Catalogue des formations et sessions de développement professionnel.',
};

const formations = [
  {
    id: 1,
    titre: 'Formation Sécurité HSE — Module avancé',
    description: 'Formation approfondie sur les pratiques de sécurité industrielle et les réglementations HSE.',
    duree: '2 jours',
    places: 15,
    placesRestantes: 3,
    date: '15 septembre 2025',
    categorie: 'HSE',
    niveau: 'Avancé',
  },
  {
    id: 2,
    titre: 'Maîtrise de Microsoft 365',
    description: 'Apprenez à utiliser efficacement Teams, SharePoint, OneDrive et les outils collaboratifs.',
    duree: '1 jour',
    places: 20,
    placesRestantes: 8,
    date: '22 septembre 2025',
    categorie: 'IT',
    niveau: 'Débutant',
  },
  {
    id: 3,
    titre: 'Leadership et management d\'équipe',
    description: 'Développez vos compétences en management et en gestion d\'équipe multidisciplinaire.',
    duree: '3 jours',
    places: 12,
    placesRestantes: 0,
    date: '10 octobre 2025',
    categorie: 'Management',
    niveau: 'Intermédiaire',
  },
  {
    id: 4,
    titre: 'Gestion de projet avec Planner & Project',
    description: 'Maîtrisez les outils Microsoft de gestion de projet pour vos activités quotidiennes.',
    duree: '1 jour',
    places: 20,
    placesRestantes: 12,
    date: '5 novembre 2025',
    categorie: 'IT',
    niveau: 'Intermédiaire',
  },
];

function getCatColor(cat: string) {
  const colors: Record<string, string> = {
    HSE: 'bg-primary-100 text-primary-700',
    IT: 'bg-blue-50 text-blue-700',
    Management: 'bg-purple-50 text-purple-700',
  };
  return colors[cat] || 'bg-surface-alt text-text-secondary';
}

function getNiveauColor(niveau: string) {
  const colors: Record<string, string> = {
    'Débutant': 'bg-green-50 text-green-700',
    'Intermédiaire': 'bg-amber-50 text-amber-700',
    'Avancé': 'bg-red-50 text-red-700',
  };
  return colors[niveau] || 'bg-surface-alt text-text-secondary';
}

export default function FormationsPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">Formations</span>
      </div>

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Formations</h1>
          <p className="text-sm text-text-secondary">
            Catalogue des formations et sessions de développement professionnel
          </p>
        </div>
      </div>

      {/* Grille de formations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formations.map((f, i) => (
          <div
            key={f.id}
            className={`bg-white rounded-xl p-6 card-hover animate-fade-in-up delay-${Math.min(i + 1, 5)} ${f.placesRestantes === 0 ? 'opacity-70' : ''}`}
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-base font-bold text-text-primary">{f.titre}</h3>
              <div className="flex gap-1.5 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getCatColor(f.categorie)}`}>
                  {f.categorie}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getNiveauColor(f.niveau)}`}>
                  {f.niveau}
                </span>
              </div>
            </div>

            <p className="text-sm text-text-secondary mb-4 leading-relaxed">{f.description}</p>

            <div className="flex items-center gap-4 text-xs text-text-muted mb-4 flex-wrap">
              <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {f.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {f.duree}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {f.placesRestantes}/{f.places} places</span>
            </div>

            {/* Barre de remplissage */}
            <div className="w-full bg-surface-alt rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all ${f.placesRestantes === 0 ? 'bg-red-400' : f.placesRestantes <= 3 ? 'bg-amber' : 'bg-primary'}`}
                style={{ width: `${((f.places - f.placesRestantes) / f.places) * 100}%` }}
              />
            </div>

            <button
              disabled={f.placesRestantes === 0}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                f.placesRestantes > 0
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-surface-alt text-text-muted cursor-not-allowed'
              }`}
            >
              {f.placesRestantes > 0 ? "S'inscrire à cette formation" : 'Complet — Liste d\'attente'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
