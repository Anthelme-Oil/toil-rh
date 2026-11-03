import nodemailer from 'nodemailer';
import { generateNotificationEmailHtml, KeyValueItem } from '../emails/templates/baseNotification';

export interface SendGenericNotificationParams {
  recipientEmail: string;
  applicantName: string;
  requestType: string;
  requestId: string;
  customDetails?: KeyValueItem[];
}

export async function sendRequestNotification({
  recipientEmail,
  applicantName,
  requestType,
  requestId,
  customDetails = [],
}: SendGenericNotificationParams) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const actionUrl = `${baseUrl}/validations/${requestId}`;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.office365.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  // Diagnostic explicite si identifiants manquants
  if (!smtpUser || !smtpPass) {
    console.error('[EMAIL_SERVICE_ERROR] SMTP_USER ou SMTP_PASS manquant dans .env.local');
    return { success: false, error: 'Identifiants SMTP non configurés.' };
  }

  // Instanciation du transporteur avec les variables d'environnement
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // false pour le port 587 (STARTTLS)
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const html = generateNotificationEmailHtml({
    title: `Demande de ${requestType} - ${applicantName}`,
    applicantName,
    requestType,
    requestId,
    details: customDetails,
    actionUrl,
  });

  try {
    const info = await transporter.sendMail({
      from: `"Portail Intranet T-OIL" <${smtpUser}>`,
      to: recipientEmail,
      subject: `[Intranet T-OIL] Validation requise : ${requestType} - ${applicantName}`,
      html,
    });

    console.log('[EMAIL_SUCCESS] Email envoyé avec succès à %s ! MessageID:', recipientEmail, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL_SERVICE_ERROR] Échec lors de l’envoi de l’email :', error);
    return { success: false, error };
  }
}