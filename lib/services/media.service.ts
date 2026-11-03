import type {
  DocumentCategory,
  DocumentDepartment,
  DocumentFormat,
  DocumentStatus,
  DocumentVisibility,
  MediaDocument,
  MediaDocumentFilters,
  MediaDocumentQuery,
  MediaDocumentSort,
  MediaDocumentsResponse,
} from '@/types';

const API_URL = '/api/requests/mediatheque';
import { getBaseUrl } from '@/utils/utils';
const BASE_URL= `${getBaseUrl()}/${API_URL}`;

interface MediaApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  document?: T;
  documents?: MediaDocument[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  fileUrl?: string;
  fileName?: string;
}

export interface CreateMediaPayload {
  title: string;
  description?: string;
  objective?: string;

  department: DocumentDepartment;
  category?: DocumentCategory;
  format: DocumentFormat;
  extension: string;

  file: File;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;

  version?: string;
  tags?: string[];

  author?: {
    id?: string;
    name: string;
    email?: string;
  };

  visibility?: DocumentVisibility;
  status?: DocumentStatus;
  isPublished?: boolean;
}

export type UpdateMediaPayload = Partial<CreateMediaPayload>;

export interface MediaPublisher {
  id?: string;
  name: string;
  email?: string;
}

export interface MediaDownloadResult {
  fileUrl: string;
  fileName: string;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function parseResponse<T>(
  response: Response
): Promise<T> {
  let data: MediaApiResponse<T>;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Erreur HTTP ${response.status}: réponse invalide du serveur.`
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        `Erreur HTTP ${response.status}.`
    );
  }

  return data as T;
}

function buildQueryParams(
  query: MediaDocumentQuery = {}
): string {
  const params = new URLSearchParams();

  const page = query.page ?? 1;
  const limit = query.limit ?? 12;

  params.set('page', String(page));
  params.set('limit', String(limit));

  if (query.sort) {
    params.set('sort', query.sort);
  }

  const filters = query.filters;

  if (!filters) {
    return params.toString();
  }

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (
    filters.department &&
    filters.department !== 'ALL'
  ) {
    params.set('department', filters.department);
  }

  if (
    filters.category &&
    filters.category !== 'ALL'
  ) {
    params.set('category', filters.category);
  }

  if (
    filters.format &&
    filters.format !== 'ALL'
  ) {
    params.set('format', filters.format);
  }

  if (
    filters.status &&
    filters.status !== 'ALL'
  ) {
    params.set('status', filters.status);
  }

  if (
    filters.visibility &&
    filters.visibility !== 'ALL'
  ) {
    params.set('visibility', filters.visibility);
  }

  if (filters.tag) {
    params.set('tag', filters.tag);
  }

  if (filters.dateFrom) {
    params.set(
      'dateFrom',
      new Date(filters.dateFrom).toISOString()
    );
  }

  if (filters.dateTo) {
    params.set(
      'dateTo',
      new Date(filters.dateTo).toISOString()
    );
  }

  return params.toString();
}

/* -------------------------------------------------------------------------- */
/* Liste                                                                       */
/* -------------------------------------------------------------------------- */

export async function getMediaList(
  query: MediaDocumentQuery = {}
): Promise<MediaDocumentsResponse> {
  const queryString = buildQueryParams(query);

  const response = await fetch(
    `${API_URL}?${queryString}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  );

  const data =
    await parseResponse<
      MediaApiResponse<MediaDocument>
    >(response);

