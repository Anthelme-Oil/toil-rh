import { NextResponse } from 'next/server';
import { getAllUserRoles, saveOrUpdateUserRole, seedDefaultRolesToDatabase, deleteUserRole } from '@/lib/roles';

export async function GET() {
  try {
    const roles = await getAllUserRoles();
    return NextResponse.json({ roles });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
    const email = (body.email || body.Email || body.EMail || '').trim();
    const role = body.role || 'EMPLOYE';
    const managerEmail = body.managerEmail || body.ManagerEmail || '';
    const isRH = Boolean(body.isRH || body.IsRH);

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email et Nom requis.' },
        { status: 400 }
      );
    }

    const result = await saveOrUpdateUserRole({
      id,
      name,
      email,
      role,
      managerEmail,
      isRH,
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const result = await deleteUserRole(email);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Échec de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
