'use client';

// ═══════════════════════════════════════════════════════════════
// Composant — Catalogue des Demandes & Services (Senior Component)
// ═══════════════════════════════════════════════════════════════

import { ChevronRight } from 'lucide-react';
import type { TypeDemande } from '@/types';

export interface DemandeCategory {
  id: string;
  title: string;
  description: string;
  color: string;
  items: Array<{
    id: TypeDemande;
    label: string;
    icon: React.ElementType;
    description: string;
  }>;
}

interface CatalogueTabProps {
  categories: DemandeCategory[];
  onSelectDemande: (item: { id: TypeDemande; label: string }) => void;
}

export function CatalogueTab({ categories, onSelectDemande }: CatalogueTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-fade-in">
      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          <div className="pb-2 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
              {category.title}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">{category.description}</p>
          </div>

          <div className="space-y-3">
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectDemande(item)}
                  className="w-full text-left bg-white border border-emerald-500/40 hover:border-emerald-600 hover:shadow-md rounded-xl p-4 transition-all duration-200 flex items-center gap-3.5 group cursor-pointer"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-alt group-hover:bg-primary-50 flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors block truncate">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-text-muted block truncate">
                      {item.description}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 group-hover:text-primary transition-all flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