  return {
    documents: data.documents ?? [],
    total: data.total ?? 0,
    page: data.page ?? query.page ?? 1,
    limit: data.limit ?? query.limit ?? 12,
    totalPages: data.totalPages ?? 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Document par ID                                                            */
/* -------------------------------------------------------------------------- */

export async function getMediaById(
  id: string | number
): Promise<MediaDocument> {
  const response = await fetch(
    `${BASE_URL}/${id}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  );

  const data =
    await parseResponse<
      MediaApiResponse<MediaDocument>
    >(response);

  if (!data.document) {
    throw new Error(
      'Le document demandé est introuvable.'
    );
  }

  return data.document;
}

/* -------------------------------------------------------------------------- */
/* Consultation                                                               */
/* -------------------------------------------------------------------------- */

export async function registerMediaView(
  id: string | number
): Promise<MediaDocument> {
  const response = await fetch(
    `${API_URL}/${id}?action=view`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  );

  const data =
    await parseResponse<
      MediaApiResponse<MediaDocument>
    >(response);

  if (!data.document) {
    throw new Error(
      `Impossible d'enregistrer la consultation.`
    );
  }

  return data.document;
}

/* -------------------------------------------------------------------------- */
/* Téléchargement                                                             */
/* -------------------------------------------------------------------------- */

export async function downloadMedia(
  id: string | number
): Promise<MediaDownloadResult> {
  const response = await fetch(
    `${API_URL}/${id}?action=download`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  );

  const data =
    await parseResponse<
      MediaApiResponse<MediaDocument>
    >(response);

  if (!data.fileUrl || !data.fileName) {
    throw new Error(
      'Le fichier à télécharger est introuvable.'
    );
  }

  return {
    fileUrl: data.fileUrl,
    fileName: data.fileName,
  };
}

/* -------------------------------------------------------------------------- */
/* Création                                                                   */
/* -------------------------------------------------------------------------- */



export async function createMedia(
  payload: CreateMediaPayload,
): Promise<MediaDocument> {
  const formData = new FormData();

  // ------------------------------------------------------------
  // FICHIER
  // ------------------------------------------------------------

  formData.append('file', payload.file);

  // ------------------------------------------------------------
  // DONNÉES
  // ------------------------------------------------------------

  formData.append('title', payload.title);

  if (payload.description) {
    formData.append(
      'description',
      payload.description,
    );
  }

  if (payload.objective) {
    formData.append(
      'objective',
      payload.objective,
    );
  }

  formData.append(
    'department',
    payload.department,
  );

  if (payload.category) {
    formData.append(
      'category',
      payload.category,
    );
  }

  formData.append(
    'format',
    payload.format,
  );

  formData.append(
    'extension',
    payload.extension,
  );

  formData.append(
    'fileName',
    payload.fileName,
  );

  if (payload.fileUrl) {
    formData.append(
      'fileUrl',
      payload.fileUrl,
    );
  }

  if (payload.fileSize !== undefined) {
    formData.append(
      'fileSize',
      String(payload.fileSize),
    );
  }

  if (payload.version) {
    formData.append(
      'version',
      payload.version,
    );
  }

  formData.append(
    'tags',
    JSON.stringify(payload.tags ?? []),
  );

  formData.append(
    'visibility',
    payload.visibility ?? 'PUBLIC',
  );

  formData.append(
    'status',
    payload.status ?? 'DRAFT',
  );

  formData.append(
    'isPublished',
    String(
      payload.isPublished ?? false,
    ),
  );

  // ------------------------------------------------------------
  // AUTEUR
  // ------------------------------------------------------------

  if (payload.author) {
    if (payload.author.id) {
      formData.append(
        'authorId',
        payload.author.id,
      );
    }

    formData.append(
      'authorName',
      payload.author.name,
    );

    if (payload.author.email) {
      formData.append(
        'authorEmail',
        payload.author.email,
      );
    }
  }

  // ------------------------------------------------------------
  // REQUEST
  // ------------------------------------------------------------

  const response = await fetch(API_URL, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data =
    await parseResponse<
      MediaApiResponse<MediaDocument>
    >(response);

  if (!data.document) {
    throw new Error(
      "Le document n'a pas pu être créé.",
    );
  }

  return data.document;
}



/* -------------------------------------------------------------------------- */
/* Mise à jour                                                                */
/* -------------------------------------------------------------------------- */

export async function updateMedia(
  id: string | number,
  payload: UpdateMediaPayload
): Promise<MediaDocument> {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const data =
    await parseResponse<
      MediaApiResponse<MediaDocument>
    >(response);

  if (!data.document) {
    throw new Error(
      'Le document n\'a pas pu être mis à jour.'
    );
  }

  return data.document;
}

/* -------------------------------------------------------------------------- */
/* Publication                                                                */
/* -------------------------------------------------------------------------- */

export async function publishMedia(
  id: string | number,
  publisher: MediaPublisher
): Promise<MediaDocument> {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'publish',
        status:"PUBLISHED",
        publisher,
      }),
    }
  );

  const data =
    await parseResponse<
      MediaApiResponse<MediaDocument>
    >(response);

  if (!data.document) {
    throw new Error(
      'Le document n\'a pas pu être publié.'
    );
  }

  return data.document;
}

