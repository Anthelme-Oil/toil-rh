import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  computeNextWorkflowStep,
  WorkflowStatus,
  WorkflowType,
} from "@/lib/workflows/engine";

import { sendMail } from "@/lib/emails/mail.service";
import  WorkflowValidationEmail  from "@/lib/emails/templates/WorkflowValidationEmail";

// ============================================================
// GET : Récupérer les demandes que l'utilisateur peut valider
// ============================================================

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Non autorisé",
        },
        { status: 401 },
      );
    }

    const email = session.user.email.toLowerCase().trim();

    // Récupération du profil de l'utilisateur connecté
    const currentUser = await prisma.utilisateur.findUnique({
      where: {
        email,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilisateur non trouvé",
        },
        { status: 404 },
      );
    }

    // ========================================================
    // Construction dynamique des conditions
    // ========================================================

    const conditions: any[] = [];

    // --------------------------------------------------------
    // 1. Utilisateur = N+1
    // --------------------------------------------------------

    conditions.push({
      statut: "PENDING_N1",
      emailManager: email,
    });

    // --------------------------------------------------------
    // 2. Utilisateur = DRH ou ADMIN
    // --------------------------------------------------------

    if (currentUser.estDRH || currentUser.role === "ADMIN") {
      conditions.push({
        statut: {
          in: ["PENDING_DRH", "PENDING_RH_EXEC"],
        },
      });
    }

    // --------------------------------------------------------
    // 3. Utilisateur = IT ou ADMIN
    // --------------------------------------------------------

    if (
      currentUser.role === "ADMIN" ||
      currentUser.poste?.toLowerCase().includes("it")
    ) {
      conditions.push({
        statut: {
          in: ["PENDING_IT_MGR", "PENDING_IT_EXEC"],
        },
      });
    }

    // ========================================================
    // Récupération des demandes
    // ========================================================

    const pendingRequests = await prisma.demande.findMany({
      where: {
        OR:
          conditions.length > 0
            ? conditions
            : [
                {
                  id: "none",
                },
              ],
      },

      orderBy: {
        creeLe: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: pendingRequests,
    });
  } catch (error) {
    console.error("[API_PENDING_GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// POST : Valider ou rejeter une demande
// ============================================================

export async function POST(req: Request) {
  try {
    // ========================================================
    // 1. Authentification
    // ========================================================

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Non autorisé",
        },
        { status: 401 },
      );
    }

    const email = session.user.email.toLowerCase().trim();

    // ========================================================
    // 2. Lecture de la requête
    // ========================================================

    const body = await req.json();

    const {
      demandeId,
      action,
      commentaire,
    } = body;

    if (!demandeId) {
      return NextResponse.json(
        {
          success: false,
          error: "L'identifiant de la demande est obligatoire.",
        },
        { status: 400 },
      );
    }

    if (!["VALIDATE", "REJECT"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "Action invalide. Utilisez VALIDATE ou REJECT.",
        },
        { status: 400 },
      );
    }

    // ========================================================
    // 3. Récupération de la demande
    // ========================================================

    const demande = await prisma.demande.findUnique({
      where: {
        id: demandeId,
      },
    });

    if (!demande) {
      return NextResponse.json(
        {
          success: false,
          error: "Demande introuvable",
        },
        { status: 404 },
      );
    }

    // ========================================================
    // 4. Vérification de l'étape actuelle
    // ========================================================

    const currentStatus = demande.statut as WorkflowStatus;

    const typeDemande = demande.typeDemande as WorkflowType;

    // ========================================================
    // 5. Vérification que l'utilisateur peut traiter
    //    cette demande
    // ========================================================

    const currentUser = await prisma.utilisateur.findUnique({
      where: {
        email,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilisateur non trouvé",
        },
        { status: 404 },
      );
    }

    let canProcess = false;

    // N+1
    if (
      currentStatus === "PENDING_N1" &&
      demande.emailManager?.toLowerCase().trim() === email
    ) {
      canProcess = true;
    }

    // DRH
    if (
      (currentStatus === "PENDING_DRH" ||
        currentStatus === "PENDING_RH_EXEC") &&
      (currentUser.estDRH || currentUser.role === "ADMIN")
    ) {
      canProcess = true;
    }

    // IT
    if (
      (currentStatus === "PENDING_IT_MGR" ||
        currentStatus === "PENDING_IT_EXEC") &&
      (currentUser.role === "ADMIN" ||
        currentUser.poste?.toLowerCase().includes("it"))
    ) {
      canProcess = true;
    }

    if (!canProcess) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Vous n'êtes pas autorisé à traiter cette demande à cette étape.",
        },
        { status: 403 },
      );
    }

    // ========================================================
    // 6. Calcul de la prochaine étape
    // ========================================================

    const transition = computeNextWorkflowStep(
      typeDemande,
      currentStatus,
      action === "REJECT" ? "REJECT" : "VALIDATE",
    );

    // ========================================================
    // 7. Historique actuel
    // ========================================================

    const historiqueActuel = Array.isArray(
      demande.historiqueValidations,
    )
      ? (demande.historiqueValidations as Array<any>)
      : [];

    // const nouvelleEntreeHistorique = {
    //   action: action === "REJECT" ? "REJECT" : "VALIDATE",

    //   etape: currentStatus,

    //   auteur: session.user.name || email,

    //   email,

    //   role: session.user.role || "VALIDATEUR",

    //   date: new Date().toISOString(),

    //   commentaire: commentaire || "",
    // };


 const validationDate = new Date();

