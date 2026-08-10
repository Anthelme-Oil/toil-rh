'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, UserCheck, AlertCircle, CheckCircle2, Send, Paperclip, UploadCloud, FileText, Trash2 } from 'lucide-react';
import type { TypeConge } from '@/types';
import { useUser } from '@/context/UserContext';
import { UserAutocomplete } from '@/components/ui/UserAutocomplete';

interface AttachedFile {
  id: string;
  name: string;
  sizeFormatted: string;
  contentBase64: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
  userNom?: string;
}

export function DemandeCongeModal({ isOpen, onClose, onSuccess, userEmail: propEmail = '', userNom: propNom = '' }: Props) {
  const { userEmail: contextEmail, userName: contextName } = useUser();

  const currentEmail = propEmail || contextEmail || 'employe@togooil.com';
  const currentNom = propNom || contextName || currentEmail.split('@')[0];

  const [typeConge, setTypeConge] = useState<TypeConge>('autre');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [nombreJours, setNombreJours] = useState(1);
  const [managerEmail, setManagerEmail] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);


  // Calcul automatique du nombre de jours (hors week-ends)
  useEffect(() => {
    if (dateDebut && dateFin) {
      const start = new Date(dateDebut);
      const end = new Date(dateFin);
      if (end >= start) {
        let count = 0;
        const cur = new Date(start);
        while (cur <= end) {
          const day = cur.getDay();
          if (day !== 0 && day !== 6) {
            count++;
          }
          cur.setDate(cur.getDate() + 1);
        }
        setNombreJours(Math.max(count, 1));
      }
    }
  }, [dateDebut, dateFin]);

  // Helper formatage taille de fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const processFiles = (filesList: FileList | File[]) => {
    Array.from(filesList).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`Le fichier "${file.name}" dépasse la taille maximale autorisée (10 Mo).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            sizeFormatted: formatFileSize(file.size),
            contentBase64: base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateDebut || !dateFin) {
      setError('Veuillez sélectionner les dates de début et de fin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/demandes/conges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: 'Demande de congé',
          typeConge,
          dateDebut,
          dateFin,
          nombreJours,
          motif: 'Demande de congé',
          demandeurEmail: currentEmail,
          demandeurNom: currentNom,
          managerEmail,
          piecesJointes: attachedFiles.map((f) => ({
            name: f.name,
            contentBase64: f.contentBase64,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création de la demande');

      setSuccessMsg(true);
      setAttachedFiles([]);
      setTimeout(() => {
        setSuccessMsg(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Nouvelle Demande de Congé</h2>
              <p className="text-xs text-text-muted">Workflow de validation N+1 & RH</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        {successMsg ? (
          <div className="py-12 flex flex-col items-center text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
            <h3 className="text-lg font-bold text-text-primary">Demande transmise avec succès !</h3>
            <p className="text-xs text-text-muted">Elle est actuellement transmise à votre N+1 pour validation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Type de congé (EN PREMIER CHAMP DU FORMULAIRE) */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Type de congé</label>
              <select
                value={typeConge}
                onChange={(e) => setTypeConge(e.target.value as TypeConge)}
                className="w-full px-3 py-2 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
              >
                <option value="autre">Autre</option>
                <option value="conge_paye">Congé Payé</option>
                <option value="maladie">Arrêt Maladie</option>
                <option value="maternite_paternite">Maternité / Paternité</option>
                <option value="evenement_familial">Événement Familial</option>
                <option value="sans_solde">Congé Sans Solde</option>
              </select>
            </div>

            {/* 2. Période (Date début congé & Date fin congé) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Date début congé</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Date fin congé</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                />
              </div>
            </div>

            {/* 3. Nombre de jours calculé */}
            <div className="p-2.5 bg-surface-alt/60 rounded-xl flex items-center justify-between border border-border/50">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Clock className="w-4 h-4 text-primary" />
                <span>Nombre de jours ouvrés calculés :</span>
              </div>
              <span className="text-sm font-bold text-primary">{nombreJours} jour(s)</span>
            </div>

            {/* 4. Supérieur hiérarchique avec auto-complétion Annuaire M365 */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Supérieur hiérarchique
              </label>
              <UserAutocomplete
                value={managerEmail}
                onChange={setManagerEmail}
                placeholder="Tapez le nom ou l'e-mail du supérieur hiérarchique..."
                required
                dropUp={true}
              />
            </div>

            {/* 5. Pièces jointes / Justificatifs */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-primary" />
                  Pièces jointes / Justificatifs <span className="text-text-muted font-normal">(Optionnel)</span>
                </span>
                <span className="text-[10px] text-text-muted">PDF, PNG, JPG (Max 10 Mo)</span>
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-primary bg-primary/10 scale-[0.99]'
                    : 'border-border hover:border-primary/50 bg-surface-alt/40 hover:bg-surface-alt'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-primary">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-text-primary font-medium">
                    <span className="text-primary font-bold">Cliquez ici</span> ou glissez vos justificatifs (ex: Certificat médical)
                  </p>
                </div>
              </div>

              {/* Liste des pièces jointes sélectionnées */}
              {attachedFiles.length > 0 && (
                <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-alt border border-border text-xs shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-semibold text-text-primary truncate">{file.name}</span>
                        <span className="text-[10px] text-text-muted flex-shrink-0">({file.sizeFormatted})</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="p-1 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Supprimer le fichier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>



            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Soumettre la demande</span>
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
