'use client';

import React from 'react';
import { BookOpen, ShieldCheck, PhoneCall, CreditCard, Download, ExternalLink, FileSpreadsheet, Sparkles } from 'lucide-react';

interface KitItem {
  id: string;
  titre: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  taille: string;
}

const KIT_ITEMS: KitItem[] = [
  {
    id: 'kit-01',
    titre: 'Livret d\'Accueil Collaborateur 2026',
    description: 'Présentation complète du Groupe, horaires, règles internes et guide d\'intégration.',
    icon: BookOpen,
    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    badge: 'PDF',
    taille: '4.5 Mo',
  },
  {
    id: 'kit-02',
    titre: 'Charte Informatique & Cybersécurité',
    description: 'Bonnes pratiques d\'utilisation du système d\'information et de la messagerie M365.',
    icon: ShieldCheck,
    color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    badge: 'PDF',
    taille: '1.2 Mo',
  },
  {
    id: 'kit-03',
    titre: 'Guide Mutuelle, Santé & Avantages RH',
    description: 'Détails des garanties de santé, couverture famille et démarches de souscription.',
    icon: CreditCard,
    color: 'bg-teal-500/10 text-teal-700 border-teal-500/20',
    badge: 'PDF',
    taille: '2.8 Mo',
  },
  {
    id: 'kit-04',
    titre: 'Annuaire d\'Urgence & Contacts Clés',
    description: 'Numéros d\'urgence dépôt, contacts RH, Support IT et responsables de sites.',
    icon: PhoneCall,
    color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    badge: 'PDF',
    taille: '650 Ko',
  },
];

export function KitBienvenueSection() {
  const handleDownload = (titre: string) => {
    alert(`Téléchargement de "${titre}" lancé (Document officiel T-OIL)`);
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Kit de Bienvenue & Documents Utiles
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Téléchargez les guides officiels et fiches pratiques indispensables pour vos premiers jours.
          </p>
        </div>

        <button
          onClick={() => handleDownload('Pack Kit de Bienvenue (Tout télécharger)')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-alt hover:bg-border text-text-primary text-xs font-bold transition-colors border border-border"
        >
          <Download className="w-4 h-4 text-primary" />
          Tout télécharger (.zip)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KIT_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => handleDownload(item.titre)}
              className="group bg-white rounded-2xl p-5 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.color}`}
                  >
                    <IconComponent className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-alt text-text-muted">
                    {item.badge} • {item.taille}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
                    {item.titre}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Télécharger</span>
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
