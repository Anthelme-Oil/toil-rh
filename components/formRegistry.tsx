import React from 'react';

import AbsenceForm from './forms/AbsenceForm';
import DomiciliationForm from './forms/DomiciliationForm';
import AttestationForm from './forms/AttestationForm';

export interface FormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const FORM_REGISTRY: Record<
  string,
  {
    title?: string;
    subtitle?: string;
    component: React.ComponentType<FormProps>;
  }
> = {
  ABSENCE: {
    title: 'Demande d’absence',
    subtitle: 'Remplissez les informations nécessaires',
    component: AbsenceForm,
  },

  DOMICILIATION: {
    title: 'Domiciliation bancaire',
    subtitle: 'Remplissez les informations nécessaires',
    component: DomiciliationForm,
  },

  ATTESTATION: {
    title: 'Demande d’attestation',
    subtitle: 'Remplissez les informations nécessaires',
    component: AttestationForm,
  },
};