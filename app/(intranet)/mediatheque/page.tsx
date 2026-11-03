
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getMediaList,
} from '@/lib/services/media.service';

import type {
  MediaDocument,
  MediaDocumentSort,
} from '@/types';
import MediaLibrary from '@/components/mediatheque/MediaLibrary';

interface MediaLibraryProps {
  pageSize?: number;
}


export default function MediaPage({
  pageSize = 9,
}: MediaLibraryProps) {
  const [documents, setDocuments] = useState<
    MediaDocument[]
  >([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sort, setSort] =
    useState<MediaDocumentSort>('LATEST');

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getMediaList({
        page,
        limit: pageSize,
        sort,
        filters: {
          status: 'PUBLISHED',
          visibility: 'ALL',
          department: 'ALL',
          category: 'ALL',
          format: 'ALL',
        },
      });

      setDocuments(result.documents);
      setTotalPages(result.totalPages);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les documents.',
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  if (loading) {
    return (
      <div className="w-full flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0f766e]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  // return (
  //   <div className="space-y-6">
  //     {/* Ton header / filtres existants */}

  //     {documents.length === 0 ? (
  //       <div className='flex items-center justify-center w-full'>
  //       <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
  //         <p className="text-sm text-slate-500">
  //           Aucun document disponible.
  //         </p>
  //       </div>
  //       </div>
  //     ) : (
  //       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  //         {documents.map((document) => (
  //           <div key={document.id}>
  //             {/* Ton MediaCard existant */}
  //             {/* Consultation → /mediatheque/[id] */}
  //           </div>
  //         ))}
  //       </div>
  //     )}

  //     {totalPages > 1 && (
  //       <div className="flex justify-center gap-2">
  //         <button
  //           type="button"
  //           disabled={page <= 1}
  //           onClick={() =>
  //             setPage((current) => current - 1)
  //           }
  //           className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
  //         >
  //           Précédent
  //         </button>

  //         <span className="px-3 py-2 text-sm text-slate-500">
  //           {page} / {totalPages}
  //         </span>

  //         <button
  //           type="button"
  //           disabled={page >= totalPages}
  //           onClick={() =>
  //             setPage((current) => current + 1)
  //           }
  //           className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
  //         >
  //           Suivant
  //         </button>
  //       </div>
  //     )}
  //   </div>
  // );

return (
  <div className='w-full p-16'>
  <MediaLibrary 
  documents={documents}
  pageSize={9}
  />
  </div>
)
}
