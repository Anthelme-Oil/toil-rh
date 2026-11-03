import { WorkflowStep, StepStatus } from "@/components/WorkflowStepper";

export type WorkflowType =
  | "ABSENCE"
  | "DOMICILIATION"
  | "RENOUVELLEMENT_IT"
  | "GESTION_COMPTE_IT"
  | "ATTESTATION"
  | "CONSOMMABLE"
  | "MATERIEL_IT"
  | "ACHAT"
  | "BESOIN_METIER"
  | "ACCES_SITE";

export type WorkflowStatus =
  | "SUBMITTED"
  | "PENDING_N1"
  | "PENDING_DRH"
  | "PENDING_RH_EXEC"
  | "PENDING_IT_MGR"
  | "PENDING_IT_EXEC"
  | "APPROUVE"
  | "REFUSE";

interface StepDefinition {
  id: string;
  nom: string;
  role: string;
  statusMatcher: WorkflowStatus;
}

// Définition centralisée des circuits pour chaque type de demande
//dispoiton des eleent dans l'intranet
export const workflowDefinitions: Record<WorkflowType, StepDefinition[]> = {
  ABSENCE: [
    { id: "step_sub", nom: "Soumission", role: "Demandeur", statusMatcher: "SUBMITTED" },
    { id: "step_n1", nom: "Validation Hiérarchique", role: "Supérieur N+1", statusMatcher: "PENDING_N1" },
    { id: "step_drh", nom: "Validation DRH", role: "DRH", statusMatcher: "PENDING_DRH" },
    { id: "step_exec", nom: "Traitement final", role: "RH Exécutant", statusMatcher: "PENDING_RH_EXEC" },
  ],
  DOMICILIATION: [
    { id: "step_sub", nom: "Soumission", role: "Demandeur", statusMatcher: "SUBMITTED" },
    { id: "step_drh", nom: "Validation DRH", role: "DRH", statusMatcher: "PENDING_DRH" },
    { id: "step_exec", nom: "Établissement", role: "RH Exécutant", statusMatcher: "PENDING_RH_EXEC" },
  ],
  ATTESTATION: [
    { id: "step_sub", nom: "Soumission", role: "Demandeur", statusMatcher: "SUBMITTED" }, ///Les deux peuevtn recevoir en meme temps
    { id: "step_drh", nom: "Validation DRH", role: "DRH", statusMatcher: "PENDING_DRH" },
    { id: "step_exec", nom: "Établissement", role: "RH Exécutant", statusMatcher: "PENDING_RH_EXEC" },
  ],
  RENOUVELLEMENT_IT: [
    { id: "step_sub", nom: "Soumission", role: "Demandeur", statusMatcher: "SUBMITTED" },
    { id: "step_n1", nom: "Validation Hiérarchique", role: "Supérieur N+1", statusMatcher: "PENDING_N1" },
    { id: "step_itmgr", nom: "Approbation IT", role: "IT Manager", statusMatcher: "PENDING_IT_MGR" },
    { id: "step_itexec", nom: "Exécution Technique", role: "IT Exécutant", statusMatcher: "PENDING_IT_EXEC" },
  ],
  GESTION_COMPTE_IT: [
    { id: "step_sub", nom: "Initiation", role: "RH Chargé", statusMatcher: "SUBMITTED" },
    { id: "step_n1", nom: "Avis Supérieur", role: "Supérieur N+1", statusMatcher: "PENDING_N1" },
    { id: "step_drh", nom: "Validation DRH", role: "DRH", statusMatcher: "PENDING_DRH" },
    { id: "step_itmgr", nom: "Approbation IT", role: "IT Manager", statusMatcher: "PENDING_IT_MGR" },
    { id: "step_itexec", nom: "Exécution", role: "IT Exécutant", statusMatcher: "PENDING_IT_EXEC" },
  ],
  CONSOMMABLE: [
    { id: "step_sub", nom: "Demande", role: "Demandeur", statusMatcher: "SUBMITTED" },
    { id: "step_itmgr", nom: "Validation", role: "IT Manager", statusMatcher: "PENDING_IT_MGR" },
    { id: "step_itexec", nom: "Délivrance", role: "IT Exécutant", statusMatcher: "PENDING_IT_EXEC" },
  ],
  MATERIEL_IT: [
    { id: "step_sub", nom: "Demande", role: "Demandeur", statusMatcher: "SUBMITTED" },
    { id: "step_itmgr", nom: "Validation", role: "IT Manager", statusMatcher: "PENDING_IT_MGR" },
    { id: "step_itexec", nom: "Délivrance", role: "IT Exécutant", statusMatcher: "PENDING_IT_EXEC" },
  ],
  ACHAT: [
    { id: "step_sub", nom: "Demande", role: "Demandeur", statusMatcher: "SUBMITTED" },
    { id: "step_itmgr", nom: "Validation Achat", role: "IT Manager", statusMatcher: "PENDING_IT_MGR" },
    { id: "step_itexec", nom: "Commande", role: "IT Exécutant", statusMatcher: "PENDING_IT_EXEC" },
  ],
  BESOIN_METIER: [
    { id: "step_sub", nom: "Expression", role: "Demandeur", statusMatcher: "SUBMITTED" },
    { id: "step_itmgr", nom: "Autorisation", role: "IT Manager", statusMatcher: "PENDING_IT_MGR" },
    { id: "step_itexec", nom: "Déploiement", role: "IT Exécutant", statusMatcher: "PENDING_IT_EXEC" },
  ],
  ACCES_SITE: [
    { id: "step_sub", nom: "Demande", role: "Demandeur", statusMatcher: "SUBMITTED" },
    { id: "step_n1", nom: "Validation d'Accès", role: "Supérieur N+1", statusMatcher: "PENDING_N1" },
  ],
};

