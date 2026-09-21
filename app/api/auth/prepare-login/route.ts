import { NextResponse } from 'next/server';
import { setPendingLoginEmail } from '@/lib/auth/login-intent';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || '')
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    await setPendingLoginEmail(email);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[prepare-login]', error);

    return NextResponse.json(
      { error: 'Erreur préparation connexion' },
      { status: 500 }
    );
  }
}