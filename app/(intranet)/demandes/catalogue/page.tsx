'use client';

import React, { useState } from 'react';
import { CATALOG_CATEGORIES, RequestItem } from '@/config/catalog';
import { FORM_REGISTRY } from '@/components/formRegistry';
import { ChevronRight, CheckCircle2, FileText, Search } from 'lucide-react';

export default function CatalogPage() {
  const [selectedItem, setSelectedItem] = useState<RequestItem | null>(
    CATALOG_CATEGORIES[0].items[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (item: RequestItem) => {
    setSelectedItem(item);
    setIsSubmitted(false);
  };

  const filteredCategories = CATALOG_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  const activeFormConfig = selectedItem ? FORM_REGISTRY[selectedItem.id] : null;
  const ActiveFormComponent = activeFormConfig?.component;

  return (
    /* h-[calc(100vh-4rem)] ou h-dvh assure une hauteur explicite même si le layout parent n'en fournit pas */
    <div className="flex flex-col h-[calc(100dvh-10rem)] w-full bg-slate-50 text-slate-800 overflow-hidden">
      
      <style jsx global>{`
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>

      {/* Header global du catalogue */}
      <header className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Catalogue des Demandes</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sélectionnez un type de demande à gauche et renseignez le formulaire à droite.
          </p>
        </div>
      </header>

      {/* Body découpé en 2 panneaux à défilement indépendant */}
      <div className="flex-1 flex min-h-0 w-full overflow-hidden">
        
        {/* ================= COLONNE GAUCHE (Liste) ================= */}
        <aside className="w-full lg:w-[380px] xl:w-[420px] border-r border-slate-200 bg-white flex flex-col h-full shrink-0 min-h-0">
          
          {/* Recherche fixe */}
          <div className="p-3.5 border-b border-slate-100 bg-white shrink-0">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-emerald-600" />
              <input
                type="text"
                placeholder="Rechercher une demande..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Défilement indépendant à gauche */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar-thin overscroll-contain">
            {filteredCategories.length === 0 ? (
              <div className="text-left py-8 text-xs text-slate-400">
                Aucun service ne correspond à votre recherche.
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="px-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      {category.title}
                    </h2>
                  </div>

                  <div className="space-y-1.5">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedItem?.id === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition-all ${
                            isSelected
                              ? 'bg-emerald-50/90 border-emerald-500 text-slate-900 shadow-xs'
                              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-xs font-semibold truncate">{item.title}</h3>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.description}</p>
                            </div>
                          </div>
                          <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform ${isSelected ? 'text-emerald-600 translate-x-0.5' : 'text-slate-300'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ================= COLONNE DROITE (Formulaire) ================= */}
        <main className="flex-1 flex flex-col h-full min-h-0 bg-slate-50">
          
          {/* Défilement indépendant à droite */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar-thin overscroll-contain">
            {selectedItem ? (
              <div className="max-w-3xl mx-auto space-y-5 pb-12">
                
                {/* En-tête du formulaire */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 pt-1">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
                    <selectedItem.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{selectedItem.title}</h2>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                        Formulaire
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedItem.description}</p>
                  </div>
                </div>

                {isSubmitted ? (
                  <div className="w-full py-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-left space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                      <h3 className="text-sm font-bold text-emerald-900">Demande soumise avec succès !</h3>
                    </div>
                    <p className="text-xs text-slate-600">Votre demande a été transmise au workflow de validation.</p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="pt-2 text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline block"
                    >
                      Remplir à nouveau ce formulaire
                    </button>
                  </div>
                ) : (
                  <div className="w-full">
                    {ActiveFormComponent ? (
                      <ActiveFormComponent 
                        onSuccess={() => setIsSubmitted(true)} 
                        onCancel={() => setSelectedItem(null)}
                      />
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                        Aucun composant de formulaire enregistré pour la clé : <strong>{selectedItem.id}</strong>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <FileText className="h-10 w-10 mb-2 text-slate-300" />
                <p className="text-xs font-medium">Sélectionnez une demande dans le panneau de gauche.</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}