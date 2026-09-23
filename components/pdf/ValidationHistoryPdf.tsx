"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ============================================================
 * TYPES
 * ============================================================ */

export interface ValidationHistoryItem {
  action?: string;
  etape?: string;
  auteur?: string;
  email?: string;
  role?: string; // conservé pour compatibilité, non affiché
  date?: string;
  commentaire?: string;
}

export interface ValidationHistoryPdfData {
  reference: string;
  typeDemande: string;
  titre: string;
  demandeur: string;
  dateSoumission: string;
  statut: string;
  historique: ValidationHistoryItem[];
}

interface ValidationHistoryPdfProps {
  title: string;
  data: ValidationHistoryPdfData;
  companyName?: string;
  companySubtitle?: string;
  dateDebut?: string | Date;
  dateFin?: string | Date;
  nbreJour?: string | number;
  fileName?: string;
  showButton?: boolean;
  buttonLabel?: string;
  onGenerated?: () => void;
}

/* ============================================================
 * HELPERS
 * ============================================================ */

type RGB = [number, number, number];

const parseDate = (date?: string | Date): Date | null => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (date?: string | Date): string => {
  if (!date) return "-";
  const d = parseDate(date);
  if (!d) return String(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (date?: string | Date): string => {
  if (!date) return "-";
  const d = parseDate(date);
  if (!d) return String(date);
  return `${formatDate(d)} à ${d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const normalizeText = (value?: string | number | null): string => {
  if (value === undefined || value === null) return "-";
  const s = String(value).trim();
  return s || "-";
};

const formatStep = (step?: string): string => {
  if (!step) return "-";
  return step
    .replace(/^PENDING_/i, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatAction = (action?: string): string => {
  if (!action) return "-";
  const map: Record<string, string> = {
    VALIDATE: "Validé",
    VALIDATED: "Validé",
    APPROVE: "Approuvé",
    APPROVED: "Approuvé",
    REFUSE: "Refusé",
    REFUSED: "Refusé",
    REJECT: "Rejeté",
    REJECTED: "Rejeté",
    COMMENT: "Commentaire",
    SUBMIT: "Soumis",
  };
  return map[action.toUpperCase()] || action;
};

const getFileName = (reference: string, custom?: string): string => {
  if (custom?.trim()) {
    return custom.toLowerCase().endsWith(".pdf") ? custom : `${custom}.pdf`;
  }
  const safe = reference.replace(/[^a-zA-Z0-9-_]/g, "_").trim();
  return `Fiche_Validation_${safe || "demande"}.pdf`;
};

/* ============================================================
 * PALETTE
 * ============================================================ */

const C = {
  ink: [17, 24, 39] as RGB,
  text: [51, 65, 85] as RGB,
  muted: [100, 116, 139] as RGB,
  line: [226, 232, 240] as RGB,
  soft: [248, 250, 252] as RGB,
  white: [255, 255, 255] as RGB,
  brand: [4, 120, 87] as RGB, // vert profond
  brandDark: [6, 78, 59] as RGB,
  brandSoft: [236, 253, 245] as RGB,
  amber: [180, 83, 9] as RGB,
  amberSoft: [255, 247, 237] as RGB,
  red: [185, 28, 28] as RGB,
  redSoft: [254, 242, 242] as RGB,
};

/* ============================================================
 * CONSTRUCTION DU DOCUMENT (une page garantie via `scale`)
 * ============================================================ */

interface BuildArgs {
  title: string;
  data: ValidationHistoryPdfData;
  companyName: string;
  companySubtitle: string;
  dateDebut?: string | Date;
  dateFin?: string | Date;
  nbreJour?: string | number;
}

const buildDoc = (args: BuildArgs, scale: number) => {
  const { title, data, companyName, companySubtitle } = args;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth(); // 210
  const H = doc.internal.pageSize.getHeight(); // 297
  const ML = 16;
  const MR = 16;
  const CW = W - ML - MR;

  const fill = (c: RGB) => doc.setFillColor(...c);
  const stroke = (c: RGB) => doc.setDrawColor(...c);
  const ink = (c: RGB) => doc.setTextColor(...c);
  const font = (style: "normal" | "bold", size: number) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
  };

  /* ---------- BANDE SUPÉRIEURE ---------- */
  fill(C.brand);
  doc.rect(0, 0, W, 4, "F");
  fill(C.brandDark);
  doc.rect(0, 0, 60, 4, "F");

  /* ---------- EN-TÊTE ---------- */
  let y = 17;

  // Monogramme
  fill(C.brand);
  doc.roundedRect(ML, y - 7, 11, 11, 2.5, 2.5, "F");
  font("bold", 10);
  ink(C.white);
  doc.text(companyName.charAt(0).toUpperCase(), ML + 5.5, y - 0.2, {
    align: "center",
  });

  font("bold", 15);
  ink(C.ink);
  doc.text(companyName, ML + 15, y - 1);
  font("normal", 8);
  ink(C.muted);
  doc.text(companySubtitle, ML + 15, y + 3.5);

  // Référence (droite)
  font("bold", 7);
  ink(C.muted);
  doc.text("RÉFÉRENCE", W - MR, y - 3, { align: "right" });
  font("bold", 11);
  ink(C.ink);
  doc.text(normalizeText(data.reference), W - MR, y + 2.5, { align: "right" });

  y += 10;
  stroke(C.line);
  doc.setLineWidth(0.3);
  doc.line(ML, y, W - MR, y);

  /* ---------- TITRE + STATUT ---------- */
  y += 12;

  const statut = normalizeText(data.statut);
  const su = statut.toUpperCase();
  const isOk = su.includes("VALID") || su.includes("APPROUV") || su.includes("APPROVED");
  const isKo = su.includes("REFUS") || su.includes("REJET") || su.includes("REJECT");
  const st = isOk
    ? { bg: C.brandSoft, fg: C.brand }
    : isKo
    ? { bg: C.redSoft, fg: C.red }
    : { bg: C.amberSoft, fg: C.amber };

  // Pill statut
  font("bold", 7.5);
  const pillLabel = statut.toUpperCase();
  const pillW = doc.getTextWidth(pillLabel) + 13;
  const pillX = W - MR - pillW;

  font("bold", 7);
  ink(C.muted);
  doc.text("FICHE DE VALIDATION", ML, y - 6);

  font("bold", 16);
  ink(C.ink);
  const titleLines: string[] = doc
    .splitTextToSize(normalizeText(title), CW - pillW - 8)
    .slice(0, 2);
  doc.text(titleLines, ML, y + 1);

  fill(st.bg);
  doc.roundedRect(pillX, y - 5, pillW, 8, 4, 4, "F");
  fill(st.fg);
  doc.circle(pillX + 4.5, y - 1, 1.2, "F");
  font("bold", 7.5);
  ink(st.fg);
  doc.text(pillLabel, pillX + 8, y + 0.1);

  y += (titleLines.length - 1) * 6.5 + 12;

  /* ---------- BLOC INFORMATIONS ---------- */
  const cardH = 40;
  fill(C.soft);
  stroke(C.line);
  doc.setLineWidth(0.25);
  doc.roundedRect(ML, y, CW, cardH, 3, 3, "FD");

  // Liseré vert à gauche
  fill(C.brand);
  doc.roundedRect(ML, y, 1.6, cardH, 0.8, 0.8, "F");

  const colW = (CW - 8) / 3;
  const info = (label: string, value: string, col: number, row: number) => {
    const x = ML + 8 + col * colW;
    const iy = y + 9 + row * 17;
    font("bold", 6.8);
    ink(C.muted);
    doc.text(label.toUpperCase(), x, iy);
    font("bold", 9.5);
    ink(C.ink);
    const lines: string[] = doc.splitTextToSize(value, colW - 6).slice(0, 2);
    doc.text(lines, x, iy + 5);
  };

  info("Demandeur", normalizeText(data.demandeur), 0, 0);
  info("Type de demande", normalizeText(data.typeDemande), 1, 0);
  info("Date de soumission", formatDate(data.dateSoumission), 2, 0);
  info("Date de début", formatDate(args.dateDebut), 0, 1);
  info("Date de fin", formatDate(args.dateFin), 1, 1);
  info(
    "Nombre de jours",
    args.nbreJour !== undefined && args.nbreJour !== ""
      ? `${args.nbreJour} jour(s)`
      : "-",
    2,
    1
  );

  // Séparateur horizontal interne
  stroke(C.line);
  doc.line(ML + 8, y + cardH / 2, ML + CW - 8, y + cardH / 2);

  y += cardH + 8;

  /* ---------- OBJET ---------- */
  font("bold", 7);
  ink(C.muted);
  doc.text("OBJET DE LA DEMANDE", ML, y);
  y += 3;

  const objLines: string[] = doc
    .splitTextToSize(normalizeText(data.titre), CW - 12)
    .slice(0, 2);
  const objH = 6 + objLines.length * 4.6;
  fill(C.white);
  stroke(C.line);
  doc.roundedRect(ML, y, CW, objH, 2, 2, "FD");
  font("normal", 9);
  ink(C.text);
  doc.text(objLines, ML + 6, y + 6);

  y += objH + 10;

  /* ---------- TABLEAU DES VALIDATEURS ---------- */
  font("bold", 10.5);
  ink(C.ink);
  doc.text("Circuit de validation", ML, y);

  const historique = Array.isArray(data.historique) ? data.historique : [];
  font("normal", 7.5);
  ink(C.muted);
  doc.text(
    `${historique.length} étape(s) enregistrée(s)`,
    W - MR,
    y,
    { align: "right" }
  );

  y += 4;

  const SIGN_H = 34; // hauteur bloc signatures
  const FOOTER_H = 16;
  const tableLimit = H - FOOTER_H - SIGN_H - 6;

  if (historique.length === 0) {
    fill(C.soft);
    stroke(C.line);
    doc.roundedRect(ML, y, CW, 16, 2, 2, "FD");
    font("normal", 8.5);
    ink(C.muted);
    doc.text("Aucune validation enregistrée.", W / 2, y + 9.5, {
      align: "center",
    });
    y += 16;
  } else {
    const body = historique.map((item, i) => {
      const auteur = normalizeText(item.auteur);
      const email = normalizeText(item.email);
      return [
        String(i + 1).padStart(2, "0"),
        formatStep(item.etape),
        formatAction(item.action),
        email !== "-" ? `${auteur}\n${email}` : auteur,
        formatDateTime(item.date),
        normalizeText(item.commentaire),
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR },
      head: [["N°", "Étape", "Décision", "Validateur", "Date", "Commentaire"]],
      body,
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 7.6 * scale,
        textColor: C.text,
        cellPadding: { top: 2.6 * scale, bottom: 2.6 * scale, left: 2.5, right: 2.5 },
        valign: "middle",
        overflow: "linebreak",
        lineColor: C.line,
        lineWidth: { bottom: 0.2, top: 0, left: 0, right: 0 } as any,
      },
      headStyles: {
        fillColor: C.brandDark,
        textColor: C.white,
        fontStyle: "bold",
        fontSize: 7.2 * scale,
        lineWidth: 0,
      },
      alternateRowStyles: { fillColor: C.soft },
      columnStyles: {
        0: { cellWidth: 10, halign: "center", fontStyle: "bold", textColor: C.muted },
        1: { cellWidth: 28, fontStyle: "bold", textColor: C.ink },
        2: { cellWidth: 23 },
        3: { cellWidth: 46 },
        4: { cellWidth: 30 },
        5: { cellWidth: "auto" },
      },
      didParseCell: (h) => {
        if (h.section !== "body" || h.column.index !== 2) return;
        const v = String(h.cell.raw || "");
        if (v === "Validé" || v === "Approuvé") {
          h.cell.styles.textColor = C.brand;
          h.cell.styles.fontStyle = "bold";
        } else if (v === "Refusé" || v === "Rejeté") {
          h.cell.styles.textColor = C.red;
          h.cell.styles.fontStyle = "bold";
        } else {
          h.cell.styles.textColor = C.muted;
          h.cell.styles.fontStyle = "bold";
        }
      },
    });

    y = (doc as any).lastAutoTable?.finalY ?? y + 30;
  }

  const overflow = doc.getNumberOfPages() > 1 || y > tableLimit;

  /* ---------- SIGNATURES (ancrées en bas de page) ---------- */
  const signY = H - FOOTER_H - SIGN_H;
  const boxW = (CW - 8) / 2;
  const signBox = (x: number, label: string) => {
    fill(C.white);
    stroke(C.line);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, signY, boxW, SIGN_H, 2.5, 2.5, "FD");
    font("bold", 7);
    ink(C.muted);
    doc.text(label.toUpperCase(), x + 5, signY + 7);
    stroke(C.line);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(x + 5, signY + SIGN_H - 7, x + boxW - 5, signY + SIGN_H - 7);
    doc.setLineDashPattern([], 0);
    font("normal", 6.5);
    ink(C.muted);
    doc.text("Nom, date et signature", x + 5, signY + SIGN_H - 3.5);
  };
  signBox(ML, "Visa du responsable RH");
  signBox(ML + boxW + 8, "Cachet de l'entreprise");

  /* ---------- PIED DE PAGE ---------- */
  const fy = H - 9;
  stroke(C.line);
  doc.setLineWidth(0.25);
  doc.line(ML, fy - 4.5, W - MR, fy - 4.5);
  font("normal", 6.8);
  ink(C.muted);
  doc.text(`${companyName}  •  ${companySubtitle}`, ML, fy);
  doc.text("Document généré automatiquement — sans signature manuscrite non contractuel", W / 2, fy, {
    align: "center",
  });
  doc.text(`Édité le ${formatDateTime(new Date())}`, W - MR, fy, {
    align: "right",
  });

  return { doc, overflow };
};

/* ============================================================
 * COMPOSANT
 * ============================================================ */

export default function ValidationHistoryPdf({
  title,
  data,
  companyName = "T-OIL",
  companySubtitle = "Gestion des demandes RH",
  fileName,
  showButton = true,
  buttonLabel = "Télécharger le PDF",
  onGenerated,
  dateDebut,
  dateFin,
  nbreJour,
}: ValidationHistoryPdfProps) {
  const [generating, setGenerating] = useState(false);

  const generatePdf = async () => {
    if (!data) return;

    try {
      setGenerating(true);

      const args: BuildArgs = {
        title,
        data,
        companyName,
        companySubtitle,
        dateDebut,
        dateFin,
        nbreJour,
      };

      // On réduit progressivement la taille du tableau jusqu'à tenir sur 1 page
      const scales = [1, 0.92, 0.84, 0.76, 0.68, 0.6];
      let result = buildDoc(args, scales[0]);
      for (let i = 1; i < scales.length && result.overflow; i++) {
        result = buildDoc(args, scales[i]);
      }

      // Sécurité : jamais plus d'une page
      const { doc } = result;
      while (doc.getNumberOfPages() > 1) {
        doc.deletePage(doc.getNumberOfPages());
      }

      doc.save(getFileName(data.reference, fileName));
      onGenerated?.();
    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    } finally {
      setGenerating(false);
    }
  };

  if (!showButton) return null;

  return (
    <button
      type="button"
      onClick={generatePdf}
      disabled={generating}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {generating ? (
        <>
          <Loader2 size={17} className="animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <FileDown size={17} />
          {buttonLabel}
        </>
      )}
    </button>
  );
}