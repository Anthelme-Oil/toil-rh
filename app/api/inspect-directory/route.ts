import { NextResponse } from 'next/server';

export async function GET() {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Variables d'environnement Azure AD manquantes (.env)" },
      { status: 500 }
    );
  }

  try {
    // 1. Obtention du Token Azure AD
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    });

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
      cache: 'no-store',
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.json(
        { error: "Échec d'authentification Azure AD", details: tokenData },
        { status: tokenRes.status }
      );
    }

    // 2. Requête Graph API optimisée ($top=50)
    const graphRes = await fetch(
      `https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation,mobilePhone&$expand=manager($select=id,displayName,mail,userPrincipalName)&$top=50`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const graphData = await graphRes.json();

    if (!graphRes.ok) {
      return NextResponse.json(
        { error: "Erreur Microsoft Graph", details: graphData },
        { status: graphRes.status }
      );
    }

    // 3. Normalisation des données
    const employees = (graphData.value || [])
      .filter((u: any) => u.mail || u.userPrincipalName)
      .map((u: any) => ({
        id: u.id,
        name: u.displayName,
        email: u.mail || u.userPrincipalName,
        jobTitle: u.jobTitle || 'Non renseigné',
        department: u.department || 'Général',
        phone: u.mobilePhone || null,
        office: u.officeLocation || null,
        manager: u.manager
          ? {
              id: u.manager.id,
              name: u.manager.displayName,
              email: u.manager.mail || u.manager.userPrincipalName,
            }
          : null,
      }));

    const body = JSON.stringify(
      {
        success: true,
        count: employees.length,
        data: employees,
      },
      null,
      2
    );

    return new NextResponse(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}