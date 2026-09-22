import React, { useState } from 'react';
import { 
  Building, 
  Calendar, 
  FileText, 
  FileCheck, 
  Send, 
  X 
} from 'lucide-react';

interface AttestationFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}
interface DomiciliationFormData {
     matricule: string,
    lastName: string,
    firstName: string,
    company: string,
    jobTitle: string,
    department: string,
    bank: string,
    bankBranch: string,
    requestReason: string,
    email: string,
    phone: string,
    effectiveDate: string,
    comments: string,
    file: null,
}

export default function DomiciliationForm({ onCancel, onSuccess }:AttestationFormProps) {
  const [formData, setFormData] = useState<DomiciliationFormData>({
    matricule: '',
    lastName: '',
    firstName: '',
    company: 'T-Oil',
    jobTitle: '',
    department: '',
    bank: 'Ecobank Togo',
    bankBranch: '',
    requestReason: 'Demande de crédit',
    email: '',
    phone: '',
    effectiveDate: '2026-09-22',
    comments: '',
    file: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof DomiciliationFormData, value:string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 text-slate-800">
      <div className=" p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
            <Building className="h-6 w-6 text-black" />
          </div>
          <div>
            <h2 className="text-black font-bold tracking-tight">
              Demande de Domiciliation Bancaire
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Remplissez les informations de domiciliation bancaire pour transmission aux RH
            </p>
          </div>
        </div>
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="text-black hover:text-slate-400 transition-colors p-1 bg-white/10 hover:bg-white/20 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            1. Numéro de matricule <span className="text-slate-400 font-normal">(Optionnel)</span>
          </label>
          <input
            type="text"
            placeholder="Ex: EMP-2024-042 (optionnel)"
            value={formData.matricule}
            onChange={(e) => handleChange('matricule', e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              2. Nom <span className="text-red-500">*</span>
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

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            3. Société <span className="text-red-500">*</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              4. Poste occupé <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Chef de Projet / Comptable..."
              value={formData.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              5. Département / Service <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Direction des Systèmes d'Information"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Building className="h-3.5 w-3.5 text-emerald-600" />
              6. Banque <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bank}
              onChange={(e) => handleChange('bank', e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              <option value="Ecobank Togo">Ecobank Togo</option>
              <option value="Orabank Togo">Orabank Togo</option>
              <option value="BOA Togo">BOA Togo</option>
              <option value="NSIA Banque">NSIA Banque</option>
              <option value="UTB">UTB</option>
              <option value="BTCI">BTCI</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Agence Bancaire <span className="text-slate-400 font-normal">(Optionnel)</span>
            </label>
            <input
              type="text"
              placeholder="ex: Agence Principale Lomé / Tokoin... (op"
              value={formData.bankBranch}
              onChange={(e) => handleChange('bankBranch', e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            7. Objet de la demande <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            {['Demande de crédit', 'Autres'].map((reason) => {
              const isSelected = formData.requestReason === reason;
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
                    name="requestReason"
                    value={reason}
                    checked={isSelected}
                    onChange={(e) => handleChange('requestReason', e.target.value)}
                    className="accent-emerald-600 h-3.5 w-3.5"
                  />
                  {reason}
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              8. Adresse e-mail professionnelle <span className="text-red-500">*</span>
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              9. Numéro de téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="+228 90 00 00 00"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            Date souhaitée pour l'effet de la domiciliation
          </label>
          <input
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => handleChange('effectiveDate', e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            10. Commentaires complémentaires <span className="text-slate-400 font-normal">(Optionnel)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Précisions complémentaires concernant votre demande..."
            value={formData.comments}
            onChange={(e) => handleChange('comments', e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
            RIB ou Attestation Bancaire <span className="text-slate-500 font-normal">(Pièce Jointe Optionnelle/Recommandée)</span>
          </span>

          <label className="border-2 border-dashed border-slate-200 hover:border-emerald-600 bg-slate-50/40 hover:bg-emerald-50/20 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all">
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleChange('file', e.target.files?.[0] || null)}
            />
            <div className="p-2.5 bg-emerald-100/50 text-emerald-700 rounded-xl mb-2">
              <FileCheck className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700 text-center">
              Cliquez pour ajouter votre RIB ou attestation bancaire
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Formats acceptés : PDF, PNG, JPG (Max 5 Mo)
            </p>
            {formData.file && (
              <p className="text-[11px] font-semibold text-emerald-800 mt-2 bg-emerald-100 px-3 py-0.5 rounded-full">
                {formData.file.name}
              </p>
            )}
          </label>
        </div>

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