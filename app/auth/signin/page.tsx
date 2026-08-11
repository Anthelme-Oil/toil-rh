'use client';

// ═══════════════════════════════════════════════════════════════
// Page de Connexion — Portail Intranet COMPEL STSL T-OIL
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { ShieldCheck, User, Sparkles, ArrowRight, Lock } from 'lucide-react';

export default function SignInPage() {
  const [selectedDemoAccount, setSelectedDemoAccount] = useState('it.helpdesk@togosh.com');
  const [customEmail, setCustomEmail] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoAccounts = [
    {
      label: 'Administrateur',
      email: 'it.helpdesk@togosh.com',
      badge: 'ADMIN',
      desc: 'Gestion des rôles, paramètres & publications',
    },
    {
      label: 'Supérieur N+1 (Manager)',
      email: 'it_helpdesk@compel-toil.com',
      badge: 'MANAGER',
      desc: 'Validation des demandes de congés des collaborateurs',
    },
    {
      label: 'Responsable RH',
      email: 'rh@compel-toil.com',
      badge: 'RH',
      desc: 'Validation finale RH & suivi des effectifs',
    },
    {
      label: 'Employé / Collaborateur',
      email: 'portail_test@compel-toil.com',
      badge: 'EMPLOYE',
      desc: 'Soumission des demandes & consultation intranet',
    },
  ];

  const handleDemoSignIn = async (emailToUse: string) => {
    setIsSubmitting(true);
    try {
      await signIn('credentials', {
        email: emailToUse,
        callbackUrl: '/',
      });
    } catch (err) {
      console.error('Erreur connexion démo:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0D1512] overflow-hidden px-4 py-12">
      {/* ── Effets d'arrière-plan esthétiques (Subtle Emerald Gradients) ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e2923_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* ── Conteneur Principal ── */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card au design verre dépoli (Glassmorphism Premium) */}
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-emerald-500/20 p-6 sm:p-8 shadow-2xl shadow-emerald-950/50">
          
          {/* En-tête : Logo T-OIL */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4 p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
              <Image
                src="/images/image.png"
                alt="Logo T-OIL"
                width={80}
                height={80}
                style={{ width: 'auto', height: '60px' }}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Portail Intranet T-OIL
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Espace collaboratif entreprise & système de gestion des demandes
            </p>
          </div>

          {/* ── Option 1 : Bouton SSO Microsoft 365 (Officiel Production) ── */}
          <div className="space-y-3">
            <button
              onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
              className="w-full group flex items-center justify-center gap-3 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-600/20 hover:-translate-y-0.5"
              id="btn-signin-microsoft"
            >
              {/* Icône Microsoft */}
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              <span>Se connecter avec Microsoft 365</span>
            </button>

            <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Authentification sécurisée Entra ID</span>
            </p>
          </div>

          {/* Séparateur élégant — visible uniquement en dev/test */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/30">
              Environnement Test & Démo
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* ── Option 2 : Connexion Démo / Test avec sélection de Rôle ── */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Choisir un profil de démonstration :
              </span>
              <button
                type="button"
                onClick={() => setUseCustom(!useCustom)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium"
              >
                {useCustom ? 'Liste des profils' : 'Email spécifique'}
              </button>
            </div>

            {!useCustom ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {demoAccounts.map((acc) => {
                  const isSelected = selectedDemoAccount === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => setSelectedDemoAccount(acc.email)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/40 text-white'
                          : 'border-slate-800/80 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="overflow-hidden mr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 truncate">{acc.label}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            acc.badge === 'ADMIN' ? 'bg-red-900/60 text-red-300' :
                            acc.badge === 'RH' ? 'bg-purple-900/60 text-purple-300' :
                            acc.badge === 'MANAGER' ? 'bg-blue-900/60 text-blue-300' :
                            'bg-emerald-900/60 text-emerald-300'
                          }`}>
                            {acc.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{acc.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-700'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Saisir votre adresse email..."
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <button
              onClick={() => handleDemoSignIn(useCustom ? customEmail : selectedDemoAccount)}
              disabled={isSubmitting || (useCustom && !customEmail)}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSubmitting ? 'Connexion en cours...' : 'Accéder au Portail (Session Active)'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
            </button>
          </div>

          {/* Footer de confidentialité */}
          <p className="text-[10px] text-slate-500 text-center mt-6 leading-relaxed">
            © {new Date().getFullYear()} COMPEL STSL T-OIL — Plateforme RH & Intranet d&apos;Entreprise.
          </p>
        </div>
      </div>
    </div>
  );
}