/**
 * 1. Moteur d'affichage pour le Stepper (Frontend)
 */
export function getWorkflowStepsSequence(
  type: WorkflowType,
  currentStatus: WorkflowStatus,
  history: Array<{ stepId: string; valideur?: string; dateValidation?: string; commentaire?: string }> = []
): WorkflowStep[] {
  const sequence = workflowDefinitions[type] || workflowDefinitions.ABSENCE;

  let currentIndex = sequence.findIndex((s) => s.statusMatcher === currentStatus);

  if (currentStatus === "APPROUVE") {
    currentIndex = sequence.length;
  } else if (currentIndex === -1) {
    currentIndex = 0;
  }

  return sequence.map((def, index) => {
    const historicalEntry = history.find((h) => h.stepId === def.id);
    let statut: StepStatus = "PENDING";

    if (currentStatus === "REFUSE") {
      statut = historicalEntry ? "COMPLETED" : "REJECTED";
    } else if (currentStatus === "APPROUVE" || index < currentIndex) {
      statut = "COMPLETED";
    } else if (index === currentIndex || (index === 0 && currentStatus === "SUBMITTED")) {
      statut = index === 0 && currentStatus !== "SUBMITTED" ? "COMPLETED" : "IN_PROGRESS";
    }

    return {
      id: def.id,
      nom: def.nom,
      role: def.role,
      statut,
      valideur: historicalEntry?.valideur,
      dateValidation: historicalEntry?.dateValidation,
      commentaire: historicalEntry?.commentaire,
    };
  });
}

/**
 * 2. Moteur de calcul du prochain statut (Backend / API de validation)
 */
export function computeNextWorkflowStep(
  type: WorkflowType,
  currentStatus: WorkflowStatus,
  action: "VALIDATE" | "EXECUTE" | "REJECT"
): { nextStatus: WorkflowStatus } {
  if (action === "REJECT") {
    return { nextStatus: "REFUSE" };
  }

  const sequence = workflowDefinitions[type] || workflowDefinitions.ABSENCE;
  const currentIndex = sequence.findIndex((s) => s.statusMatcher === currentStatus);

  // Si l'étape actuelle n'est pas trouvée ou si c'est la dernière, on approuve globalement
  if (currentIndex === -1 || currentIndex >= sequence.length - 1) {
    return { nextStatus: "APPROUVE" };
  }

  // Sinon, le prochain statut devient le `statusMatcher` de l'étape suivante dans le tableau
  return { nextStatus: sequence[currentIndex + 1].statusMatcher };
}