"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ValidationHistoryItem {
  action?: string;
  etape?: string;
  auteur?: string;
  email?: string;
  role?: string;
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

  /**
   * Nom de l'entreprise affiché dans l'en-tête.
   * Exemple : "T-OIL"
   */
  companyName?: string;

  /**
   * Sous-titre affiché sous le nom de l'entreprise.
   */
  companySubtitle?: string;

  /**
   * Nom du fichier PDF.
   * L'extension .pdf est ajoutée automatiquement si nécessaire.
   */
  fileName?: string;

  /**
   * Permet de masquer le bouton et de déclencher
   * la génération depuis un parent.
   */
  showButton?: boolean;

  /**
   * Texte du bouton.
   */
  buttonLabel?: string;

  /**
   * Callback appelé après génération du PDF.
   */
  onGenerated?: () => void;
}

const formatDate = (date?: string | Date): string => {
  if (!date) return "-";

  try {
    const parsedDate = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const formatDateTime = (date?: string | Date): string => {
  if (!date) return "-";

  try {
    const parsedDate = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
      " à " +
      parsedDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
  } catch {
    return "-";
  }
};

const normalizeText = (value?: string | null): string => {
  if (!value) return "-";
  return String(value).trim() || "-";
};

const formatStep = (step?: string): string => {
  if (!step) return "-";

  return step
    .replace(/^PENDING_/i, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatAction = (action?: string): string => {
  if (!action) return "-";

  const actions: Record<string, string> = {
    VALIDATE: "Validation",
    REFUSE: "Refus",
    REJECT: "Rejet",
    APPROVE: "Approbation",
    COMMENT: "Commentaire",
  };

  return actions[action.toUpperCase()] || action;
};

const getFileName = (
  reference: string,
  customFileName?: string
): string => {
  if (customFileName?.trim()) {
    return customFileName.toLowerCase().endsWith(".pdf")
      ? customFileName
      : `${customFileName}.pdf`;
  }

  const safeReference = reference
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .trim();

  return `Historique_Validation_RH_${safeReference || "demande"}.pdf`;
};

export default function ValidationHistoryPdf({
  title,
  data,
  companyName = "T-OIL",
  companySubtitle = "Gestion des demandes RH",
  fileName,
  showButton = true,
  buttonLabel = "Télécharger le PDF",
  onGenerated,
}: ValidationHistoryPdfProps) {
  const [generating, setGenerating] = useState(false);

  const generatePdf = async () => {
    if (!data) return;

    try {
      setGenerating(true);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const marginLeft = 18;
      const marginRight = 18;
      const contentWidth = pageWidth - marginLeft - marginRight;

      /*
       * ============================================================
       * COULEURS
       * ============================================================
       */

      const colors = {
        dark: [15, 23, 42] as [number, number, number],
        slate: [71, 85, 105] as [number, number, number],
        lightSlate: [100, 116, 139] as [number, number, number],
        border: [226, 232, 240] as [number, number, number],
        background: [248, 250, 252] as [number, number, number],
        white: [255, 255, 255] as [number, number, number],
        emerald: [5, 150, 105] as [number, number, number],
        emeraldLight: [236, 253, 245] as [number, number, number],
        blue: [37, 99, 235] as [number, number, number],
        blueLight: [239, 246, 255] as [number, number, number],
        red: [220, 38, 38] as [number, number, number],
        redLight: [254, 242, 242] as [number, number, number],
      };

      /*
       * ============================================================
       * HELPERS PDF
       * ============================================================
       */

      const drawRoundedBox = (
        x: number,
        y: number,
        width: number,
        height: number,
        fillColor: [number, number, number],
        radius = 3
      ) => {
        doc.setFillColor(...fillColor);
        doc.roundedRect(x, y, width, height, radius, radius, "F");
      };

      const drawBorderBox = (
        x: number,
        y: number,
        width: number,
        height: number,
        fillColor: [number, number, number] = colors.white
      ) => {
        doc.setFillColor(...fillColor);
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.25);
        doc.roundedRect(x, y, width, height, 3, 3, "FD");
      };

      const checkPageSpace = (
        currentY: number,
        requiredHeight: number
      ): number => {
        if (currentY + requiredHeight > pageHeight - 20) {
          doc.addPage();
          return 20;
        }

        return currentY;
      };

      /*
       * ============================================================
       * HEADER
       * ============================================================
       */

      let y = 18;

      // Ligne supérieure
      doc.setFillColor(...colors.emerald);
      doc.rect(0, 0, pageWidth, 3, "F");

      // Nom entreprise
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(...colors.dark);
      doc.text(companyName, marginLeft, y);

      // Sous-titre entreprise
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.lightSlate);
      doc.text(companySubtitle, marginLeft, y + 6);

      // Référence
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.lightSlate);
      doc.text("RÉFÉRENCE", pageWidth - marginRight, y, {
        align: "right",
      });

      doc.setFontSize(11);
      doc.setTextColor(...colors.dark);
      doc.text(
        normalizeText(data.reference),
        pageWidth - marginRight,
        y + 6,
        {
          align: "right",
        }
      );

      y += 18;

      // Ligne
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.35);
      doc.line(marginLeft, y, pageWidth - marginRight, y);

      y += 13;

      /*
       * ============================================================
       * TITRE DU DOCUMENT
       * ============================================================
       */

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...colors.dark);

      const titleLines = doc.splitTextToSize(
        normalizeText(title),
        contentWidth
      );

      doc.text(titleLines, marginLeft, y);

      y += titleLines.length * 7 + 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.lightSlate);

      doc.text(
        "Document généré automatiquement par le système RH",
        marginLeft,
        y
      );

      y += 12;

      /*
       * ============================================================
       * STATUT
       * ============================================================
       */

      const statut = normalizeText(data.statut);
      const isValidated =
        statut.toUpperCase().includes("VALID") ||
        statut.toUpperCase().includes("APPROU");

      const statusBg = isValidated
        ? colors.emeraldLight
        : colors.blueLight;

      const statusColor = isValidated
        ? colors.emerald
        : colors.blue;

      drawRoundedBox(
        marginLeft,
        y,
        contentWidth,
        15,
        statusBg,
        3
      );

      // Petit indicateur
      doc.setFillColor(...statusColor);
      doc.circle(marginLeft + 7, y + 7.5, 2.2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.lightSlate);
      doc.text("STATUT", marginLeft + 13, y + 5.5);

      doc.setFontSize(10);
      doc.setTextColor(...statusColor);
      doc.text(statut, marginLeft + 13, y + 10.5);

      y += 23;

      /*
       * ============================================================
       * INFORMATIONS DE LA DEMANDE
       * ============================================================
       */

      y = checkPageSpace(y, 55);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...colors.dark);
      doc.text("Informations de la demande", marginLeft, y);

      y += 7;

      const infoBoxHeight = 46;

      drawBorderBox(
        marginLeft,
        y,
        contentWidth,
        infoBoxHeight
      );

      const columnWidth = contentWidth / 2;

      const infoItem = (
        label: string,
        value: string,
        x: number,
        itemY: number,
        maxWidth: number
      ) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...colors.lightSlate);
        doc.text(label.toUpperCase(), x, itemY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...colors.dark);

        const valueLines = doc.splitTextToSize(
          normalizeText(value),
          maxWidth
        );

        doc.text(valueLines, x, itemY + 5);
      };

      const infoX1 = marginLeft + 7;
      const infoX2 = marginLeft + columnWidth + 5;

      infoItem(
        "Référence",
        data.reference,
        infoX1,
        y + 9,
        columnWidth - 18
      );

      infoItem(
        "Type de demande",
        data.typeDemande,
        infoX2,
        y + 9,
        columnWidth - 18
      );

      infoItem(
        "Demandeur",
        data.demandeur,
        infoX1,
        y + 24,
        columnWidth - 18
      );

      infoItem(
        "Date de soumission",
        formatDate(data.dateSoumission),
        infoX2,
        y + 24,
        columnWidth - 18
      );

      y += infoBoxHeight + 10;

      /*
       * ============================================================
       * TITRE DE LA DEMANDE
       * ============================================================
       */

      y = checkPageSpace(y, 30);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.lightSlate);
      doc.text("OBJET DE LA DEMANDE", marginLeft, y);

      y += 5;

      drawRoundedBox(
        marginLeft,
        y,
        contentWidth,
        16,
        colors.background,
        2
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...colors.dark);

      const requestTitleLines = doc.splitTextToSize(
        normalizeText(data.titre),
        contentWidth - 12
      );

      doc.text(
        requestTitleLines.slice(0, 2),
        marginLeft + 6,
        y + 6
      );

      y += 25;

      /*
       * ============================================================
       * HISTORIQUE
       * ============================================================
       */

      y = checkPageSpace(y, 35);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...colors.dark);
      doc.text(
        "Historique des validations",
        marginLeft,
        y
      );

      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...colors.lightSlate);

      doc.text(
        `${data.historique?.length || 0} étape(s) enregistrée(s) dans le processus`,
        marginLeft,
        y + 5
      );

      y += 10;

      /*
       * ============================================================
       * TABLEAU HISTORIQUE
       * ============================================================
       */

      const historique = Array.isArray(data.historique)
        ? data.historique
        : [];

      if (historique.length === 0) {
        drawBorderBox(
          marginLeft,
          y,
          contentWidth,
          20
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...colors.lightSlate);

        doc.text(
          "Aucune validation enregistrée.",
          pageWidth / 2,
          y + 12,
          {
            align: "center",
          }
        );

        y += 30;
      } else {
        const tableRows = historique.map((item, index) => {
          const author = normalizeText(item.auteur);
          const role = normalizeText(item.role);
          const email = normalizeText(item.email);

          const authorDisplay =
            email !== "-"
              ? `${author}\n${email}`
              : author;

          return [
            String(index + 1),
            formatStep(item.etape),
            formatAction(item.action),
            authorDisplay,
            role,
            formatDateTime(item.date),
            normalizeText(item.commentaire),
          ];
        });

        autoTable(doc, {
          startY: y,
          margin: {
            left: marginLeft,
            right: marginRight,
          },

          head: [
            [
              "#",
              "Étape",
              "Action",
              "Auteur",
              "Rôle",
              "Date",
              "Commentaire",
            ],
          ],

          body: tableRows,

          theme: "grid",

          styles: {
            font: "helvetica",
            fontSize: 7.2,
            textColor: colors.dark,
            lineColor: colors.border,
            lineWidth: 0.25,
            cellPadding: 3,
            valign: "middle",
            overflow: "linebreak",
          },

          headStyles: {
            fillColor: colors.dark,
            textColor: colors.white,
            fontStyle: "bold",
            fontSize: 7,
            halign: "left",
            valign: "middle",
          },

          alternateRowStyles: {
            fillColor: colors.background,
          },

          columnStyles: {
            0: {
              cellWidth: 8,
              halign: "center",
            },
            1: {
              cellWidth: 25,
            },
            2: {
              cellWidth: 20,
            },
            3: {
              cellWidth: 38,
            },
            4: {
              cellWidth: 20,
            },
            5: {
              cellWidth: 27,
            },
            6: {
              cellWidth: "auto",
            },
          },

          didParseCell: (hookData) => {
            if (
              hookData.section === "body" &&
              hookData.column.index === 2
            ) {
              const action = String(
                hookData.cell.raw || ""
              ).toUpperCase();

              if (
                action === "Validation" ||
                action === "Approbation"
              ) {
                hookData.cell.styles.textColor =
                  colors.emerald;
                hookData.cell.styles.fontStyle = "bold";
              }

              if (
                action === "Refus" ||
                action === "Rejet"
              ) {
                hookData.cell.styles.textColor =
                  colors.red;
                hookData.cell.styles.fontStyle = "bold";
              }
            }
          },

          didDrawPage: (hookData) => {
            /*
             * En-tête des pages supplémentaires
             */
            if (hookData.pageNumber > 1) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(8);
              doc.setTextColor(...colors.dark);
              doc.text(
                `${companyName} — ${title}`,
                marginLeft,
                10
              );

              doc.setDrawColor(...colors.border);
              doc.setLineWidth(0.25);
              doc.line(
                marginLeft,
                13,
                pageWidth - marginRight,
                13
              );
            }

            /*
             * Numéro de page
             */
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(...colors.lightSlate);

            doc.text(
              `Page ${hookData.pageNumber}`,
              pageWidth - marginRight,
              pageHeight - 8,
              {
                align: "right",
              }
            );
          },
        });

        const finalY =
          (doc as any).lastAutoTable?.finalY || y + 30;

        y = finalY + 12;
      }

      /*
       * ============================================================
       * SIGNATURE / VALIDATION FINALE
       * ============================================================
       */

      y = checkPageSpace(y, 42);

      drawRoundedBox(
        marginLeft,
        y,
        contentWidth,
        30,
        colors.emeraldLight,
        3
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.emerald);

      doc.text(
        "VALIDATION RH",
        marginLeft + 7,
        y + 8
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...colors.slate);

      const validationText =
        "Ce document constitue une synthèse de l'historique des validations " +
        "enregistrées dans le système de gestion des demandes RH.";

      const validationLines = doc.splitTextToSize(
        validationText,
        contentWidth - 14
      );

      doc.text(
        validationLines,
        marginLeft + 7,
        y + 14
      );

      y += 40;

      /*
       * ============================================================
       * FOOTER
       * ============================================================
       */

      const footerY = pageHeight - 12;

      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.25);
      doc.line(
        marginLeft,
        footerY - 4,
        pageWidth - marginRight,
        footerY - 4
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...colors.lightSlate);

      doc.text(
        `${companyName} • ${companySubtitle}`,
        marginLeft,
        footerY
      );

      doc.text(
        `Généré le ${formatDateTime(new Date())}`,
        pageWidth - marginRight,
        footerY,
        {
          align: "right",
        }
      );

      /*
       * ============================================================
       * NUMÉROTATION DE TOUTES LES PAGES
       * ============================================================
       */

      const totalPages = doc.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...colors.lightSlate);

        doc.text(
          `Page ${page} / ${totalPages}`,
          pageWidth - marginRight,
          pageHeight - 4,
          {
            align: "right",
          }
        );
      }

      /*
       * ============================================================
       * TÉLÉCHARGEMENT
       * ============================================================
       */

      const finalFileName = getFileName(
        data.reference,
        fileName
      );

      doc.save(finalFileName);

      onGenerated?.();
    } catch (error) {
      console.error(
        "Erreur lors de la génération du PDF :",
        error
      );

      alert(
        "Une erreur est survenue lors de la génération du PDF."
      );
    } finally {
      setGenerating(false);
    }
  };

  if (!showButton) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={generatePdf}
      disabled={generating}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        bg-emerald-600
        px-4
        py-2.5
        text-sm
        font-semibold
        text-white
        shadow-sm
        transition-all
        hover:bg-emerald-700
        hover:shadow-md
        disabled:cursor-not-allowed
        disabled:opacity-60
        focus:outline-none
        focus:ring-2
        focus:ring-emerald-500
        focus:ring-offset-2
      "
    >
      {generating ? (
        <>
          <Loader2
            size={17}
            className="animate-spin"
          />
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