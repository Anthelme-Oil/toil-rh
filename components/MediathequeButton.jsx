
import React from 'react';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

export default function MediathequeButton() {
  return (
    <div className="fixed right-0 top-1/2 z-50 -translate-y-1/2">
      <div className="relative">

        {/* Halo animé */}
        <span
          className="
            absolute inset-0
            rounded-l-xl
            bg-[#2a9d8f]
            animate-ping
            opacity-40
          "
        />

        <Link
          href="/mediatheque"
          className="
            relative z-10
            flex items-center gap-2
            rounded-l-xl
            bg-[#0f4c5c]
            px-4 py-3
            text-sm font-semibold text-white
            shadow-lg
            transition-all duration-300
            hover:bg-[#0b3d4a]
            hover:pr-5
            hover:shadow-xl
            active:scale-95
            animate-[pulse_3s_ease-in-out_infinite]
          "
        >
          {/* Icône */}
          <span className="flex items-center justify-center">
            <FolderOpen
              size={19}
              strokeWidth={1.8}
              className="
                transition-transform
                duration-300
                group-hover:scale-110
              "
            />
          </span>

          {/* Texte */}
          <span className="whitespace-nowrap">
            Médiathèque
          </span>
        </Link>
      </div>
    </div>
  );
}
