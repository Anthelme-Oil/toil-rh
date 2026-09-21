import { WorkflowType, WorkflowStatus, workflowDefinitions } from "@/lib/workflows/engine";
import { RequestItem ,SequenceType} from "@/types";

// export interface RequestItem {
//   // --- Champs originaux de la table Demande Prisma ---
//   id: string;
//   titre: string;
//   typeDemande: string;
//   statut: string;
//   utilisateurId: string | null;
//   emailDemandeur: string;
//   nomDemandeur: string;
//   targetUserId: string | null;
//   targetUserName: string | null;
//   emailManager: string | null;
//   statutN1: string;
//   dateValidationN1: string | null; // ou Date selon la sérialisation API
//   commentaireN1: string | null;
//   statutRH: string;
//   dateValidationRH: string | null;
//   commentaireRH: string | null;
//   statutIT: string;
//   dateValidationIT: string | null;
//   commentaireIT: string | null;
//   historiqueValidations: Array<{
//     stepId: string;
//     valideur?: string;
//     dateValidation?: string;
//     commentaire?: string;
//     [key: string]: any;
//   }> | null;
//   dateDebut: string | null;
//   dateFin: string | null;
//   nombreJours: number | null;
//   typeConge: string | null;
//   motif: string | null;
//   pieceJointe: string | null;
//   donneesFormulaire: any | null;
//   creeLe: string;
//   misAJourLe: string;

//   // --- Champs calculés / enrichis pour le workflow ---
//   reference: string;
//   type: WorkflowType;
//   statutActuel: WorkflowStatus;
//   dateCreation: string;
//   nextStep?: {
//     id: string;
//     nom: string;
//     role: string;
//     statusMatcher: WorkflowStatus;
//   } | null;
//   estTerminee?: boolean;
//   estRejetee?: boolean;
//   historique?: Array<{
//     stepId: string;
//     valideur?: string;
//     dateValidation?: string;
//     commentaire?: string;
//   }>;
// }

/**
 * Fonction utilitaire pour enrichir une demande brute en conservant 100% de ses champs
 * 
 * 
 */

export function nextSequence(
  status: string,
  sequence: SequenceType[]
): SequenceType | null {
  const currentIndex = sequence.findIndex(
    (step) => step.statusMatcher === status
  );

  if (currentIndex === -1) {
    return null;
  }

  return sequence[currentIndex];
}
export function enrichRequestWithNextStep(item: any): RequestItem {
  const type = (item.typeDemande || "ABSENCE") as WorkflowType;
  const currentStatus = (item.statut || "PENDING_N1") as WorkflowStatus;
  const sequence = workflowDefinitions[type] || workflowDefinitions.ABSENCE;

  // const nextSeq= nextSequence(currentStatus,sequence);
  // console.log("nexSeq",currentStatus,"sequence=>",nextSeq)
const estTerminee = currentStatus === "APPROUVE";
const estRejetee = currentStatus === "REFUSE";

const nextStep =
  estTerminee || estRejetee
    ? null
    : nextSequence(currentStatus, sequence);

// console.log(
//   "sequence =>",
//   sequence,
//   "currentStatus =>",
//   currentStatus,
//   "nextStep =>",
//   nextStep
// );

  return {
    // 1. Tous les champs bruts de la base de données
    id: item.id,
    titre: item.titre,
    typeDemande: item.typeDemande,
    statut: item.statut,
    utilisateurId: item.utilisateurId ?? null,
    emailDemandeur: item.emailDemandeur,
    nomDemandeur: item.nomDemandeur,
    targetUserId: item.targetUserId ?? null,
    targetUserName: item.targetUserName ?? null,
    emailManager: item.emailManager ?? null,
    statutN1: item.statutN1,
    dateValidationN1: item.dateValidationN1 ?? null,
    commentaireN1: item.commentaireN1 ?? null,
    statutRH: item.statutRH,
    dateValidationRH: item.dateValidationRH ?? null,
    commentaireRH: item.commentaireRH ?? null,
    statutIT: item.statutIT,
    dateValidationIT: item.dateValidationIT ?? null,
    commentaireIT: item.commentaireIT ?? null,
    historiqueValidations: item.historiqueValidations ?? null,
    dateDebut: item.dateDebut ?? null,
    dateFin: item.dateFin ?? null,
    nombreJours: item.nombreJours ?? null,
    typeConge: item.typeConge ?? null,
    motif: item.motif ?? null,
    pieceJointe: item.pieceJointe ?? null,
    donneesFormulaire: item.donneesFormulaire ?? null,
    creeLe: item.creeLe,
    misAJourLe: item.misAJourLe,

    // 2. Propriétés enrichies et helpers
    reference: item.reference || (item.id ? item.id.substring(0, 8).toUpperCase() : ""),
    type,
    statutActuel: currentStatus,
    dateCreation: item.creeLe,
    nextStep,
    estTerminee,
    estRejetee,
    historique: Array.isArray(item.historiqueValidations) ? item.historiqueValidations : [],
  };
}

/**
 * Récupération et transformation des demandes de l'utilisateur
 */
export async function getN1Validate(): Promise<RequestItem[]> {
  try {
    const res = await fetch("/api/requests/n1-validate", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }

    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      // console.log("api",json?.data)
      return json.data.map((item: any) => enrichRequestWithNextStep(item));
    }

    return [];
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes :", error);
    throw error;
  }
}