import { NextResponse } from 'next/server';
import { getGraphClient } from '@/lib/graph';
import type { UserDirectoryItem } from '@/types';

// Annuaire de secours (Mock TOGO OIL) pour développement local ou si Graph est indisponible
const MOCK_ANNUAIRE: UserDirectoryItem[] = [
  {
    id: 'usr-1',
    displayName: 'Marc ALONSO',
    mail: 'marc.alonso@togooil.com',
    userPrincipalName: 'marc.alonso@togooil.com',
    jobTitle: 'Chef de Département IT',
    department: 'Informatique & SI',
  },
  {
    id: 'usr-2',
    displayName: 'Amina LAWSON',
    mail: 'amina.lawson@togooil.com',
    userPrincipalName: 'amina.lawson@togooil.com',
    jobTitle: 'Directrice Financière',
    department: 'Finance & Comptabilité',
  },
  {
    id: 'usr-3',
    displayName: 'Kofi MENSAH',
    mail: 'kofi.mensah@togooil.com',
    userPrincipalName: 'kofi.mensah@togooil.com',
    jobTitle: 'Responsable RH',
    department: 'Ressources Humaines',
  },
  {
    id: 'usr-4',
    displayName: 'Yao ADABRA',
    mail: 'yao.adabra@togooil.com',
    userPrincipalName: 'yao.adabra@togooil.com',
    jobTitle: 'Directeur des Opérations',
    department: 'Exploitation',
  },
  {
    id: 'usr-5',
    displayName: 'Elom KOUIGAN',
    mail: 'elom.kouigan@togooil.com',
    userPrincipalName: 'elom.kouigan@togooil.com',
    jobTitle: 'Responsable HSE',
    department: 'Sécurité & Environnement',
  },
  {
    id: 'usr-6',
    displayName: 'Essi TOGBE',
    mail: 'essi.togbe@togooil.com',
    userPrincipalName: 'essi.togbe@togooil.com',
    jobTitle: 'Chef de Projet SI',
    department: 'Informatique & SI',
  },
  {
    id: 'usr-7',
    displayName: 'Kodjo CYRILLE',
    mail: 'kodjo.cyrille@togooil.com',
    userPrincipalName: 'kodjo.cyrille@togooil.com',
    jobTitle: 'Directeur Général',
    department: 'Direction Générale',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const queryLower = q.toLowerCase();

  try {
    const graphClient = getGraphClient();
    if (graphClient) {
      try {
        // Recherche optimisée sur Microsoft Graph avec $filter startswith
        const res = await graphClient
          .api('/users')
          .filter(
            `startswith(displayName,'${q}') or startswith(mail,'${q}') or startswith(userPrincipalName,'${q}') or startswith(givenName,'${q}') or startswith(surname,'${q}')`
          )
          .select('id,displayName,mail,userPrincipalName,jobTitle,department')
          .top(7)
          .get();

        if (res && res.value && Array.isArray(res.value) && res.value.length > 0) {
          const users: UserDirectoryItem[] = res.value.map((u: any) => ({
            id: u.id,
            displayName: u.displayName || u.userPrincipalName || 'Utilisateur',
            mail: u.mail || u.userPrincipalName || '',
            userPrincipalName: u.userPrincipalName || '',
            jobTitle: u.jobTitle || undefined,
            department: u.department || undefined,
          }));

          return NextResponse.json({ users, source: 'graph' });
        }
      } catch (graphErr) {
        console.warn('[Annuaire API] Échec requête Graph, bascule sur l\'annuaire local:', graphErr);
      }
    }

    // Filtrage ultra-rapide sur l'annuaire de secours (Mock)
    const filteredMock = MOCK_ANNUAIRE.filter(
      (u) =>
        u.displayName.toLowerCase().includes(queryLower) ||
        u.mail.toLowerCase().includes(queryLower) ||
        (u.jobTitle && u.jobTitle.toLowerCase().includes(queryLower)) ||
        (u.department && u.department.toLowerCase().includes(queryLower))
    ).slice(0, 7);

    return NextResponse.json({ users: filteredMock, source: 'mock' });
  } catch (error) {
    console.error('[Annuaire API] Erreur recherche utilisateur:', error);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
