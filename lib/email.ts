import 'server-only';
import { getGraphClient } from './graph';

export async function sendLeaveNotificationEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const graphClient = getGraphClient();
  if (!graphClient) {
    console.warn('[Email] Graph API non configuré. E-mail simulé pour:', to);
    return false;
  }

  const senderEmail = process.env.NOTIFICATION_SENDER_EMAIL || 'intranet@compel-toil.com';

  try {
    await graphClient.api(`/users/${senderEmail}/sendMail`).post({
      message: {
        subject,
        body: {
          contentType: 'HTML',
          content: html,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      },
      saveToSentItems: false,
    });

    console.log(`[Email] Notification envoyée avec succès à ${to}`);
    return true;
  } catch (error) {
    console.warn(`[Email] Impossible d'envoyer l'e-mail via Graph à ${to}:`, error);
    return false;
  }
}

/**
 * Modèle E-mail HTML pour le N+1 (Nouvelle Demande)
 */
export function getEmailTemplateN1({
  demandeurNom,
  typeConge,
  dateDebut,
  dateFin,
  nombreJours,
  motif,
}: {
  demandeurNom: string;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  motif?: string;
}): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #059669;">
        <h2 style="color: #064e3b; margin: 0;">🌴 Validation Recommandée — Congé T-OIL</h2>
      </div>

      <div style="padding: 20px 0; color: #1e293b; line-height: 1.6;">
        <p>Bonjour,</p>
        <p>Une nouvelle demande de congé a été soumise par <strong>${demandeurNom}</strong> et requiert votre validation en tant que supérieur hiérarchique N+1.</p>

        <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; margin: 16px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748b;">Demandeur :</td><td style="font-weight: bold; color: #0f172a;">${demandeurNom}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Type de congé :</td><td style="font-weight: bold; color: #059669;">${typeConge}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Période :</td><td style="font-weight: bold; color: #0f172a;">du ${dateDebut} au ${dateFin}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Durée :</td><td style="font-weight: bold; color: #0f172a;">${nombreJours} jour(s)</td></tr>
            ${motif ? `<tr><td style="padding: 6px 0; color: #64748b;">Motif :</td><td style="color: #334155;">${motif}</td></tr>` : ''}
          </table>
        </div>

        <p style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/demandes/validation" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accéder à mon Espace Manager pour Valider</a>
        </p>
      </div>

      <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; pt: 16px;">
        Intranet T-OIL — Notification automatique de gestion des absences
      </div>
    </div>
  `;
}

/**
 * Modèle E-mail HTML pour la RH (Après validation N+1)
 */
export function getEmailTemplateRH({
  demandeurNom,
  typeConge,
  dateDebut,
  dateFin,
  nombreJours,
}: {
  demandeurNom: string;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
}): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
        <h2 style="color: #1e3a8a; margin: 0;">🏢 Traitement RH — Congé Validé par N+1</h2>
      </div>

      <div style="padding: 20px 0; color: #1e293b; line-height: 1.6;">
        <p>Bonjour l'équipe RH,</p>
        <p>Le manager N+1 a <strong>approuvé</strong> la demande de congé de <strong>${demandeurNom}</strong>.</p>
        <p>Le dossier est à présent en attente de votre accord définitif pour prise en compte dans la paie.</p>

        <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Employé :</strong> ${demandeurNom}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Période :</strong> du ${dateDebut} au ${dateFin} (${nombreJours} jours)</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Statut actuel :</strong> Approuvée par N+1</p>
        </div>

        <p style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/demandes/validation" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Finaliser le Dossier RH</a>
        </p>
      </div>
    </div>
  `;
}

/**
 * Modèle E-mail HTML de Relance / Rappel (demande en attente > 48h)
 */
export function getEmailTemplateRappel({
  demandeurNom,
  typeConge,
  dateDebut,
  dateFin,
  nombreJours,
  role,
}: {
  demandeurNom: string;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  role: 'N1' | 'RH';
}): string {
  const isN1 = role === 'N1';
  const color = isN1 ? '#d97706' : '#2563eb';

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fffbebfb; padding: 24px; border-radius: 16px; border: 1px solid #fef3c7;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid ${color};">
        <h2 style="color: #92400e; margin: 0;">⏰ Rappel de Validation — Demande en Attente</h2>
      </div>

      <div style="padding: 20px 0; color: #1e293b; line-height: 1.6;">
        <p>Bonjour,</p>
        <p>Ceci est un rappel automatique concernant la demande de congé soumise par <strong>${demandeurNom}</strong> qui est toujours en attente de votre validation (${isN1 ? 'Supérieur N+1' : 'Équipe RH'}).</p>

        <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #fcd34d; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Demandeur :</strong> ${demandeurNom}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Type :</strong> ${typeConge}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Période :</strong> du ${dateDebut} au ${dateFin} (${nombreJours} jour(s))</p>
        </div>

        <p style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/demandes/validation" style="background-color: ${color}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Traiter la Demande en 1 clic</a>
        </p>
      </div>

      <div style="text-align: center; color: #b45309; font-size: 12px; border-top: 1px solid #fde68a; pt: 16px;">
        Portail T-OIL — Système de Relance Automatisé
      </div>
    </div>
  `;
}

/**
 * Modèle E-mail HTML pour l'Employé (Décision Approuvée / Refusée)
 */
export function getEmailTemplateDecision({
  demandeurNom,
  typeConge,
  statut,
  motifRefus,
  valideurRole,
}: {
  demandeurNom: string;
  typeConge: string;
  statut: 'APPROUVE' | 'REFUSE';
  motifRefus?: string;
  valideurRole: string;
}): string {
  const isApprouve = statut === 'APPROUVE';
  const color = isApprouve ? '#059669' : '#dc2626';
  const title = isApprouve ? '✅ Demande de Congé Approuvée' : '❌ Demande de Congé Non Accordée';

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid ${color};">
        <h2 style="color: ${color}; margin: 0;">${title}</h2>
      </div>

      <div style="padding: 20px 0; color: #1e293b; line-height: 1.6;">
        <p>Bonjour <strong>${demandeurNom}</strong>,</p>
        <p>Votre demande de <strong>${typeConge}</strong> a été <strong>${isApprouve ? 'approuvée' : 'refusée'}</strong> par ${valideurRole}.</p>

        ${
          !isApprouve && motifRefus
            ? `
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 12px; border: 1px solid #fecaca; margin: 16px 0; color: #991b1b;">
            <strong>Motif indiqué :</strong> ${motifRefus}
          </div>
        `
            : ''
        }

        <p style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/demandes" style="background-color: #334155; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Consulter mes demandes</a>
        </p>
      </div>
    </div>
  `;
}
