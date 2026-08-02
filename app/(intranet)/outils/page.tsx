// ═══════════════════════════════════════════════════════════════
// Page Outils — Accès aux outils Microsoft 365
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Grid3X3, ExternalLink } from 'lucide-react';
import { outilsM365 } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Outils & Applications',
  description: 'Accédez à tous vos outils Microsoft 365 depuis un seul endroit.',
};

export default function OutilsPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* ── Fil d'Ariane ── */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">Outils</span>
      </div>

      {/* ── En-tête ── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
          <Grid3X3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Outils & Applications</h1>
          <p className="text-sm text-text-secondary">
            Accédez rapidement à tous vos outils Microsoft 365
          </p>
        </div>
      </div>

      {/* ── Grille d'outils ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {outilsM365.map((outil, i) => (
          <a
            key={outil.nom}
            href={outil.url}
            target={outil.url.startsWith('/') ? '_self' : '_blank'}
            rel={outil.url.startsWith('/') ? undefined : 'noopener noreferrer'}
            className={`bg-white rounded-xl p-6 flex flex-col items-center gap-4 card-hover group animate-fade-in-up delay-${Math.min(i + 1, 5)}`}
            style={{ boxShadow: 'var(--shadow-card)' }}
            id={`outil-page-${outil.nom.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="w-16 h-16 relative transition-transform duration-200 group-hover:scale-110">
              <Image
                src={outil.icone}
                alt={outil.nom}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                {outil.nom}
              </h3>
              <div className="flex items-center gap-1 justify-center mt-1 text-text-muted">
                <ExternalLink className="w-3 h-3" />
                <span className="text-[11px]">Ouvrir</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* ── Section liens utiles ── */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-text-primary mb-4">Liens utiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Centre d\'administration M365',
              desc: 'Gestion des licences et des utilisateurs',
              url: 'https://admin.microsoft.com',
              color: 'from-blue-500 to-blue-600',
            },
            {
              title: 'Azure Portal',
              desc: 'Console d\'administration cloud',
              url: 'https://portal.azure.com',
              color: 'from-cyan-500 to-blue-500',
            },
            {
              title: 'Power Automate',
              desc: 'Automatisation des workflows',
              url: 'https://make.powerautomate.com',
              color: 'from-blue-600 to-indigo-600',
            },
          ].map((link) => (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-5 card-hover group"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center mb-3`}>
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                {link.title}
              </h3>
              <p className="text-xs text-text-secondary mt-1">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
