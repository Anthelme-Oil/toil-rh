// ═══════════════════════════════════════════════════════════════
// Page Communautés
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Users, MessageSquare, Hash, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Communautés',
  description: 'Rejoignez les communautés de pratique et les groupes de discussion.',
};

const communautes = [
  {
    id: 1,
    nom: 'HSE & Sécurité',
    description: 'Partagez les bonnes pratiques en matière de sécurité et d\'environnement.',
    membres: 87,
    messages: 245,
    couleur: 'from-primary to-primary-dark',
    emoji: '🛡️',
  },
  {
    id: 2,
    nom: 'Innovation & Digital',
    description: 'Échangez sur les nouvelles technologies et les projets de transformation digitale.',
    membres: 54,
    messages: 128,
    couleur: 'from-blue-500 to-blue-700',
    emoji: '💡',
  },
  {
    id: 3,
    nom: 'Vie d\'entreprise',
    description: 'Activités sociales, événements et vie quotidienne au sein de COMPEL STSL.',
    membres: 120,
    messages: 412,
    couleur: 'from-amber to-orange-500',
    emoji: '🎉',
  },
  {
    id: 4,
    nom: 'Formation continue',
    description: 'Partagez des ressources d\'apprentissage et des retours d\'expérience.',
    membres: 42,
    messages: 89,
    couleur: 'from-purple-500 to-purple-700',
    emoji: '📚',
  },
  {
    id: 5,
    nom: 'Support technique',
    description: 'Entraide et résolution collaborative des problèmes techniques.',
    membres: 65,
    messages: 310,
    couleur: 'from-teal-500 to-teal-700',
    emoji: '🔧',
  },
  {
    id: 6,
    nom: 'Direction & Stratégie',
    description: 'Communications de la direction et discussions stratégiques.',
    membres: 30,
    messages: 56,
    couleur: 'from-gray-600 to-gray-800',
    emoji: '📊',
  },
];

export default function CommunautesPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">Communautés</span>
      </div>

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Communautés</h1>
          <p className="text-sm text-text-secondary">
            Rejoignez des groupes de discussion et partagez vos idées
          </p>
        </div>
      </div>

      {/* Info Yammer / Viva Engage */}
      <div
        className="bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl p-5 mb-8 flex items-center gap-4"
      >
        <MessageSquare className="w-10 h-10 text-primary flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-primary-dark">
            Intégration Microsoft Viva Engage
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Les communautés sont synchronisées avec Microsoft Viva Engage (anciennement Yammer).
            Vos messages et discussions sont accessibles depuis les deux plateformes.
          </p>
        </div>
      </div>

      {/* Grille des communautés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {communautes.map((c, i) => (
          <div
            key={c.id}
            className={`bg-white rounded-xl overflow-hidden card-hover animate-fade-in-up delay-${Math.min(i + 1, 5)}`}
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* Header coloré */}
            <div className={`bg-gradient-to-r ${c.couleur} p-4 flex items-center gap-3`}>
              <span className="text-3xl">{c.emoji}</span>
              <h3 className="text-white font-bold text-base">{c.nom}</h3>
            </div>

            {/* Contenu */}
            <div className="p-5">
              <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                {c.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {c.membres} membres
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> {c.messages} messages
                </span>
              </div>

              <button className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary-50 text-primary hover:bg-primary hover:text-white transition-all duration-200">
                Rejoindre la communauté
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
