
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';

import {
  archiveMediaDocumentService,
  consultMediaDocument,
  createMediaDocumentService,
  deleteMediaDocumentService,
  downloadMediaDocument,
  getMediaDocuments,
  updateMediaDocumentService,
} from '@/lib/mediatheque/service';

function parseId(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function parsePositiveInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(
    Math.max(Math.floor(parsed), min),
    max,
  );
}

function parseJsonArray(
  value: FormDataEntryValue | null,
): string[] {
  if (!value || typeof value !== 'string') {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is string =>
        typeof item === 'string',
    );
  } catch {
    return [];
  }
}

function getString(
  formData: FormData,
  key: string,
  fallback = '',
): string {
  const value = formData.get(key);

  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Une erreur est survenue.';
}

function getErrorStatus(error: unknown): number {
  if (!(error instanceof Error)) {
    return 500;
  }

  switch (error.message) {
    case 'DOCUMENT_NOT_FOUND':
    case 'FILE_NOT_FOUND':
      return 404;

    case 'FILE_REQUIRED':
    case 'TITLE_REQUIRED':
    case 'DEPARTMENT_REQUIRED':
      return 400;

    default:
      return 500;
  }
}

function getFrenchErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);

  switch (message) {
    case 'DOCUMENT_NOT_FOUND':
      return 'Document introuvable.';

    case 'FILE_NOT_FOUND':
      return 'Le fichier associé est introuvable.';

    case 'FILE_REQUIRED':
      return 'Le fichier est obligatoire.';

    case 'TITLE_REQUIRED':
      return 'Le titre est obligatoire.';

    case 'DEPARTMENT_REQUIRED':
      return 'Le département est obligatoire.';

    default:
      return message || 'Une erreur est survenue.';
  }
}

/**
 * GET /api/mediatheque
 *
 * Cas supportés :
 *
 * Liste :
 * /api/mediatheque
 * /api/mediatheque?page=1&limit=10
 *
 * Consultation :
 * /api/mediatheque?id=12
 *
 * Téléchargement :
 * /api/mediatheque?id=12&download=true
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const id = parseId(searchParams.get('id'));

    /*
     * ============================================================
     * TÉLÉCHARGEMENT
     * ============================================================
     */
    const isDownload =
      searchParams.get('download') === 'true';

    if (id && isDownload) {
      const result = await downloadMediaDocument(id);

      const buffer = await fs.readFile(
        result.filePath,
      );

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type':
            'application/octet-stream',

          'Content-Disposition':
            `attachment; filename="${encodeURIComponent(
              result.document.fileName,
            )}"`,

          'Content-Length': String(
            buffer.length,
          ),

          'Cache-Control':
            'private, no-store, max-age=0',
        },
      });
    }

    /*
     * ============================================================
     * CONSULTATION
     * ============================================================
     */
    if (id) {
      const document =
        await consultMediaDocument(id);

      return NextResponse.json({
        success: true,
        document,
      });
    }

    /*
     * ============================================================
     * LISTE
     * ============================================================
     */
    const page = parsePositiveInt(
      searchParams.get('page'),
      1,
      1,
      Number.MAX_SAFE_INTEGER,
    );

    const limit = parsePositiveInt(
      searchParams.get('limit'),
      10,
      1,
      100,
    );

    const search =
      searchParams.get('search') ||
      undefined;

    const department =
      searchParams.get('department') ||
      undefined;

    const category =
      searchParams.get('category') ||
      undefined;

    const format =
      searchParams.get('format') ||
      undefined;

    const status =
      searchParams.get('status') ||
      undefined;

    const visibility =
      searchParams.get('visibility') ||
      undefined;

    const tag =
      searchParams.get('tag') ||
      undefined;

    const dateFrom =
      searchParams.get('dateFrom') ||
      undefined;

    const dateTo =
      searchParams.get('dateTo') ||
      undefined;

    const sort =
      searchParams.get('sort') ||
      'LATEST';

    const result =
      await getMediaDocuments({
        page,
        limit,
        sort: sort as never,
        filters: {
          search,

          department:
            department &&
            department !== 'ALL'
              ? (department as never)
              : undefined,

          category:
            category &&
            category !== 'ALL'
              ? (category as never)
              : undefined,

          format:
            format &&
            format !== 'ALL'
              ? (format as never)
              : undefined,

          status:
            status &&
            status !== 'ALL'
              ? (status as never)
              : undefined,

          visibility:
            visibility &&
            visibility !== 'ALL'
              ? (visibility as never)
              : undefined,

          tag,

          dateFrom,

          dateTo,
        },
      });

    return NextResponse.json({
      success: true,
      documents: result.documents,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(
        result.total / limit,
      ),
    });
  } catch (error) {
    console.error(
      '[GET /api/mediatheque]',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          getFrenchErrorMessage(error),
      },
      {
        status: getErrorStatus(error),
      },
    );
  }
}

/**
 * POST /api/mediatheque
 *
 * Création d'un document.
 *
 * Body : multipart/form-data
 */
