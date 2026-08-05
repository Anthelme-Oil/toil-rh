// ═══════════════════════════════════════════════════════════════
// Page Réservations — Salles de réunion & espaces
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin, Clock, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Réservations',
  description: 'Réservez des salles de réunion et des ressources partagées.',
};

const salles = [
  { id: 1, nom: 'Salle Sahara', capacite: 12, equipements: ['Écran', 'Visio', 'Tableau blanc'], etage: '1er étage', disponible: true },
  { id: 2, nom: 'Salle Atlas', capacite: 8, equipements: ['Écran', 'Visio'], etage: '2ème étage', disponible: true },
  { id: 3, nom: 'Salle Tassili', capacite: 20, equipements: ['Écran', 'Visio', 'Sonorisation', 'Tableau blanc'], etage: 'RDC', disponible: false },
  { id: 4, nom: 'Espace Oasis', capacite: 6, equipements: ['Écran'], etage: '1er étage', disponible: true },
  { id: 5, nom: 'Salle Hoggar', capacite: 16, equipements: ['Écran', 'Visio', 'Tableau blanc'], etage: '3ème étage', disponible: true },
  { id: 6, nom: 'Espace Dunes', capacite: 4, equipements: ['Écran'], etage: '2ème étage', disponible: false },
];

export default function ReservationsPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">Réservations</span>
      </div>

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
          <CalendarDays className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Réservations</h1>
          <p className="text-sm text-text-secondary">
            Réservez des salles de réunion et des espaces de travail
          </p>
        </div>
      </div>

      {/* Info Microsoft Bookings */}
      <div
        className="bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl p-5 mb-8 flex items-center gap-4"
      >
        <CalendarDays className="w-10 h-10 text-primary flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-primary-dark">
            Intégration Microsoft Bookings
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Les réservations sont synchronisées avec Microsoft Bookings et votre calendrier Outlook.
            Réservez directement ici ou depuis l&apos;application Bookings.
          </p>
        </div>
        <a
          href="https://outlook.office365.com/owa/?path=/bookings"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors flex-shrink-0"
        >
          Ouvrir Bookings
        </a>
      </div>

      {/* Liste des salles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {salles.map((salle, i) => (
          <div
            key={salle.id}
            className={`bg-white rounded-xl p-5 card-hover animate-fade-in-up delay-${Math.min(i + 1, 5)} ${!salle.disponible ? 'opacity-60' : ''}`}
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-bold text-text-primary">{salle.nom}</h3>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                  salle.disponible
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {salle.disponible ? 'Disponible' : 'Occupée'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Users className="w-4 h-4 text-text-muted" />
                {salle.capacite} personnes
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin className="w-4 h-4 text-text-muted" />
                {salle.etage}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock className="w-4 h-4 text-text-muted" />
                Équipements : {salle.equipements.join(', ')}
              </div>
            </div>

            <button
              disabled={!salle.disponible}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                salle.disponible
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-surface-alt text-text-muted cursor-not-allowed'
              }`}
            >
              {salle.disponible ? 'Réserver maintenant' : 'Non disponible'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
