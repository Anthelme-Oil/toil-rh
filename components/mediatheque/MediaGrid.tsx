
import type { MediaDocument } from '@/types';

import MediaCard from './MediaCard';

interface MediaGridProps {
  documents: MediaDocument[];
}

export default function MediaGrid({
  documents,
}: MediaGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {documents.map((document) => (
        <MediaCard
          key={document.id}
          document={document}
        />
      ))}
    </div>
  );
}
