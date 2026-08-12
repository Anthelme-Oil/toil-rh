import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPermissionsByEmail, getAllUserRoles, saveOrUpdateUserRole, seedDefaultRolesToDatabase, deleteUserRole } from '@/lib/roles';

/**
 * GET /api/roles
 * Liste tous les utilisateurs et leurs rôles.
 * Protégé : uniquement accessible aux ADMIN.
 */
export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur connecté est ADMIN
    const perms = await getUserPermissionsByEmail(email);
    if (!perms.isAdmin) {
      return NextResponse.json({ error: 'Accès refusé. Rôle ADMIN requis.' }, { status: 403 });
    }

    const roles = await getAllUserRoles();
    return NextResponse.json({ roles });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/roles
 * Crée ou met à jour un utilisateur.
 * Protégé : uniquement accessible aux ADMIN.
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
      return NextResponse.json({ error: 'Accès refusé. Rôle ADMIN requis.' }, { status: 403 });
    }

    const body = await request.json();

    if (body.action === 'seed') {
      const seedResult = await seedDefaultRolesToDatabase();
      if (!seedResult.success) {
        return NextResponse.json(
          { error: seedResult.error || 'Échec de l\'initialisation des rôles.' },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, count: seedResult.count });
    }

    const id = body.id;
    const name = (body.name || body.Title || body.Name || '').trim();
    const targetEmail = (body.email || body.Email || body.EMail || '').trim();
    const role = body.role || 'EMPLOYE';
    const managerEmail = body.managerEmail || body.ManagerEmail || '';
    const isRH = Boolean(body.isRH || body.IsRH);
    const isCom = Boolean(body.isCom);
    const isDRH = Boolean(body.isDRH);
    const isRHPrint = Boolean(body.isRHPrint);
    const isRoomManager = Boolean(body.isRoomManager);

    if (!targetEmail || !name) {
      return NextResponse.json(
        { error: 'Email et Nom requis.' },
        { status: 400 }
      );
    }

    const result = await saveOrUpdateUserRole({
      id,
      name,
      email: targetEmail,
      role,
      managerEmail,
      isRH,
      isCom,
      isDRH,
      isRHPrint,
      isRoomManager,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Échec de l\'enregistrement.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/roles
 * Supprime un utilisateur.
 * Protégé : uniquement accessible aux ADMIN.
 */
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const callerEmail = session?.user?.email;

    if (!callerEmail) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const perms = await getUserPermissionsByEmail(callerEmail);
    if (!perms.isAdmin) {
      return NextResponse.json({ error: 'Accès refusé. Rôle ADMIN requis.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetEmail = searchParams.get('email');

    if (!targetEmail) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const result = await deleteUserRole(targetEmail);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Échec de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
