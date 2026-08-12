import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPermissionsByEmail } from '@/lib/roles';
import { getSystemSettings, saveSystemSettings } from '@/lib/settings';

/**
 * GET /api/admin/settings
 * Récupère la configuration système (emails expéditeur/RH, activation)
 */
export async function GET() {
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

    const settings = await getSystemSettings();
    return NextResponse.json(settings);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/settings
 * Enregistre les modifications de configuration
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
    const { senderEmail, rhEmail, rhPrintEmail, enableEmailNotifications } = body;

    const ok = await saveSystemSettings({
      senderEmail,
      rhEmail,
      rhPrintEmail,
      enableEmailNotifications,
    });

    if (!ok) {
      return NextResponse.json({ error: 'Échec de l’enregistrement des paramètres' }, { status: 500 });
    }

    const updated = await getSystemSettings();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
