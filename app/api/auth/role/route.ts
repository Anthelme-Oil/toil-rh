import { NextResponse } from 'next/server';
import { getUserPermissions } from '@/lib/roles';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { role: 'EMPLOYE', isRH: false, isManager: false, isAdmin: false },
      { status: 200 }
    );
  }

  try {
    const permissions = await getUserPermissions(email);
    return NextResponse.json(permissions);
  } catch (error: unknown) {
    return NextResponse.json(
      { role: 'EMPLOYE', isRH: false, isManager: false, isAdmin: false },
      { status: 200 }
    );
  }
}
