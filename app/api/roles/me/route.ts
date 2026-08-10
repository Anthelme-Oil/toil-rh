import { NextResponse } from 'next/server';
import { getUserPermissionsByEmail } from '@/lib/roles';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'lino@gmail.com';

  try {
    const permissions = await getUserPermissionsByEmail(email);
    return NextResponse.json(permissions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
