// app/api/requests/suggestions/route.ts
import { NextResponse } from 'next/server';
import { suggestionService } from '@/lib/suggestions/service';

export async function GET() {
  try {
    const suggestions = await suggestionService.getAllSuggestions();
    return NextResponse.json(suggestions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const author = body.author || { 
      name: 'Têko Anthelme KPODAR', 
      email: 'teko@intranet.local' 
    };

    const newSuggestion = await suggestionService.createSuggestion({
      content: body.content,
      author,
    });

    return NextResponse.json(newSuggestion, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur lors de la création" }, { status: 400 });
  }
}