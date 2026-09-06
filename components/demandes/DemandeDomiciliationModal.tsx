'use client';

// ═══════════════════════════════════════════════════════════════
// Modale — Demande de Domiciliation Bancaire
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  X,
  Landmark,
  Upload,
  Calendar,
  Building2,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface DemandeDomiciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LISTE_BANQUES = [
  'Ecobank Togo',
  'Orabank Togo',
  'Société Générale (SG Togo)',
  'BOA (Bank of Africa)',
  'Banque Atlantique Togo',
  'NSIA Banque',
  'UTB (Union Togolaise de Banque)',
  'IB Bank Togo',
  'Coris Bank International',
  'BIA Togo',
  'La Poste Togolaise (CCP)',
  'Autre établissement bancaire',
];

export function DemandeDomiciliationModal({
  isOpen,
  onClose,
  onSuccess,
}: DemandeDomiciliationModalProps) {
  const { userName, userEmail } = useUser();

  // States pour les 10 champs du formulaire de domiciliation
  const [matricule, setMatricule] = useState('');
  const nameParts = (userName || '').split(' ');
  const [nom, setNom] = useState(nameParts[0] || '');
  const [prenom, setPrenom] = useState(nameParts.slice(1).join(' ') || '');
  const [societe, setSociete] = useState<'T-Oil' | 'STSL' | 'COMPEL'>('T-Oil');
  const [poste, setPoste] = useState('');
  const [departement, setDepartement] = useState('');
  const [objetDemandeType, setObjetDemandeType] = useState<'Demande de crédit' | 'Autres'>('Demande de crédit');
  const [objetAutre, setObjetAutre] = useState('');
  const [emailPro, setEmailPro] = useState(userEmail || '');
  const [telephone, setTelephone] = useState('');
  const [banque, setBanque] = useState(LISTE_BANQUES[0]);
  const [agenceBancaire, setAgenceBancaire] = useState('');
  const [dateSouhaitee, setDateSouhaitee] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [commentaire, setCommentaire] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Status state
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMsg('Le fichier ne doit pas dépasser 5 Mo.');
        return;
      }
      setFile(selectedFile);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (objetDemandeType === 'Autres' && !objetAutre.trim()) {
      setErrorMsg("Veuillez préciser l'objet de votre demande.");
      return;
    }
    if (!nom.trim() || !prenom.trim()) {
      setErrorMsg('Veuillez remplir le nom et le prénom.');
      return;
    }
    if (!poste.trim()) {
      setErrorMsg('Veuillez préciser le poste occupé.');
      return;
    }
    if (!departement.trim()) {
      setErrorMsg('Veuillez indiquer votre département / service.');
      return;
    }
    if (!emailPro.trim()) {
      setErrorMsg('Veuillez renseigner votre adresse e-mail professionnelle.');
      return;
    }
    if (!telephone.trim()) {
      setErrorMsg('Veuillez indiquer un numéro de téléphone.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      let base64Content = null;
      let fileName = null;

      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve, reject) => {
          reader.onload = () => {
            base64Content = (reader.result as string).split(',')[1];
            fileName = file.name;
            resolve(true);
          };
          reader.onerror = reject;
        });
      }

      const finalObjet = objetDemandeType === 'Autres' ? (objetAutre.trim() || 'Autres') : 'Demande de crédit';

      const payload = {
        matricule: matricule.trim(),
        nom: nom.trim(),
        prenom: prenom.trim(),
        societe,
        poste: poste.trim(),
        departement: departement.trim(),
        objetDemande: finalObjet,
        emailPro: emailPro.trim(),
        telephone: telephone.trim(),
        banque,
        agenceBancaire: agenceBancaire.trim(),
        dateSouhaitee,
        commentaire: commentaire.trim(),
        demandeurEmail: userEmail,
        pieceJointe: file
          ? {
              name: fileName,
              contentBase64: base64Content,
            }
          : null,
      };

      const res = await fetch('/api/demandes/domiciliation', {
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
        setFile(null);
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
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 my-8">
        {/* ── En-tête ── */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Demande de Domiciliation Bancaire</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Remplissez les informations de domiciliation bancaire pour transmission aux RH
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
              Un e-mail automatique a été envoyé à la DRH pour validation. Vous recevrez une notification dès qu'elle aura été traitée.
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

            {/* 1. Numéro de matricule (Optionnel) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Numéro de matricule <span className="text-slate-400 font-normal">(Optionnel)</span>
              </label>
              <input
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="Ex: EMP-2024-042 (optionnel)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* 2. Nom et Prénom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            {/* 3. Société */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                3. Société <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {(['T-Oil', 'STSL', 'COMPEL'] as const).map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                      societe === item
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="societe"
                      value={item}
                      checked={societe === item}
                      onChange={() => setSociete(item)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Poste occupé & 5. Département / Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Poste occupé <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={poste}
                  onChange={(e) => setPoste(e.target.value)}
                  placeholder="Ex: Chef de Projet / Comptable..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  5. Département / Service <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={departement}
                  onChange={(e) => setDepartement(e.target.value)}
                  placeholder="Ex: Direction des Systèmes d'Information"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            {/* 6. Établissement Bancaire & Agence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  6. Banque <span className="text-red-500">*</span>
                </label>
                <select
                  value={banque}
                  onChange={(e) => setBanque(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
                >
                  {LISTE_BANQUES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Agence Bancaire <span className="text-slate-400 font-normal">(Optionnel)</span>
                </label>
                <input
                  type="text"
                  value={agenceBancaire}
                  onChange={(e) => setAgenceBancaire(e.target.value)}
                  placeholder="ex: Agence Principale Lomé / Tokoin... (optionnel)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            {/* 7. Objet de la demande */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                7. Objet de la demande <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(['Demande de crédit', 'Autres'] as const).map((obj) => (
                  <label
                    key={obj}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      objetDemandeType === obj
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="objetDemandeType"
                      value={obj}
                      checked={objetDemandeType === obj}
                      onChange={() => setObjetDemandeType(obj)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    {obj}
                  </label>
                ))}
              </div>

              {objetDemandeType === 'Autres' && (
                <div className="pt-1 animate-in fade-in-50 duration-200">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Précisez l&apos;objet de votre demande <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={objetAutre}
                    onChange={(e) => setObjetAutre(e.target.value)}
                    placeholder="Ex: Demande de découvert, Attestation d'engagement..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              )}
            </div>

            {/* 8. Adresse e-mail professionnelle & 9. Numéro de téléphone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  8. Adresse e-mail professionnelle <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailPro}
                  onChange={(e) => setEmailPro(e.target.value)}
                  placeholder="nom@togosh.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  9. Numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+228 90 00 00 00"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Date souhaitée */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Date souhaitée pour l'effet de la domiciliation
              </label>
              <input
                type="date"
                value={dateSouhaitee}
                onChange={(e) => setDateSouhaitee(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* 10. Commentaires complémentaires */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                10. Commentaires complémentaires (Optionnel)
              </label>
              <textarea
                rows={2}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Précisions complémentaires concernant votre demande..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* Upload RIB / Attestation bancaire */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                RIB ou Attestation Bancaire (Pièce Jointe Optionnelle/Recommandée)
              </label>
              <div className="mt-1 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center transition-colors bg-slate-50/50 hover:bg-emerald-50/30">
                <input
                  type="file"
                  id="rib-file-input"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="rib-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <FileCheck className="w-8 h-8 text-emerald-600" />
                  {file ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-800">{file.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {(file.size / 1024).toFixed(1)} Ko — Cliquez pour changer
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Cliquez pour ajouter votre RIB ou attestation bancaire
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Formats acceptés : PDF, PNG, JPG (Max 5 Mo)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
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
