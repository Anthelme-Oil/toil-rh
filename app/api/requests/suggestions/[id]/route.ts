// app/api/requests/suggestions/[id]/route.ts
import { NextResponse } from 'next/server';
import { suggestionService } from '@/lib/suggestions/service';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const suggestion = await suggestionService.getSuggestionById(id);
    
    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion non trouvée" }, { status: 404 });
    }
    
    return NextResponse.json(suggestion, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();

    const updated = await suggestionService.updateSuggestion(id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur lors de la mise à jour" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    await suggestionService.deleteSuggestion(id);
    return NextResponse.json({ success: true, message: "Suggestion supprimée avec succès" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur lors de la suppression" }, { status: 500 });
  }
}