import AbsenceForm from './forms/AbsenceForm';
import DomiciliationForm from './forms/DomiciliationForm';
import AttestationForm from './forms/AttestationForm';

export const FORM_REGISTRY: Record<string, { component: React.ComponentType<any> }> = {
  ABSENCE: { component: AbsenceForm },
  DOMICILIATION: { component: DomiciliationForm },
  ATTESTATION: { component: AttestationForm },
  // Ajoutez les autres formulaires au fur et à mesure de leur création :
  // ACCOUNT_RENEWAL: { component: AccountRenewalForm },
};