const nouvelleEntreeHistorique = {
  action: action === "REJECT" ? "REJECT" : "VALIDATE",
  etape: currentStatus,
  auteur: session.user.name || email,
  email,
  role: session.user.role || "VALIDATEUR",
  date: validationDate.toISOString(),
  commentaire: commentaire || "",
};

const validationMessage =
  action === "REJECT"
    ? `La demande faite par ${demande.nomDemandeur} vient d'être rejetée par ${nouvelleEntreeHistorique.auteur} (${nouvelleEntreeHistorique.email}) le ${validationDate.toLocaleString("fr-FR")}.`
    : `La demande faite par ${demande.nomDemandeur} vient d'être approuvée par ${nouvelleEntreeHistorique.auteur} (${nouvelleEntreeHistorique.email}) le ${validationDate.toLocaleString("fr-FR")}. Cette demande est maintenant à votre niveau pour validation et préparation de la prochaine étape.`;

    // ========================================================
    // 8. Préparation des données de mise à jour
    // ========================================================

    const updateData: any = {
      statut: transition.nextStatus,

      historiqueValidations: [
        ...historiqueActuel,
        nouvelleEntreeHistorique,
      ],
    };

    // ========================================================
    // 9. Mise à jour selon l'étape
    // ========================================================

    if (currentStatus === "PENDING_N1") {
      updateData.statutN1 =
        action === "REJECT" ? "REFUSE" : "APPROUVE";

      updateData.dateValidationN1 = new Date();

      updateData.commentaireN1 = commentaire || "";
    } else if (
      currentStatus === "PENDING_DRH" ||
      currentStatus === "PENDING_RH_EXEC"
    ) {
      updateData.statutRH =
        action === "REJECT" ? "REFUSE" : "APPROUVE";

      updateData.dateValidationRH = new Date();

      updateData.commentaireRH = commentaire || "";
    } else if (currentStatus.startsWith("PENDING_IT")) {
      updateData.statutIT =
        action === "REJECT" ? "REFUSE" : "APPROUVE";

      updateData.dateValidationIT = new Date();

      updateData.commentaireIT = commentaire || "";
    }

    // ========================================================
    // 10. Mise à jour de la demande
    // ========================================================

    const updatedDemande = await prisma.demande.update({
      where: {
        id: demandeId,
      },

      data: updateData,
    });

    // ========================================================
    // 11. Déterminer le prochain destinataire
    // ========================================================

   let nextRecipientEmails: string[] = [];
    let nextRecipientName = "Utilisateur";



    let nextStepName = "";

    // --------------------------------------------------------
    // N+1
    // --------------------------------------------------------
