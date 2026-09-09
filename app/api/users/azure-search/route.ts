import { NextResponse } from 'next/server';
import { getGraphClient } from '@/lib/graph';
import type { UserDirectoryItem } from '@/types';

/**
 * GET /api/users/azure-search
 * Route dédiée UNIQUEMENT à la recherche d'utilisateurs dans Azure AD (Entra ID).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  // Évite de charger le réseau pour les requêtes trop courtes
  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  try {
    const graphClient = getGraphClient();

    if (!graphClient) {
      return NextResponse.json(
        { error: 'Client Azure AD non initialisé sur le serveur.' },
        { status: 500 }
      );
    }

    // Requête Microsoft Graph OData v1.0
    // ConsistencyLevel: eventual est obligatoire pour utiliser $search
    const res = await graphClient
      .api('/users')
      .header('ConsistencyLevel', 'eventual')
      .search(`"displayName:${q}" OR "mail:${q}" OR "userPrincipalName:${q}"`)
      .select('id,displayName,mail,userPrincipalName,jobTitle,department')
      .top(10)
      .get();

    const users: UserDirectoryItem[] = (res?.value || [])
      .map((u: any) => ({
        id: u.id,
        displayName: u.displayName || u.userPrincipalName || 'Utilisateur',
        mail: u.mail || u.userPrincipalName || '',
        userPrincipalName: u.userPrincipalName || '',
        jobTitle: u.jobTitle || undefined,
        department: u.department || undefined,
      }))
      .filter((u: UserDirectoryItem) => u.mail);

    return NextResponse.json({ users, source: 'azure-ad' });
  } catch (error: any) {
    console.error('[Azure AD Search API] Erreur Graph:', error);

    return NextResponse.json(
      {
        error: 'Échec de la recherche dans Azure Active Directory',
        details: error?.message || error,
      },
      { status: 500 }
    );
  }
}