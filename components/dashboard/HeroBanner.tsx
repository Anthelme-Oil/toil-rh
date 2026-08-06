'use client';

// ═══════════════════════════════════════════════════════════════
// HeroBanner — Bannière d'accueil avec Banniere_5.png (dimensions compactes)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function HeroBanner() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculs dynamiques basés sur le scroll (entre 0px et 200px)
  const maxScroll = 200;
  const progress = Math.min(scrollY / maxScroll, 1);

  const opacity = 1 - progress * 0.75;
  const blurValue = progress * 10;
  const translateY = scrollY * 0.4;
  const scale = 1 - progress * 0.04;

  return (
    <section
      className="sticky top-20 z-0 w-full overflow-hidden transition-all duration-75 ease-out"
      id="hero-banner"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div
          className="relative w-full aspect-[3/1] sm:aspect-[3.5/1] md:aspect-[4/1] max-h-72 overflow-hidden rounded-2xl shadow-md transition-transform duration-75 ease-out bg-surface-alt"
          style={{
            opacity: opacity,
            filter: `blur(${blurValue}px)`,
            transform: `translateY(${translateY}px) scale(${scale})`,
            willChange: 'transform, opacity, filter',
          }}
        >
          <Image
            src="/images/banner2.png"
            alt="Bannière d'accueil T-OIL"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>
    </section>
  );
}