//     console.log("[WORKFLOW] Demande :", demande.id);
// console.log("[WORKFLOW] Statut actuel :", currentStatus);
// console.log("[WORKFLOW] Action :", action);
// console.log("[WORKFLOW] Type demande :", typeDemande);
// console.log("[WORKFLOW] Transition :", transition);

   if (transition.nextStatus === "PENDING_N1") {
  if (demande.emailManager) {
    nextRecipientEmails = [
      demande.emailManager.trim().toLowerCase(),
    ];
  }

  nextStepName = "Validation hiérarchique (N+1)";
}

    // --------------------------------------------------------
    // DRH
    // --------------------------------------------------------

    if (transition.nextStatus === "PENDING_DRH") {
      const drh = await prisma.utilisateur.findFirst({
        where: {
          OR: [
            {
              estDRH: true,
            },
            {
              role: "DRH",
            },
          ],

          // actif: true,
        },

        select: {
          email: true,
          nom: true,
        },
      });

     if (drh?.email) {
  nextRecipientEmails = [
    drh.email.trim().toLowerCase(),
  ];
}

      nextRecipientName = drh?.nom || "DRH";

      nextStepName = "Validation DRH";
    }

    // --------------------------------------------------------
    // RH Exécutant
    // --------------------------------------------------------

 if (transition.nextStatus === "PENDING_RH_EXEC") {
  const rhParametre = await prisma.parametre.findFirst({
    where: {
      cle: `${typeDemande}_PENDING_RH_EXEC`,
    },
    select: {
      valeur: true,
    },
  });

  // Les e-mails sont stockés dans Parametre.valeur
  // Exemple :
  // "rh1@togosh.com,rh2@togosh.com,rh3@togosh.com"

  const configuredEmails = (rhParametre?.valeur || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (configuredEmails.length > 0) {
    const rhExecutants = await prisma.utilisateur.findMany({
      where: {
        email: {
          in: configuredEmails,
        },
      },
      select: {
        email: true,
        nom: true,
      },
    });

    nextRecipientEmails = rhExecutants
      .map((user) => user.email?.trim().toLowerCase())
      .filter(Boolean);

    nextStepName = "Traitement RH";

    console.info(
      "[API_PENDING_POST] RH exécutants configurés :",
      rhExecutants.map((user) => ({
        email: user.email,
        nom: user.nom,
      })),
    );
  }
}

    // --------------------------------------------------------
    // IT Manager
    // --------------------------------------------------------

    if (transition.nextStatus === "PENDING_IT_MGR") {
      const itManager = await prisma.utilisateur.findFirst({
        where: {
          poste: {
            contains: "IT",
            mode: "insensitive",
          },

          // actif: true,
        },

        select: {
          email: true,
          nom: true,
        },
      });

      if (itManager?.email) {
  nextRecipientEmails = [
    itManager.email.trim().toLowerCase(),
  ];
}

      nextRecipientName = itManager?.nom || "Responsable IT";

      nextStepName = "Validation IT";
    }

    // --------------------------------------------------------
    // IT Exécutant
    // --------------------------------------------------------

    if (transition.nextStatus === "PENDING_IT_EXEC") {
      const itExecutor = await prisma.utilisateur.findFirst({
        where: {
          role: "IT_EXEC",

          // actif: true,
        },

        select: {
          email: true,
          nom: true,
        },
      });

      if (itExecutor?.email) {
  nextRecipientEmails = [
    itExecutor.email.trim().toLowerCase(),
  ];
}

      nextRecipientName = itExecutor?.nom || "Exécutant IT";

      nextStepName = "Traitement IT";
    }

    // ========================================================
    // 12. Envoi du mail au prochain acteur
    // ========================================================

   if (nextRecipientEmails.length > 0) {

//     console.log("[MAIL] Statut suivant :", transition.nextStatus);
// console.log("[MAIL] Destinataires :", nextRecipientEmails);
// console.log("[MAIL] Nom destinataire :", nextRecipientName);
// console.log("[MAIL] Étape :", nextStepName);
  try {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    for (const recipientEmail of nextRecipientEmails) {
      await sendMail({
        to: recipientEmail,

        subject:
          `Action requise — ${demande.typeDemande} — ${demande.typeConge} — ${demande.id}`,

        template: WorkflowValidationEmail,

        props: {
          recipientName: nextRecipientName,

          workflowName: "Gestion des demandes",

          stepName: nextStepName,

          requestReference: demande.reference || (demande.id ? demande.id.substring(0, 8).toUpperCase() : ""),                  

          requesterName:
            session.user.name || "Demandeur",

          submittedAt: demande.creeLe,

          message:validationMessage,
            // `Une nouvelle demande de ${demande.typeDemande} pour ${demande.typeConge} est en attente de votre validation. Veuillez consulter la demande afin de poursuivre son traitement.`,

          actionUrl:
            `${appUrl}/mes-demandes/${demande.id}`,

          actionLabel: "Consulter la demande",

          companyName:
            "COMPEL STSL T-OIL — Intranet",

          applicationName:
            "COMPEL STSL T-OIL — Intranet",

          details: [
            {
              label: "Type de demande",
              value:
                demande.typeDemande ||
                "Non spécifié",
            },
            {
              label: "Type de congé",
              value:
                demande.typeConge ||
                "Non spécifié",
            },
            {
              label: "Référence",
              value: String(demande.id),
            },
            {
              label: "Étape",
              value: nextStepName,
            },
          ],
        },
      });

      console.info(
        `[API_PENDING_POST] Notification envoyée à ${recipientEmail}`
      );
    }
  } catch (mailError) {
    console.error(
      "[API_PENDING_POST] Demande traitée mais notification non envoyée.",
      mailError
    );
  }
} else {
  console.info(
    `[API_PENDING_POST] Aucun destinataire trouvé pour le statut ${transition.nextStatus}`
  );
}
    
    // else {
    //   console.info(
    //     `[API_PENDING_POST] Aucun destinataire trouvé pour le statut ${transition.nextStatus}`,
    //   );
    // }

    // ========================================================
    // 13. Réponse
    // ========================================================

    return NextResponse.json({
      success: true,

      data: updatedDemande,

      workflow: {
        previousStatus: currentStatus,
        nextStatus: transition.nextStatus,
        action,
      },

     notification: {
  sent: nextRecipientEmails.length > 0,
  recipients: nextRecipientEmails,
},
    });
  } catch (error) {
    console.error("[API_PENDING_POST]", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Erreur lors du traitement de la validation",
      },
      { status: 500 },
    );
  }
}