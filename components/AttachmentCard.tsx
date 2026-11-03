// @/components/AttachmentCard.tsx
"use client";

import React from "react";
import { FileText, Download, Eye, FileSpreadsheet, FileCode } from "lucide-react";

interface AttachmentCardProps {
  fileUrl?: string | null;
  fileName?: string;
}

export default function AttachmentCard({ fileUrl, fileName }: AttachmentCardProps) {
  if (!fileUrl) {
    return (
      <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400">
        <FileText className="w-4 h-4" />
        <span>Aucune pièce jointe disponible</span>
      </div>
    );
  }

  // Extraction ou nettoyage du nom du fichier
  const displayName = fileName || fileUrl.split("/").pop() || "Pièce jointe";
  const ext = fileUrl.split(".").pop()?.toLowerCase() || "";

  // Détermination du type de fichier pour l'affichage de l'icône ou de l'aperçu
  const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
  const isPdf = ext === "pdf";
  const isWord = ["doc", "docx"].includes(ext);
  const isExcel = ["xls", "xlsx", "csv"].includes(ext);

  return (
    <div className="flex items-center justify-between p-3 bg-white border-0 border-slate-200 rounded-0 shadow-2xs hover:border-slate-300 transition-all gap-3">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Aperçu ou Icône selon le format */}
        {isImage ? (
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
            <img 
              src={fileUrl} 
              alt={displayName} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
            isPdf ? "bg-red-50 text-red-600" :
            isWord ? "bg-blue-50 text-blue-600" :
            isExcel ? "bg-emerald-50 text-emerald-600" :
            "bg-slate-100 text-slate-600"
          }`}>
            {isPdf ? "PDF" : isWord ? "DOC" : isExcel ? "XLS" : "FILE"}
          </div>
        )}

        <div className="overflow-hidden">
          <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
            Format : {ext || "Inconnu"}
          </p>
        </div>
      </div>

      {/* Actions : Voir / Télécharger */}
      <div className="flex items-center gap-1.5 shrink-0">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Aperçu du fichier"
          className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          <Eye className="w-4 h-4" />
        </a>
        <a
          href={fileUrl}
          download
          title="Télécharger"
          className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}