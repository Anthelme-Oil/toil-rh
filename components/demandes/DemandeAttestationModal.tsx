'use client';

// ═══════════════════════════════════════════════════════════════
// Modale — Demande d'Attestation de Travail (T-OIL / STSL / COMPEL)
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  X,
  Building2,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface DemandeAttestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LISTE_SOCIETES = [
  { id: 'T-OIL', label: 'T-OIL S.A.' },
  { id: 'STSL', label: 'STSL S.A. (Société Togolaise de Stockage de Lomé)' },
  { id: 'COMPEL', label: 'COMPEL S.A.' },
];

export function DemandeAttestationModal({
  isOpen,
  onClose,
  onSuccess,
}: DemandeAttestationModalProps) {
  const { userName, userEmail } = useUser();

  const nameParts = (userName || '').split(' ');
  const [nom, setNom] = useState(nameParts[0] || '');
  const [prenom, setPrenom] = useState(nameParts.slice(1).join(' ') || '');
  const [societe, setSociete] = useState<'T-OIL' | 'STSL' | 'COMPEL'>('T-OIL');
  const [poste, setPoste] = useState('');
  const [motif, setMotif] = useState('');

  // Status state
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) {
      setErrorMsg('Veuillez renseigner votre nom et votre prénom.');
      return;
    }
    if (!motif.trim()) {
      setErrorMsg('Veuillez indiquer le motif de votre demande d\'attestation.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const payload = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        societe,
        poste: poste.trim(),
        motif: motif.trim(),
        demandeurEmail: userEmail,
      };

      const res = await fetch('/api/demandes/attestation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la soumission.');
      }

      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setMotif('');
        setPoste('');
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 my-8">
        {/* ── En-tête ── */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Demande d&apos;Attestation de Travail</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Sélectionnez votre société (T-OIL, STSL ou COMPEL) et indiquez le motif
              </p>
            </div>
          </div>
        </div>

        {/* ── Succès ── */}
        {status === 'success' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Demande transmise avec succès !</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Un e-mail automatique a été envoyé à la DRH pour validation. Votre attestation de travail sera disponible dès validation.
            </p>
          </div>
        ) : (
          /* ── Formulaire ── */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Société */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Société / Entité d&apos;appartenance <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5 mt-1">
                {LISTE_SOCIETES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSociete(item.id as 'T-OIL' | 'STSL' | 'COMPEL')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      societe === item.id
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50'
                    }`}
                  >
                    <span className="text-sm font-extrabold">{item.id}</span>
                    <span className="text-[10px] text-slate-500 font-normal leading-tight line-clamp-1">
                      {item.id === 'T-OIL' ? 'T-OIL S.A.' : item.id === 'STSL' ? 'STSL S.A.' : 'COMPEL S.A.'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Identité */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Votre prénom"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Fonction / Poste */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                Poste / Fonction occupée (Optionnel)
              </label>
              <input
                type="text"
                value={poste}
                onChange={(e) => setPoste(e.target.value)}
                placeholder="ex: Chef Service Informatique, Comptable, Commercial..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* Motif de la demande */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Motif de la demande d&apos;attestation <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Précisez le motif (ex: Constituer un dossier de visa, Demande de prêt bancaire, Démarche administrative...)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-800 hover:from-blue-800 hover:to-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transmission...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Soumettre la demande
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
