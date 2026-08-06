import { NextResponse } from 'next/server';
import { creerDemandeConge, getDemandesCongesUtilisateur, getDemandesCongesAValider } from '@/lib/demandes';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      titre,
      typeConge,
      dateDebut,
      dateFin,
      nombreJours,
      motif,
      demandeurNom,
      demandeurEmail,
      demandeurLookupId,
      managerEmail,
      supHierarchiqueLookupId,
    } = body;

    if (!titre || !dateDebut || !dateFin || !demandeurEmail) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants (titre, dates, email).' },
        { status: 400 }
      );
    }

    const id = await creerDemandeConge({
      titre,
      typeConge: typeConge || 'conge_paye',
      dateDebut,
      dateFin,
      nombreJours: parseFloat(nombreJours) || 1,
      motif,
      demandeurNom: demandeurNom || demandeurEmail.split('@')[0],
      demandeurEmail,
      demandeurLookupId,
      managerEmail,
      supHierarchiqueLookupId,
    });

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const role = searchParams.get('role'); // 'n1' | 'rh'

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  try {
    if (role === 'n1' || role === 'rh') {
      const demandes = await getDemandesCongesAValider(email, role === 'n1' ? 'N1' : 'RH');
      return NextResponse.json({ demandes });
    }

    const demandes = await getDemandesCongesUtilisateur(email);
    return NextResponse.json({ demandes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
