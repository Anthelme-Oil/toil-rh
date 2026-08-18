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
  const [societe, setSociete] = useState<'T-Oil' | 'STSL' | 'COMPEL'>('T-Oil');
  const [emailPro, setEmailPro] = useState(userEmail || '');
  const [motif, setMotif] = useState<
    'Usage administratif' | 'Dossier bancaire' | 'Demande de visa' | 'Location immobilière' | 'Autre'
  >('Usage administratif');
  const [commentaire, setCommentaire] = useState('');
  const [poste, setPoste] = useState('');

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
    if (!emailPro.trim()) {
      setErrorMsg('Veuillez saisir votre adresse e-mail professionnelle.');
      return;
    }
    if (!motif) {
      setErrorMsg('Veuillez sélectionner un motif de demande.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const payload = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        societe,
        emailPro: emailPro.trim(),
        motif,
        commentaire: commentaire.trim(),
        poste: poste.trim(),
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
        setCommentaire('');
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
                Complétez les informations pour la délivrance de votre attestation
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
              Un e-mail automatique a été envoyé à la DRH pour validation. Votre attestation de travail sera disponible dès qu&apos;elle aura été traitée.
            </p>
          </div>
        ) : (
          /* ── Formulaire ── */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Nom et Prénom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Nom <span className="text-red-500">*</span>
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

            {/* 2. Société */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                2. Société <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {(['T-Oil', 'STSL', 'COMPEL'] as const).map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                      societe === item
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="societeAttestation"
                      value={item}
                      checked={societe === item}
                      onChange={() => setSociete(item)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Adresse e-mail professionnelle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Adresse e-mail professionnelle <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={emailPro}
                onChange={(e) => setEmailPro(e.target.value)}
                placeholder="nom@togosh.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* 4. Motif de la demande */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                4. Motif de la demande <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Usage administratif',
                  'Dossier bancaire',
                  'Demande de visa',
                  'Location immobilière',
                  'Autre',
                ].map((m) => (
                  <label
                    key={m}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      motif === m
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="motifAttestation"
                      value={m}
                      checked={motif === m}
                      onChange={() => setMotif(m as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Commentaires (facultatif) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                5. Commentaires (facultatif)
              </label>
              <textarea
                rows={3}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Précisions complémentaires sur votre demande..."
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
