// app/(intranet)/mediatheque/[id]/consultation/page.tsx
import MediaConsultClient from '@/components/mediatheque/MediaConsultActions';

//  On importe la version dédiée aux Server Components
import { getMediaById } from '@/lib/services/media.server'; 
import { FileText } from 'lucide-react';

interface MediaConsultPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MediaConsultPage({
  params,
}: MediaConsultPageProps) {
  const { id } = await params;

  // L'appel reste exactement le même qu'avant !
  const media = await getMediaById(id);

  console.log("media=>",media)

  if (!media) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />

            <h1 className="text-xl font-semibold text-slate-800">
              Document introuvable
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Le document demandé n'existe pas ou n'est plus disponible.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className='w-full p-[60px]'>
    <MediaConsultClient
      mediaId={media.id}
      downloads={media.downloads}
      media={media}
    />
    </div>
  );
}