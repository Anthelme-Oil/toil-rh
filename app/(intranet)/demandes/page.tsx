'use client';

// ═══════════════════════════════════════════════════════════════
// Page Demandes & Services — Formulaire + Liste des demandes
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardList,
  Package,
  KeyRound,
  Monitor,
  FileText,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { TypeDemande, PrioriteDemande } from '@/types';

const typeOptions: { value: TypeDemande; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'materiel', label: 'Demande de matériel', icon: Package, color: 'text-primary' },
  { value: 'acces', label: "Demande d'accès", icon: KeyRound, color: 'text-blue-600' },
  { value: 'it', label: 'Demande IT / Support', icon: Monitor, color: 'text-amber' },
  { value: 'rh', label: 'Demande RH', icon: FileText, color: 'text-accent' },
];

const prioriteOptions: { value: PrioriteDemande; label: string; color: string }[] = [
  { value: 'basse', label: 'Basse', color: 'bg-gray-100 text-gray-600' },
  { value: 'normale', label: 'Normale', color: 'bg-primary-50 text-primary' },
  { value: 'haute', label: 'Haute', color: 'bg-amber-50 text-amber' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-50 text-red-600' },
];

export default function DemandesPage() {
  const [type, setType] = useState<TypeDemande>('it');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [priorite, setPriorite] = useState<PrioriteDemande>('normale');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, type, description, priorite }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la soumission');
      }

      setStatus('success');
      setTitre('');
      setDescription('');
      setPriorite('normale');

      // Reset après 5 secondes
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* ── Fil d'Ariane ── */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium">Demandes & Services</span>
      </div>

      {/* ── En-tête ── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Demandes & Services</h1>
          <p className="text-sm text-text-secondary">
            Soumettez une nouvelle demande ou suivez vos demandes existantes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Formulaire de demande ── */}
        <div className="lg:col-span-2">
          <div
            className="bg-white rounded-xl p-6 animate-fade-in-up"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <h2 className="text-lg font-bold text-text-primary mb-6">
              Nouvelle demande
            </h2>

            {status === 'success' ? (
              <div className="text-center py-12 animate-fade-in">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Demande envoyée avec succès !
                </h3>
                <p className="text-sm text-text-secondary max-w-md mx-auto">
                  Votre demande a été enregistrée et un workflow de traitement
                  a été déclenché automatiquement. Vous serez notifié de l&apos;avancement.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type de demande */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">
                    Type de demande
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {typeOptions.map((opt) => {
                      const Icon = opt.icon;
                      const selected = type === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setType(opt.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                            selected
                              ? 'border-primary bg-primary-50 shadow-sm'
                              : 'border-border hover:border-primary/30 hover:bg-surface-alt'
                          }`}
                          id={`type-${opt.value}`}
                        >
                          <Icon className={`w-6 h-6 ${selected ? 'text-primary' : opt.color}`} />
                          <span className={`text-xs font-medium text-center ${selected ? 'text-primary-dark' : 'text-text-secondary'}`}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Titre */}
                <div>
                  <label htmlFor="titre" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Titre de la demande *
                  </label>
                  <input
                    id="titre"
                    type="text"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Ex: Demande de double écran pour le bureau 204"
                    required
                    minLength={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Priorité */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Priorité
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {prioriteOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPriorite(opt.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                          priorite === opt.value
                            ? `${opt.color} border-current shadow-sm`
                            : 'bg-surface-alt text-text-secondary border-transparent hover:bg-surface-hover'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Description détaillée *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre demande en détail : contexte, besoin, urgence..."
                    required
                    minLength={10}
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                  />
                </div>

                {/* Erreur */}
                {status === 'error' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}

                {/* Bouton soumettre */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                  id="btn-submit-demande"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Soumettre la demande
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Aide et infos ── */}
        <div className="space-y-6">
          <div
            className="bg-white rounded-xl p-6 animate-fade-in-up delay-2"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <h3 className="text-base font-bold text-text-primary mb-4">
              Comment ça marche ?
            </h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Remplissez le formulaire', desc: 'Choisissez le type et décrivez votre besoin.' },
                { step: '2', title: 'Soumission automatique', desc: 'Votre demande est enregistrée dans Microsoft Lists.' },
                { step: '3', title: 'Workflow activé', desc: 'Power Automate notifie les responsables.' },
                { step: '4', title: 'Suivi en temps réel', desc: 'Suivez l\'avancement depuis votre espace.' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                    <p className="text-xs text-text-secondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white animate-fade-in-up delay-3"
          >
            <h3 className="text-base font-bold mb-2">Besoin d&apos;aide urgente ?</h3>
            <p className="text-sm text-white/80 mb-4">
              Pour les incidents critiques, contactez directement le support IT.
            </p>
            <a
              href="mailto:support-it@compel-toil.com"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
            >
              📧 support-it@compel-toil.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
