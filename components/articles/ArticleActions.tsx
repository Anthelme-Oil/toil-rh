'use client';

// ═══════════════════════════════════════════════════════════════
// ArticleActions — Boutons d'action client (Imprimer / Partager)
// ═══════════════════════════════════════════════════════════════

import { Printer, Share2 } from 'lucide-react';

interface ArticleActionsProps {
  titre: string;
}

export default function ArticleActions({ titre }: ArticleActionsProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: titre,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrint}
        className="p-2 text-text-secondary hover:text-primary hover:bg-white rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer"
        title="Imprimer cet article"
      >
        <Printer className="w-4 h-4" />
      </button>
      <button
        onClick={handleShare}
        className="p-2 text-text-secondary hover:text-primary hover:bg-white rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer"
        title="Partager cet article"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}
