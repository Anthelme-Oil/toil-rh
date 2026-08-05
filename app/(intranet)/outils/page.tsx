// ═══════════════════════════════════════════════════════════════
// Page Outils — Microsoft 365, Applications Métiers & Autres Outils
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Grid3X3 } from 'lucide-react';
import { outilsM365 } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Outils & Applications | COMPEL STSL T-OIL',
  description: 'Accédez à vos applications Microsoft 365 et applications métiers.',
};

export default function OutilsPage() {
  const m365Outils = outilsM365.filter((o) => o.categorie === 'Microsoft 365');
  const metiersOutils = outilsM365.filter((o) => o.categorie === 'Applications métiers');
  const autresOutils = outilsM365.filter((o) => o.categorie === 'Autres outils M365' || (!o.categorie && !m365Outils.includes(o) && !metiersOutils.includes(o)));

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
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
          <Grid3X3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Outils & Applications</h1>
          <p className="text-sm text-text-secondary">
            Accédez à toutes vos applications d&apos;entreprise depuis un seul espace
          </p>
        </div>
      </div>

      {/* ── Section 1 : Microsoft 365 (Principaux) ── */}
      <section className="mb-10">
        <h2 className="text-xl font-extrabold text-text-primary mb-4 flex items-center gap-2">
          Microsoft 365
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {m365Outils.map((outil) => (
            <a
              key={outil.nom}
              href={outil.url}
              target={outil.url.startsWith('/') ? '_self' : '_blank'}
              rel={outil.url.startsWith('/') ? undefined : 'noopener noreferrer'}
              className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 card-hover group animate-fade-in-up border border-border/60 hover:border-primary/30 transition-all"
              style={{ boxShadow: 'var(--shadow-card)' }}
              id={`outil-m365-${outil.nom.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="w-14 h-14 relative transition-transform duration-200 group-hover:scale-110 flex items-center justify-center">
                <Image
                  src={outil.icone}
                  alt={outil.nom}
                  width={56}
                  height={56}
                  style={{ width: 'auto', height: 'auto' }}
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                  {outil.nom}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Section 2 : Applications métiers ── */}
      <section className="mb-10">
        <h2 className="text-xl font-extrabold text-text-primary mb-4 flex items-center gap-2">
          Applications métiers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {metiersOutils.map((outil) => (
            <a
              key={outil.nom}
              href={outil.url}
              target={outil.url.startsWith('/') ? '_self' : '_blank'}
              rel={outil.url.startsWith('/') ? undefined : 'noopener noreferrer'}
              className="bg-white rounded-xl p-5 flex flex-col items-center gap-3 card-hover group animate-fade-in-up border border-border/60 hover:border-primary/30 transition-all"
              style={{ boxShadow: 'var(--shadow-card)' }}
              id={`outil-metier-${outil.nom.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="w-14 h-14 relative transition-transform duration-200 group-hover:scale-110 flex items-center justify-center">
                <Image
                  src={outil.icone}
                  alt={outil.nom}
                  width={56}
                  height={56}
                  style={{ width: 'auto', height: 'auto' }}
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors leading-tight">
                  {outil.nom}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Section 3 : Autres outils M365 & Services ── */}
      {autresOutils.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-extrabold text-text-primary mb-4 flex items-center gap-2">
            Autres outils & services M365
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {autresOutils.map((outil) => (
              <a
                key={outil.nom}
                href={outil.url}
                target={outil.url.startsWith('/') ? '_self' : '_blank'}
                rel={outil.url.startsWith('/') ? undefined : 'noopener noreferrer'}
                className="bg-white rounded-xl p-5 flex flex-col items-center gap-3 card-hover group animate-fade-in-up border border-border/60 hover:border-primary/30 transition-all"
                style={{ boxShadow: 'var(--shadow-card)' }}
                id={`outil-autre-${outil.nom.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-12 h-12 relative transition-transform duration-200 group-hover:scale-110 flex items-center justify-center">
                  <Image
                    src={outil.icone}
                    alt={outil.nom}
                    width={48}
                    height={48}
                    style={{ width: 'auto', height: 'auto' }}
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors leading-tight">
                    {outil.nom}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
