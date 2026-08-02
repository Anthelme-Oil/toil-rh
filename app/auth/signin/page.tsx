'use client';

// ═══════════════════════════════════════════════════════════════
// Page de connexion — SSO Microsoft Entra ID
// ═══════════════════════════════════════════════════════════════

import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-900 via-primary-dark to-primary px-4">
      {/* Card de connexion */}
      <div
        className="bg-white rounded-2xl p-8 sm:p-10 w-full max-w-md animate-fade-in-up"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        {/* Logo officiel T-OIL */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/image.png"
            alt="Logo T-OIL"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
        </div>

        {/* Titre */}
        <h1 className="text-xl font-bold text-text-primary text-center mb-2">
          Bienvenue sur l&apos;intranet
        </h1>
        <p className="text-sm text-text-secondary text-center mb-8">
          Connectez-vous avec votre compte Microsoft 365 professionnel
        </p>

        {/* Bouton SSO Microsoft */}
        <button
          onClick={() => {
            // En production : signIn('microsoft-entra-id')
            window.location.href = '/';
          }}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#2F2F2F] hover:bg-[#404040] text-white rounded-xl font-semibold text-sm transition-colors duration-200 focus-ring"
          id="btn-signin-microsoft"
        >
          {/* Logo Microsoft */}
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          Se connecter avec Microsoft
        </button>

        {/* Séparateur */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-muted">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Mode démo */}
        <button
          onClick={() => {
            window.location.href = '/';
          }}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary hover:bg-primary-50 rounded-xl font-semibold text-sm transition-colors duration-200 focus-ring"
          id="btn-demo-mode"
        >
          🔓 Mode démonstration
        </button>

        <p className="text-[11px] text-text-muted text-center mt-6 leading-relaxed">
          En vous connectant, vous acceptez les conditions d&apos;utilisation
          de la plateforme intranet COMPEL STSL T-OIL.
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-white/50 mt-8">
        © {new Date().getFullYear()} COMPEL STSL T-OIL — Portail intranet sécurisé
      </p>
    </div>
  );
}
