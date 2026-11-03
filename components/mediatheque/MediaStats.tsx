
import { Download, Eye } from 'lucide-react';

interface MediaStatsProps {
  views: number;
  downloads: number;
}

export default function MediaStats({
  views,
  downloads,
}: MediaStatsProps) {
  return (
    <div className="flex items-center gap-4 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <Eye size={14} strokeWidth={1.8} />
        {views.toLocaleString('fr-FR')}
      </span>

      <span className="inline-flex items-center gap-1.5">
        <Download size={14} strokeWidth={1.8} />
        {downloads.toLocaleString('fr-FR')}
      </span>
    </div>
  );
}
