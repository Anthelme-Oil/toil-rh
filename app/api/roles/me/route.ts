import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPermissionsByEmail } from '@/lib/roles';

export const dynamic = 'force-dynamic';

/**
 * GET /api/roles/me
 * Retourne les permissions de l'utilisateur connecté.
 * L'email est lu depuis la session serveur (auth()), jamais depuis un query param.
 */
export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter via Microsoft 365.' },
        { status: 401 }
      );
    }

    const permissions = await getUserPermissionsByEmail(email);
    return NextResponse.json(permissions, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
