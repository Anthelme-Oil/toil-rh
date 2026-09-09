'use client';

// ═══════════════════════════════════════════════════════════════
// Page de Connexion — Portail Intranet COMPEL STSL T-OIL
// ═══════════════════════════════════════════════════════════════

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { User, ArrowRight, AlertCircle, Mail, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function SignInForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

 const router = useRouter();

const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || isSubmitting) return;

  setIsSubmitting(true);

  try {
    const res = await signIn('credentials', {
      email: email.toLowerCase().trim(),
      callbackUrl: '/',
      redirect: false, 
    });

    if (res?.error) {
      // Une erreur est survenue (ex: mauvais identifiants)
      setIsSubmitting(false);
    } else if (res?.ok) {
      // Connexion réussie, redirection manuelle
      router.push('/');
      router.refresh();
    }
  } catch (err) {
    console.error('Erreur connexion:', err);
    setIsSubmitting(false);
  }
};

  return (
    <div className="bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-emerald-500/20 p-6 sm:p-8 shadow-2xl shadow-emerald-950/60">
      
      {/* ── En-tête : Logo Premium T-OIL ── */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-5 p-1 rounded-2xl bg-gradient-to-b from-emerald-500/30 via-slate-800/40 to-amber-500/20 shadow-xl shadow-emerald-950/80">
          <div className="bg-white px-4 py-2 rounded-[14px] flex items-center justify-center shadow-inner min-w-[100px] min-h-[100px]">
            <Image
              src="/images/logo_officiel_toil.png"
              alt="Logo Officiel T-OIL"
              width={100}
              height={100}
              className="object-contain h-[60px] w-[60px] drop-shadow-md transition-transform duration-300 hover:scale-105"
              // priority
            />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Portail Intranet T-OIL
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs font-medium">
          Espace collaboratif d&apos;entreprise & système de gestion des demandes
        </p>
      </div>

      {/* Alertes d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-200">
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

      {/* ── Formulaire de connexion par Email ── */}
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
            disabled={isSubmitting}
            placeholder="Ex: prenom.nom@togosh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all disabled:opacity-50 shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:opacity-70 text-white rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-emerald-500/30 disabled:border-slate-700 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 text-white animate-spin" />
              <span>Redirection en cours...</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-emerald-200" />
              <span>Se connecter</span>
              <ArrowRight className="w-4 h-4 ml-auto text-emerald-200" />
            </>
          )}
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
      {/* ── Effets d'arrière-plan esthétiques ── */}
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