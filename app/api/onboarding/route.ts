import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOnboardingModules, getUserOnboardingProgress } from '@/lib/onboarding';

export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const [modules, progress] = await Promise.all([
      getOnboardingModules(),
      getUserOnboardingProgress(email),
    ]);

    return NextResponse.json(
      { modules, progress },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
