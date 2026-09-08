'use client';

// ═══════════════════════════════════════════════════════════════
// Page de Connexion — Portail Intranet COMPEL STSL T-OIL
// ═══════════════════════════════════════════════════════════════

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, User, ArrowRight, AlertCircle, Mail } from 'lucide-react';

function SignInForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await signIn('credentials', {
        email: email.toLowerCase().trim(),
        callbackUrl: '/',
      });
    } catch (err) {
      console.error('Erreur connexion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-emerald-500/20 p-6 sm:p-8 shadow-2xl shadow-emerald-950/50">
      
      {/* En-tête : Logo T-OIL */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-4 p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
          <Image
            src="/images/logo_officiel_toil.png"
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
          Espace collaboratif d&apos;entreprise & système de gestion des demandes
        </p>
      </div>

      {/* Alertes d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-955/20 border border-red-800/30 rounded-2xl flex items-start gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Échec de la connexion :</span>{' '}
            {error === 'CredentialsSignin' 
              ? "Cette adresse email n'est pas reconnue dans l'annuaire de l'entreprise. Veuillez contacter un administrateur."
              : error === 'AccessDenied' || error === 'OAuthAccessDenied'
              ? "Accès refusé. Votre compte Microsoft ne fait pas partie de l'annuaire de l'entreprise (Tenant Entra ID non autorisé)."
              : "Une erreur est survenue lors de la connexion. Veuillez réessayer."}
          </div>
        </div>
      )}

      {/* ── Option 1 : Bouton SSO Microsoft 365 (Officiel Production) ── */}
      {/* <div className="space-y-3">
        <button
          onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
          className="w-full group flex items-center justify-center gap-3 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-600/20 hover:-translate-y-0.5"
          id="btn-signin-microsoft"
        >
        
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
      </div> */}

      {/* Séparateur élégant */}
      {/* <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          ou
        </span>
        <div className="h-px flex-1 bg-slate-800" />
      </div> */}

      {/* ── Option 2 : Connexion par Email ── */}
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            Adresse e-mail professionnelle :
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="Ex: prenom.nom@togosh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-slate-700 shadow-md"
        >
          <User className="w-4 h-4 text-emerald-400" />
          <span>{isSubmitting ? 'Connexion en cours...' : 'Se connecter'}</span>
          <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
        </button>
      </form>

      {/* Footer de confidentialité */}
      <p className="text-[10px] text-slate-500 text-center mt-8 leading-relaxed">
        © {new Date().getFullYear()} COMPEL STSL T-OIL — Plateforme RH & Intranet d&apos;Entreprise.
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0D1512] overflow-hidden px-4 py-12">
      {/* ── Effets d'arrière-plan esthétiques (Subtle Emerald Gradients) ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e2923_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* ── Conteneur Principal ── */}
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-emerald-500/20 p-8 text-center text-slate-400">
            Chargement...
          </div>
        }>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