/* -------------------------------------------------------------------------- */
/* Archivage                                                                  */
/* -------------------------------------------------------------------------- */

export async function archiveMedia(
  id: string | number
): Promise<MediaDocument> {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'archive',
      }),
    }
  );

  const data =
    await parseResponse<
      MediaApiResponse<MediaDocument>
    >(response);

  if (!data.document) {
    throw new Error(
      'Le document n\'a pas pu être archivé.'
    );
  }

  return data.document;
}

/* -------------------------------------------------------------------------- */
/* Restauration                                                               */
/* -------------------------------------------------------------------------- */

export async function restoreMedia(
  id: string | number
): Promise<MediaDocument> {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'restore',
      }),
    }
  );

  const data =
    await parseResponse<
      MediaApiResponse<MediaDocument>
    >(response);

  if (!data.document) {
    throw new Error(
      'Le document n\'a pas pu être restauré.'
    );
  }

  return data.document;
}

/* -------------------------------------------------------------------------- */
/* Suppression                                                                */
/* -------------------------------------------------------------------------- */

export async function deleteMedia(
  id: string | number,
  permanent = false
): Promise<void> {
  const response = await fetch(
    `${API_URL}/${id}?permanent=${permanent}`,
    {
      method: 'DELETE',
      credentials: 'include',
      cache: 'no-store',
    }
  );

  await parseResponse(response);
}

/* -------------------------------------------------------------------------- */
/* Raccourcis de recherche                                                    */
/* -------------------------------------------------------------------------- */

export async function searchMedia(
  search: string,
  options: Omit<MediaDocumentQuery, 'filters'> = {}
): Promise<MediaDocumentsResponse> {
  return getMediaList({
    ...options,
    filters: {
      search,
    },
  });
}

export async function getMediaByDepartment(
  department: DocumentDepartment,
  options: Omit<MediaDocumentQuery, 'filters'> = {}
): Promise<MediaDocumentsResponse> {
  return getMediaList({
    ...options,
    filters: {
      department,
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Helpers métier côté frontend                                               */
/* -------------------------------------------------------------------------- */

export async function getPublishedMedia(
  options: Omit<MediaDocumentQuery, 'filters'> = {}
): Promise<MediaDocumentsResponse> {
  return getMediaList({
    ...options,
    filters: {
      status: 'PUBLISHED',
    },
  });
}

export async function getLatestMedia(
  limit = 12
): Promise<MediaDocumentsResponse> {
  return getMediaList({
    page: 1,
    limit,
    sort: 'LATEST',
    filters: {
      status: 'PUBLISHED',
    },
  });
}

export async function getMostViewedMedia(
  limit = 12
): Promise<MediaDocumentsResponse> {
  return getMediaList({
    page: 1,
    limit,
    sort: 'MOST_VIEWED',
    filters: {
      status: 'PUBLISHED',
    },
  });
}

export async function getMostDownloadedMedia(
  limit = 12
): Promise<MediaDocumentsResponse> {
  return getMediaList({
    page: 1,
    limit,
    sort: 'MOST_DOWNLOADED',
    filters: {
      status: 'PUBLISHED',
    },
  });
}

export async function consultMedia(
  id: string | number
): Promise<MediaDocument> {
  const response = await fetch(
    `${API_URL}/${id}?action=view`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        'Impossible de consulter le document.'
    );
  }

  return data.document;
}

