import { NextRequest, NextResponse } from 'next/server';

import {
  archiveMediaDocumentService,
  consultMediaDocument,
  deleteMediaDocumentService,
  downloadMediaDocument,
  getMediaDocument,
  updateMediaDocumentService,
} from '@/lib/mediatheque/service';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function parseId(value: string): number | null {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

/**
 * GET /api/mediatheque/[id]
 *
 * Actions disponibles :
 *
 * GET /api/mediatheque/1
 * GET /api/mediatheque/1?action=view
 * GET /api/mediatheque/1?action=download
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Identifiant du document invalide.',
        },
        { status: 400 }
      );
    }

    const action = request.nextUrl.searchParams.get('action');

    if (action === 'view') {
      const document = await consultMediaDocument(id);

      return NextResponse.json({
        success: true,
        document,
      });
    }

    if (action === 'download') {
      const result = await downloadMediaDocument(id);

      const finalR=result.document;

      return NextResponse.json({
        success: true,
        fileUrl: finalR.fileUrl,
        fileName: finalR.fileName,
      });
    }

    const document = await getMediaDocument(id);

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: 'Document introuvable.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error(
      '[GET /api/mediatheque/[id]]',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de récupérer le document.';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/mediatheque/[id]
 *
 * Mise à jour des informations du document.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Identifiant du document invalide.',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const document = await updateMediaDocumentService(
      id,
      body
    );

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: 'Document introuvable.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document mis à jour avec succès.',
      document,
    });
  } catch (error) {
    console.error(
      '[PUT /api/mediatheque/[id]]',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de mettre à jour le document.';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mediatheque/[id]
 *
 * Par défaut :
 * → archivage
 *
 * ?permanent=true
 * → suppression définitive
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Identifiant du document invalide.',
        },
        { status: 400 }
      );
    }

    const permanent =
      request.nextUrl.searchParams.get('permanent') ===
      'true';

    if (!permanent) {
      const document =
        await archiveMediaDocumentService(id);

      return NextResponse.json({
        success: true,
        message: 'Document archivé avec succès.',
        document,
      });
    }

    await deleteMediaDocumentService(id);

    return NextResponse.json({
      success: true,
      message: 'Document supprimé définitivement.',
    });
  } catch (error) {
    console.error(
      '[DELETE /api/mediatheque/[id]]',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de supprimer le document.';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}