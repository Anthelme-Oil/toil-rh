import React, { useState } from 'react';
import { 
  FileCheck2, 
  FileText, 
  Send, 
  X 
} from 'lucide-react';


interface AttestationFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}
interface AttestationFormData {
  lastName: string;
  firstName: string;
  company: string;
  email: string;
  reason: string;
  comments: string;
}

export default function AttestationForm({ onCancel, onSuccess }:AttestationFormProps) {
  const [formData, setFormData] = useState<AttestationFormData>({
    lastName: '',
    firstName: '',
    company: 'T-Oil',
    email: '',
    reason: 'Usage administratif',
    comments: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: keyof AttestationFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess?.();
    }, 600);
  };

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden text-slate-800">
      
      {/* Header Blanc Clean */}
      <div className="p-6 pb-5 border-b border-slate-100 flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Demande d'Attestation de Travail
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Complétez les informations pour la délivrance de votre attestation
            </p>
          </div>
        </div>
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        
        {/* 1. Nom & Prénom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              1. Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="KPODAR"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Têko Anthelme"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        {/* 2. Société */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            2. Société <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3 pt-0.5">
            {['T-Oil', 'STSL', 'COMPEL'].map((comp) => {
              const isSelected = formData.company === comp;
              return (
                <label
                  key={comp}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="company"
                    value={comp}
                    checked={isSelected}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="accent-emerald-600 h-3.5 w-3.5"
                  />
                  {comp}
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. Adresse e-mail professionnelle */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            3. Adresse e-mail professionnelle <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="anthelme.kpodar@togosh.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
          />
        </div>

        {/* 4. Motif de la demande */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            4. Motif de la demande <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            {[
              'Usage administratif',
              'Dossier bancaire',
              'Demande de visa',
              'Location immobilière',
              'Autre',
            ].map((reason) => {
              const isSelected = formData.reason === reason;
              return (
                <label
                  key={reason}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/30 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={isSelected}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    className="accent-emerald-600 h-3.5 w-3.5"
                  />
                  {reason}
                </label>
              );
            })}
          </div>
        </div>

        {/* 5. Commentaires (facultatif) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            5. Commentaires (facultatif)
          </label>
          <textarea
            rows={3}
            placeholder="Précisions complémentaires sur votre demande..."
            value={formData.comments}
            onChange={(e) => handleChange('comments', e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all resize-none"
          />
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Annuler
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#006644] hover:bg-emerald-800 text-white font-semibold text-xs px-6 py-2.5 rounded-full transition-all shadow-xs disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande'}
          </button>
        </div>

      </form>
    </div>
  );
}