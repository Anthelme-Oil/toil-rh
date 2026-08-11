import { NextResponse } from 'next/server';
import { getGraphClient } from '@/lib/graph';
import { query } from '@/lib/db';
import type { UserDirectoryItem } from '@/types';

/**
 * GET /api/users/search
 * Recherche d'utilisateurs dans l'annuaire.
 * Priorité : Microsoft Graph (Entra ID) → Table MySQL `utilisateurs` en fallback.
 * Plus de mock annuaire avec des personnes fictives.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const queryLower = q.toLowerCase();

  try {
    // 1. Recherche via Microsoft Graph (Entra ID)
    const graphClient = getGraphClient();
    if (graphClient) {
      try {
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
        console.warn('[Annuaire API] Échec requête Graph, bascule sur la base MySQL:', graphErr);
      }
    }

    // 2. Fallback : recherche dans la table MySQL `utilisateurs`
    const searchPattern = `%${queryLower}%`;
    const dbUsers = await query<any>(
      `SELECT id, nom, email, role, departement, poste 
       FROM utilisateurs 
       WHERE LOWER(nom) LIKE ? OR LOWER(email) LIKE ? OR LOWER(departement) LIKE ? OR LOWER(poste) LIKE ?
       ORDER BY nom ASC 
       LIMIT 7`,
      [searchPattern, searchPattern, searchPattern, searchPattern]
    );

    const users: UserDirectoryItem[] = dbUsers.map((u: any) => ({
      id: u.id,
      displayName: u.nom || u.email,
      mail: u.email,
      userPrincipalName: u.email,
      jobTitle: u.poste || undefined,
      department: u.departement || undefined,
    }));

    return NextResponse.json({ users, source: 'database' });
  } catch (error) {
    console.error('[Annuaire API] Erreur recherche utilisateur:', error);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
