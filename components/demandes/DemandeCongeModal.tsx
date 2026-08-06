'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, UserCheck, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import type { TypeConge } from '@/types';
import { useUser } from '@/context/UserContext';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création de la demande');

      setSuccessMsg(true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
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
                <option value="rtt">RTT</option>
                <option value="maladie">Congé Maladie</option>
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

            {/* 4. Supérieur hiérarchique */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Supérieur hiérarchique
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="nom.prenom@togooil.com"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                />
                <UserCheck className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              </div>
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
