import { NextResponse } from 'next/server';
import { getGraphClient, getSiteApiBase, DRIVE_BLOG_IMAGES, DRIVE_PROCEDURES_IT } from '@/lib/graph';

/**
 * GET /api/admin/debug-images
 * Endpoint de diagnostic pour vérifier la configuration des bibliothèques d'images.
 * Lister les Drives disponibles sur le site SharePoint et tester l'upload.
 */
export async function GET() {
  const graphClient = getGraphClient();
  if (!graphClient) {
    return NextResponse.json({ error: 'Graph client non configuré (vérifiez .env.local)' }, { status: 503 });
  }
  const siteBase = getSiteApiBase();

  try {
    // 1. Lister tous les Drives du site
    const drivesResponse = await graphClient
      .api(`${siteBase}/drives`)
      .select('id,name,driveType,webUrl')
      .get();

    const drives = (drivesResponse.value || []).map((d: Record<string, string>) => ({
      id: d.id,
      name: d.name,
      type: d.driveType,
      url: d.webUrl,
      isCurrentBlogDrive: d.id === DRIVE_BLOG_IMAGES,
      isCurrentITDrive: d.id === DRIVE_PROCEDURES_IT,
    }));

    // 2. Tester l'accès au Drive configuré pour les images de blog
    let blogDriveStatus = 'non testé';
    let blogDriveContents: unknown[] = [];
    try {
      const blogDriveRoot = await graphClient
        .api(`${siteBase}/drives/${DRIVE_BLOG_IMAGES}/root/children`)
        .top(5)
        .select('id,name,webUrl,folder')
        .get();
      blogDriveStatus = 'accessible ✅';
      blogDriveContents = (blogDriveRoot.value || []).map((i: Record<string, string>) => ({
        name: i.name,
        url: i.webUrl,
        isFolder: !!i.folder,
      }));
    } catch (err) {
      blogDriveStatus = `erreur: ${err instanceof Error ? err.message : String(err)} ❌`;
    }

    return NextResponse.json({
      configuredDriveIds: {
        DRIVE_BLOG_IMAGES,
        DRIVE_PROCEDURES_IT,
      },
      siteBase,
      allSiteDrives: drives,
      blogDrive: {
        status: blogDriveStatus,
        contents: blogDriveContents,
      },
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
