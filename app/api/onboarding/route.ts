import { NextResponse } from 'next/server';
import { getOnboardingModules, getUserOnboardingProgress } from '@/lib/onboarding';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'lino@gmail.com';

  try {
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
