// ═══════════════════════════════════════════════════════════════
// Logo T-OIL / COMPEL STSL — Image officielle
// ═══════════════════════════════════════════════════════════════

import Image from 'next/image';

interface LogoProps {
  className?: string;
  /** Taille du logo en pixels (hauteur). La largeur est calculée automatiquement. */
  size?: number;
  /** Afficher le texte COMPEL STSL à côté du logo */
  showText?: boolean;
}

export default function Logo({ className = '', size = 40, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/images/image.png"
        alt="Logo T-OIL"
        width={size}
        height={size}
        style={{ width: 'auto', height: 'auto' }}
        className="object-contain flex-shrink-0"
        priority
      />
      {/* {showText && (
        <div className="leading-tight hidden sm:block">
          <div className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">
            COMPEL STSL
          </div>
          <div className="text-sm font-extrabold tracking-wide text-primary uppercase">
            T-Oil
          </div>
        </div>
      )} */}
    </div>
  );
}
