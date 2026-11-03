import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const role = searchParams.get('role'); // EMPLOYE, MANAGER, RH, DRH, IT_MANAGER, IT_EXEC, ADMIN

  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });

  let filter: any = {};

  switch (role) {
    case 'ADMIN':
      filter = {};
      break;

    case 'DRH':
      filter = { OR: [{ emailDemandeur: email }, { statut: 'PENDING_DRH' }] };
      break;

    case 'RH_PRINT':
    case 'RH':
      filter = { OR: [{ emailDemandeur: email }, { statut: 'PENDING_RH_EXEC' }] };
      break;

    case 'IT_MANAGER':
      filter = { OR: [{ emailDemandeur: email }, { statut: 'PENDING_IT_MGR' }] };
      break;

    case 'IT_EXEC':
      filter = { OR: [{ emailDemandeur: email }, { statut: 'PENDING_IT_EXEC' }] };
      break;

    default: // N+1 Manager ou Employé standard
      filter = {
        OR: [
          { emailDemandeur: email },
          { emailManager: email, statut: 'PENDING_N1' },
        ],
      };
      break;
  }

  const demandes = await prisma.demande.findMany({
    where: filter,
    orderBy: { creeLe: 'desc' },
  });

  return NextResponse.json({ success: true, count: demandes.length, data: demandes });
}