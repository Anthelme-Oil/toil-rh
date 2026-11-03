export interface KeyValueItem {
  label: string;
  value: string;
}

export interface EmailTemplateData {
  title: string;
  subtitle?: string;
  recipientName?: string;
  applicantName: string;
  requestType: string;
  requestId: string;
  details: KeyValueItem[];
  actionUrl: string;
  actionText?: string;
}

export function generateNotificationEmailHtml(data: EmailTemplateData): string {
  const {
    title,
    subtitle = "Portail Web Intranet",
    recipientName = "Madame, Monsieur",
    applicantName,
    requestType,
    requestId,
    details,
    actionUrl,
    actionText = "Traiter la demande",
  } = data;

  // Génération dynamique des lignes de détails
  const detailsHtml = details
    .map(
      (item) => `
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 40%; font-weight: 500;">${item.label}</td>
        <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 600;">${item.value}</td>
      </tr>`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #333333;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        
        <!-- En-tête Institutionnel -->
        <tr>
          <td style="background-color: #004b87; padding: 24px 32px; text-align: left;">
            <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 600; letter-spacing: 0.5px;">
              T-OIL <span style="font-size: 13px; font-weight: 300; opacity: 0.85;">| ${subtitle}</span>
            </h1>
          </td>
        </tr>

        <!-- Corps du Message -->
        <tr>
          <td style="padding: 32px;">
            <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 0;">Bonjour ${recipientName},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
              Une nouvelle demande nécessitant votre arbitrage a été enregistrée sur le système.
            </p>

            <!-- Encadré des Détails Dynamiques -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-left: 4px solid #004b87; border-radius: 4px; margin-bottom: 28px; padding: 16px 20px;">
              <tr>
                <td>
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 40%; font-weight: 500;">Agent demandeur</td>
                      <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 600;">${applicantName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Nature du flux</td>
                      <td style="padding: 6px 0; font-size: 13px; color: #004b87; font-weight: 600;">${requestType}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">Référence dossier</td>
                      <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 600; font-family: monospace;">#${requestId.slice(-8).toUpperCase()}</td>
                    </tr>
                    ${detailsHtml}
                  </table>
                </td>
              </tr>
            </table>

            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 28px;">
              Veuillez examiner les détails ci-dessus et enregistrer votre décision via l'espace de validation.
            </p>

            <!-- Bouton d'Action -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center">
                  <a href="${actionUrl}" target="_blank" style="display: inline-block; background-color: #004b87; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0, 75, 135, 0.2);">
                    ${actionText}
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size: 11px; color: #94a3b8; margin-top: 28px; text-align: center;">
              Si le bouton ne s'affiche pas correctement, utilisez ce lien :<br/>
              <a href="${actionUrl}" style="color: #004b87; text-decoration: underline;">${actionUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Pied de page -->
        <tr>
          <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0; font-weight: 600;">
              Société Togolaise de Stockage de Lomé (T-OIL)
            </p>
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
              Ceci est un message automatique. Merci de ne pas y répondre directement.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}