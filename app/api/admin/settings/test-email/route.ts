import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPermissionsByEmail } from '@/lib/roles';
import { sendLeaveNotificationEmail } from '@/lib/email';
import { getSystemSettings } from '@/lib/settings';

/**
 * POST /api/admin/settings/test-email
 * Envoie un e-mail de test immédiat pour valider la configuration Graph API
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const perms = await getUserPermissionsByEmail(email);
    if (!perms.isAdmin) {
      return NextResponse.json({ error: 'Accès réservé aux Administrateurs' }, { status: 403 });
    }

    const body = await request.json();
    const recipient = (body.recipient || email).toLowerCase().trim();

    const settings = await getSystemSettings();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f8; border-radius: 12px;">
        <h2 style="color: #059669;">✅ E-mail de Test — Portail Intranet T-OIL</h2>
        <p>Ceci est un message de test envoyé depuis le Panneau d'Administration T-OIL.</p>
        <div style="background-color: #ffffff; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Expéditeur configuré :</strong> ${settings.senderEmail}</p>
          <p style="margin: 4px 0;"><strong>Destinataire :</strong> ${recipient}</p>
          <p style="margin: 4px 0;"><strong>Service d'envoi :</strong> Microsoft Graph API (Entra ID)</p>
          <p style="margin: 4px 0;"><strong>Statut des notifications :</strong> ${settings.enableEmailNotifications ? 'Activées' : 'Désactivées'}</p>
        </div>
        <p style="color: #64748b; font-size: 12px;">Date du test : ${new Date().toLocaleString('fr-FR')}</p>
      </div>
    `;

    const success = await sendLeaveNotificationEmail({
      to: recipient,
      subject: `[TEST IT] Validation de la configuration E-mail T-OIL`,
      html: htmlContent,
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: `E-mail de test envoyé avec succès à ${recipient} via l'adresse expéditrice ${settings.senderEmail}`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Échec d'envoi. Vérifiez que la boîte '${settings.senderEmail}' existe dans votre tenant M365 et que l'application Azure AD a la permission 'Mail.Send'.`,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur envoi de test';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
