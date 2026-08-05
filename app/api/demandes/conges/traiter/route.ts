import { NextResponse } from 'next/server';
import { traiterDemandeConge } from '@/lib/demandes';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action, role, motifRefus } = body;

    if (!id || !action || !role) {
      return NextResponse.json(
        { error: 'Paramètres manquants (id, action, role).' },
        { status: 400 }
      );
    }

    const success = await traiterDemandeConge(id, action, role, motifRefus);
    if (!success) {
      return NextResponse.json({ error: 'Échec du traitement de la demande' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