export async function POST(request: NextRequest) {
  try {
    const formData =
      await request.formData();

    /*
     * ------------------------------------------------------------
     * FICHIER
     * ------------------------------------------------------------
     */
    const fileValue =
      formData.get('file');

    if (
      !fileValue ||
      !(fileValue instanceof File) ||
      fileValue.size === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Le fichier est obligatoire.',
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * DONNÉES
     * ------------------------------------------------------------
     */
    const title = getString(
      formData,
      'title',
    );

    const description = getString(
      formData,
      'description',
    );

    const objective = getString(
      formData,
      'objective',
    );

    const department = getString(
      formData,
      'department',
    );

    const category = getString(
      formData,
      'category',
    );

    const version = getString(
      formData,
      'version',
      '1.0',
    );

    const status = getString(
      formData,
      'status',
      'DRAFT',
    );

    const visibility = getString(
      formData,
      'visibility',
      'PUBLIC',
    );

    const authorId = getString(
      formData,
      'authorId',
    );

    const authorName = getString(
      formData,
      'authorName',
    );

    const authorEmail = getString(
      formData,
      'authorEmail',
    );

    const publishedById = getString(
      formData,
      'publishedById',
    );

    const publishedByName = getString(
      formData,
      'publishedByName',
    );

    const publishedByEmail = getString(
      formData,
      'publishedByEmail',
    );

    const tags = parseJsonArray(
      formData.get('tags'),
    );

    /*
     * ------------------------------------------------------------
     * VALIDATIONS
     * ------------------------------------------------------------
     */
    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Le titre est obligatoire.',
        },
        {
          status: 400,
        },
      );
    }

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Le département est obligatoire.',
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * SERVICE MÉTIER
     * ------------------------------------------------------------
     */
    const document =
      await createMediaDocumentService({
        file: fileValue,
        title,
        description,
        objective,
        department,
        category,
        version,
        status,
        visibility,
        authorId,
        authorName,
        authorEmail,
        publishedById,
        publishedByName,
        publishedByEmail,
        tags,
      });

    return NextResponse.json(
      {
        success: true,
        message:
          'Document créé avec succès.',
        document,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      '[POST /api/mediatheque]',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          getFrenchErrorMessage(error) ||
          'Impossible de créer le document.',
      },
      {
        status: getErrorStatus(error),
      },
    );
  }
}

/**
 * PUT /api/mediatheque
 *
 * Modification d'un document.
 *
 * Body : multipart/form-data
 *
 * Le champ "id" est obligatoire.
 */
export async function PUT(request: NextRequest) {
  try {
    const formData =
      await request.formData();

    /*
     * ------------------------------------------------------------
     * ID
     * ------------------------------------------------------------
     */
    const id = parseId(
      String(
        formData.get('id') ?? '',
      ),
    );

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Identifiant du document invalide.',
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ------------------------------------------------------------
     * FICHIER OPTIONNEL
     * ------------------------------------------------------------
     */
    const fileValue =
      formData.get('file');

    const file =
      fileValue instanceof File &&
      fileValue.size > 0
        ? fileValue
        : null;

    /*
     * ------------------------------------------------------------
     * DONNÉES
     * ------------------------------------------------------------
     */
    const title = getString(
      formData,
      'title',
    );

    const description = getString(
      formData,
      'description',
    );

    const objective = getString(
      formData,
      'objective',
    );

    const department = getString(
      formData,
      'department',
    );

    const category = getString(
      formData,
      'category',
    );

    const version = getString(
      formData,
      'version',
    );

    const status = getString(
      formData,
      'status',
    );

    const visibility = getString(
      formData,
      'visibility',
    );

    const publishedById = getString(
      formData,
      'publishedById',
    );

    const publishedByName = getString(
      formData,
      'publishedByName',
    );

    const publishedByEmail = getString(
      formData,
      'publishedByEmail',
    );

    const tags = parseJsonArray(
      formData.get('tags'),
    );

    /*
     * ------------------------------------------------------------
     * SERVICE MÉTIER
     * ------------------------------------------------------------
     */
    const document =
      await updateMediaDocumentService(
        id,
        {
          file,

          title,

          description,

          objective,

          department,

          category,

          version,

          status,

          visibility,

          publishedById,

          publishedByName,

          publishedByEmail,

          tags,
        },
      );

    return NextResponse.json({
      success: true,
      message:
        'Document mis à jour avec succès.',
      document,
    });
  } catch (error) {
    console.error(
      '[PUT /api/mediatheque]',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          getFrenchErrorMessage(error) ||
          'Impossible de mettre à jour le document.',
      },
      {
        status: getErrorStatus(error),
      },
    );
  }
}

/**
 * DELETE /api/mediatheque
 *
 * Suppression définitive :
 * /api/mediatheque?id=12
 *
 * Archivage :
 * /api/mediatheque?id=12&archive=true
 */
export async function DELETE(
  request: NextRequest,
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const id = parseId(
      searchParams.get('id'),
    );

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Identifiant invalide.',
        },
        {
          status: 400,
        },
      );
    }

    const archive =
      searchParams.get('archive') ===
      'true';

    /*
     * ------------------------------------------------------------
     * ARCHIVAGE
     * ------------------------------------------------------------
     */
    if (archive) {
      const document =
        await archiveMediaDocumentService(
          id,
        );

      return NextResponse.json({
        success: true,
        message:
          'Document archivé avec succès.',
        document,
      });
    }

    /*
     * ------------------------------------------------------------
     * SUPPRESSION DÉFINITIVE
     * ------------------------------------------------------------
     */
    await deleteMediaDocumentService(
      id,
    );

    return NextResponse.json({
      success: true,
      message:
        'Document supprimé définitivement.',
    });
  } catch (error) {
    console.error(
      '[DELETE /api/mediatheque]',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          getFrenchErrorMessage(error) ||
          'Impossible de supprimer le document.',
      },
      {
        status: getErrorStatus(error),
      },
    );
  }
}
