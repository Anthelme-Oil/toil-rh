import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/emails/mail.service";
import WorkflowValidationEmail from "@/lib/emails/templates/WorkflowValidationEmail";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      absenceType,
      company,
      startDate,
      endDate,
      calculatedDays,
      managerEmail,
      fileUrl,
      currentUser,
    } = body;

    /**
     * ============================================================
     * 1. VALIDATION DES DONNÉES
     * ============================================================
     */

    if (!currentUser?.email || !currentUser?.name) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Informations utilisateur (currentUser) manquantes.",
        },
        { status: 400 },
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Les dates de début et de fin sont obligatoires.",
        },
        { status: 400 },
      );
    }

    /**
     * Normalisation des informations utilisateur
     */
    const applicantName = currentUser.name.trim();

    const applicantEmail = currentUser.email
      .trim()
      .toLowerCase();

    /**
     * ============================================================
     * 2. VALIDATION DES DATES
     * ============================================================
     */

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Les dates fournies sont invalides.",
        },
        { status: 400 },
      );
    }

    if (parsedEndDate < parsedStartDate) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La date de fin ne peut pas être antérieure à la date de début.",
        },
        { status: 400 },
      );
    }

    /**
     * ============================================================
     * 3. VALIDATION DU NOMBRE DE JOURS
     * ============================================================
     */

    const numberOfDays = Number(calculatedDays);

    if (!Number.isFinite(numberOfDays) || numberOfDays <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Le nombre de jours d'absence doit être supérieur à zéro.",
        },
        { status: 400 },
      );
    }

    /**
     * ============================================================
     * 4. NORMALISATION DU MANAGER
     * ============================================================
     */

    const cleanManagerEmail =
      typeof managerEmail === "string" &&
      managerEmail.trim() !== ""
        ? managerEmail.trim().toLowerCase()
        : null;

    /**
     * ============================================================
     * 5. STATUT INITIAL
     * ============================================================
     */

    const initialStatus = cleanManagerEmail
      ? "PENDING_N1"
      : "PENDING_ADMIN";

    /**
     * ============================================================
     * 6. HISTORIQUE INITIAL
     * ============================================================
     */

    const initialHistory = [
      {
        action: "CREATE",
        auteur: applicantName,
        email: applicantEmail,
        role: "DEMANDEUR",
        date: new Date().toISOString(),
        commentaire:
          "Initiation de la demande d’absence",
      },
    ];

    /**
     * ============================================================
     * 7. CRÉATION DE LA DEMANDE
     * ============================================================
     */

    const newRequest = await prisma.demande.create({
      data: {
        typeDemande: "ABSENCE",

        titre: `Demande de ${
          absenceType || "Congé"
        } - ${applicantName}`,

        statut: initialStatus,
        
        nomDemandeur: applicantName,

        emailDemandeur: applicantEmail,

        emailManager: cleanManagerEmail,

        dateDebut: parsedStartDate,

        dateFin: parsedEndDate,

        nombreJours: numberOfDays,

        typeConge: absenceType || null,

        pieceJointe: fileUrl || null,

        utilisateurId: currentUser.id || null,

        historiqueValidations:
          JSON.stringify(initialHistory),

        donneesFormulaire: {
          absenceType: absenceType || null,
          company: company || "T-OIL",
          fileUrl: fileUrl || null,
        },
      },
    });

    /**
     * ============================================================
     * 8. DESTINATAIRE DE LA NOTIFICATION
     * ============================================================
     *
     * Priorité :
     *
     * 1. Responsable/N+1 sélectionné
     * 2. Adresse d'administration configurée
     *
     * Aucun email "en dur" dans le code.
     */

    const targetEmail =
      cleanManagerEmail ||
      process.env.ADMIN_EMAIL_DEFAULT;

    if (!targetEmail) {
      console.error(
        "[API Absence] Aucun destinataire de notification configuré.",
      );

      return NextResponse.json(
        {
          success: true,
          warning:
            "La demande a été créée, mais aucun destinataire de notification n'est configuré.",
          data: newRequest,
        },
        { status: 201 },
      );
    }

    /**
     * ============================================================
     * 9. FORMATAGE DES DATES
     * ============================================================
     */

    const formattedStartDate =
      parsedStartDate.toLocaleDateString("fr-FR");

    const formattedEndDate =
      parsedEndDate.toLocaleDateString("fr-FR");

    /**
     * ============================================================
     * 10. CONSTRUCTION DE L'URL DE VALIDATION
     * ============================================================
     */

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      throw new Error(
        "[API Absence] NEXT_PUBLIC_APP_URL n'est pas configurée.",
      );
    }

    const actionUrl =
      `${appUrl}/demandes/validation`;

    /**
     * ============================================================
     * 11. ENVOI DE L'EMAIL
     * ============================================================
     *
     * Notre service central s'occupe de :
     *
     * - Nodemailer
     * - SMTP Office 365
     * - rendu du template React Email
     * - expédition du message
     */

    await sendMail({
      to: targetEmail,

      subject: `Action requise — Demande d'absence — ${ newRequest.id ? newRequest.id.substring(0, 8).toUpperCase() : ""}`,

      template: WorkflowValidationEmail,

      props: {
        recipientName:
          cleanManagerEmail || "Administration",

        workflowName: newRequest?.typeDemande,

        stepName: cleanManagerEmail
          ? "Validation du responsable"
          : "Traitement administratif",

        // requestReference:
        //   newRequest.reference ?
        //   newRequest?.reference:
          requestReference:  newRequest.id ? newRequest.id.substring(0, 8).toUpperCase() : "",                  
          

        requesterName: applicantName,

        requesterEmail: applicantEmail,

        submittedAt: newRequest.creeLe,

         message: `Une nouvelle demande de ${newRequest?.typeDemande}, concernant ${newRequest?.typeConge}, a été soumise par ${applicantName}. Cette demande est à votre niveau pour validation et préparation de la prochaine étape.`,  actionUrl,

        actionLabel: "Ouvrir la demande",

        companyName:
          company || "T-OIL",

        applicationName:
          "COMPEL STSL T-OIL — Intranet",

        /**
         * Si ton template accepte les détails,
         * on pourra les afficher directement
         * dans le corps du mail.
         */
        details: [
          {
            label: "Société d'appartenance",
            value: company || "T-OIL",
          },

          {
            label: "Type d'absence",
            value:
              absenceType || "Non spécifié",
          },

          {
            label: "Période demandée",
            value:
              `Du ${formattedStartDate} au ${formattedEndDate}`,
          },

          {
            label: "Nombre de jours",
            value:
              `${numberOfDays} jour(s)`,
          },
        ],
      },
    });

    /**
     * ============================================================
     * 12. RÉPONSE
     * ============================================================
     */

    return NextResponse.json(
      {
        success: true,
        data: newRequest,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error(
      "[API Absence] Erreur lors de la création :",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur serveur interne.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}