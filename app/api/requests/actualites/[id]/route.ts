import { NextResponse } from 'next/server';
import { actualitesService } from '@/lib/actualites/service';

interface Context {
  params: Promise<{ id: string }>;
}

// GET /api/requests/actualites/[id] - Récupérer une actualité spécifique
export async function GET(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const actualite = await actualitesService.getActualiteById(id);

    if (!actualite) {
      return NextResponse.json(
        { error: 'Actualité non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(actualite, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/requests/actualites/[id] - Mettre à jour une actualité
export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updatedActualite = await actualitesService.updateActualite(id, body);

    return NextResponse.json(updatedActualite, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour' },
      { status: 400 }
    );
  }
}

// DELETE /api/requests/actualites/[id] - Supprimer une actualité
export async function DELETE(request: Request, context: Context) {
  try {
    const { id } = await context.params;

    const deletedActualite = await actualitesService.deleteActualite(id);

    return NextResponse.json(
      { message: 'Actualité supprimée avec succès', data: deletedActualite },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 400 }
    );
  }
}