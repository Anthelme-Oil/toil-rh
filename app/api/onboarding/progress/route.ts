import { NextResponse } from 'next/server';
import { toggleModuleCompletion } from '@/lib/onboarding';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, moduleId } = body;

    if (!userEmail || !moduleId) {
      return NextResponse.json(
        { error: 'Email utilisateur et ID de module requis.' },
        { status: 400 }
      );
    }

    const updatedProgress = await toggleModuleCompletion(userEmail, moduleId);
    return NextResponse.json({ success: true, progress: updatedProgress });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
