import "server-only";
import React, { type ReactElement } from 'react';
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
// import type { ReactElement } from "react";

// import { emailConfig } from "./conf";
import { getEmailConfig } from "./conf";
import type { MailRecipient, SendMailOptions } from "./mail.types"

/**
 * Transporteur SMTP Microsoft 365.
 *
 * Le transporter est créé une seule fois au niveau du module
 * afin d'éviter de recréer une connexion/configuration SMTP
 * à chaque envoi.
 */

const getTransporter = () => {
  const emailConfig = getEmailConfig();

  return nodemailer.createTransport({
    host: emailConfig.smtp.host,
    port: emailConfig.smtp.port,
    secure: emailConfig.smtp.secure,
    requireTLS: emailConfig.smtp.requireTLS,
    auth: {
      user: emailConfig.smtp.auth.user,
      pass: emailConfig.smtp.auth.pass,
    },
  });
};
// const emailConfig = getEmailConfig();
// const transporter = nodemailer.createTransport({
//   host: emailConfig.smtp.host,
//   port: emailConfig.smtp.port,
//   secure: emailConfig.smtp.secure,
//   requireTLS: emailConfig.smtp.requireTLS,

//   auth: {
//     user: emailConfig.smtp.auth.user,
//     pass: emailConfig.smtp.auth.pass,
//   },
// });

const transporter =getTransporter();

/**
 * Normalise les destinataires.
 *
 * Accepte :
 * - une adresse unique
 * - plusieurs adresses sous forme de tableau
 */
const normalizeRecipients = (
  recipients?: MailRecipient,
): string | undefined => {
  if (!recipients) {
    return undefined;
  }

  if (Array.isArray(recipients)) {
    const validRecipients = recipients
      .map((email) => email.trim())
      .filter(Boolean);

    if (validRecipients.length === 0) {
      return undefined;
    }

    return validRecipients.join(", ");
  }

  const recipient = recipients.trim();

  return recipient || undefined;
};

/**
 * Vérifie qu'au moins un destinataire principal
 * est fourni.
 */
const validateRecipients = (
  to?: string,
  cc?: string,
  bcc?: string,
): void => {
  if (!to && !cc && !bcc) {
    throw new Error(
      "[MAIL_SERVICE] Aucun destinataire n'a été fourni.",
    );
  }
};

/**
 * Vérifie la connexion au serveur SMTP.
 *
 * Utile au démarrage de l'application ou pour un endpoint
 * de health-check.
 */
export const verifyMailTransport = async (): Promise<void> => {
  try {
    await transporter.verify();
  } catch (error) {
    console.error(
      "[MAIL_SERVICE] Échec de vérification du serveur SMTP.",
      error,
    );

    throw new Error(
      "Le serveur de messagerie est actuellement indisponible.",
    );
  }
};

/**
 * Service générique d'envoi d'e-mails.
 *
 * Le service reçoit :
 * - les destinataires
 * - le sujet
 * - le composant React du template
 * - les données nécessaires au template
 *
 * Il est volontairement indépendant du métier.
 */
export const sendMail = async <TProps>({
  to,
  cc,
  bcc,
  subject,
  template,
  props,
  replyTo,
}: SendMailOptions<TProps>): Promise<{
  messageId: string;
}> => {
  if (!subject?.trim()) {
    throw new Error(
      "[MAIL_SERVICE] Le sujet de l'e-mail est obligatoire.",
    );
  }

  if (!template) {
    throw new Error(
      "[MAIL_SERVICE] Le template de l'e-mail est obligatoire.",
    );
  }

  const normalizedTo = normalizeRecipients(to);
  const normalizedCc = normalizeRecipients(cc);
  const normalizedBcc = normalizeRecipients(bcc);

  validateRecipients(
    normalizedTo,
    normalizedCc,
    normalizedBcc,
  );

  try {
    /**
     * Création du composant React.
     *
     * Le template reste totalement indépendant
     * du mécanisme d'envoi.
     */
    // const emailElement = template(props) as ReactElement;
    // const emailElement = React.createElement(template, props) as ReactElement;
    const emailElement = template(props);

    /**
     * Conversion du composant React Email en HTML.
     */
    const html = await render(emailElement);

    /**
     * Envoi via Microsoft 365.
     */
    const info = await transporter.sendMail({
      from: emailConfig.from,

      to: normalizedTo,
      cc: normalizedCc,
      bcc: normalizedBcc,

      replyTo,

      subject: subject.trim(),

      html,

      /**
       * Version texte alternative.
       *
       * Permet aux clients mail qui ne rendent pas correctement
       * le HTML d'afficher une version lisible.
       */
      text: html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    });

    console.info(
      `[MAIL_SERVICE] E-mail envoyé avec succès. messageId=${info.messageId}`,
    );

    return {
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(
      "[MAIL_SERVICE] Échec de l'envoi de l'e-mail.",
      {
        subject,
        to: normalizedTo,
        cc: normalizedCc,
        bcc: normalizedBcc,
        error,
      },
    );

    throw new Error(
      "Impossible d'envoyer l'e-mail.",
    );
  }
};

export default sendMail;