import { NextResponse } from 'next/server';
import { actualitesService } from '@/lib/actualites/service';

export async function GET() {
  try {
    const actualites = await actualitesService.getAllActualites();
    return NextResponse.json(actualites, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des actualités' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nouvelleActualite = await actualitesService.createActualite(body);
    return NextResponse.json(nouvelleActualite, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'actualité' },
      { status: 400 }
    );
  }
}