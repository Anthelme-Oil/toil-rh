import React from 'react';
import {FORM_REGISTRY} from '@/components/formRegistry';

export const RightDrawer = ({ activeFormType, onClose, onSuccess }) => {
  if (!activeFormType || !FORM_REGISTRY[activeFormType]) return null;

  const { title, subtitle, component: FormComponent } = FORM_REGISTRY[activeFormType];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="p-6 bg-[#006644] text-white flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{title}</h2>
              {subtitle && <p className="text-sm text-emerald-100 mt-1">{subtitle}</p>}
            </div>
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white text-2xl font-bold leading-none"
            >
              &times;
            </button>
          </div>

          {/* Formulaire injecté dynamiquement */}
          <div className="flex-1 overflow-y-auto p-6">
            <FormComponent onCancel={onClose} onSuccess={onSuccess} />
          </div>

        </div>
      </div>
    </div>
  );
};