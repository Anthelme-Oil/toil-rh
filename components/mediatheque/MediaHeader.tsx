
import { Library, FileText } from 'lucide-react';

interface MediaHeaderProps {
  totalDocuments: number;
}

export default function MediaHeader({
  totalDocuments,
}: MediaHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0f4c5c]/10 text-[#0f4c5c]">
            <Library size={22} strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Médiathèque
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Retrouvez les documents et ressources internes
              nécessaires aux différents départements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileText size={16} />
          <span>
            {totalDocuments} document
            {totalDocuments > 1 ? 's' : ''}
          </span>
        </div>

      </div>
    </header>
  );
}
