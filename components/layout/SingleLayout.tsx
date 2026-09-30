import React from 'react';
import Header from './Header';
import { Footer } from '../common/Footer';
import MediaThequeButton from '../MediathequeButton';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function SingleLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#f7fafc]">
      {/* =====================================================
          GLOBAL BACKGROUND
          Toujours présent derrière toute l'application
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            {/* Grille technique */}
            <pattern
              id="oil-grid"
              width="45"
              height="45"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M45 0H0V45"
                stroke="#079bc2"
                strokeWidth="0.8"
                opacity="0.045"
              />
            </pattern>

            {/* Dégradé très léger */}
            <radialGradient id="oil-glow">
              <stop
                offset="0%"
                stopColor="#079bc2"
                stopOpacity="0.06"
              />
              <stop
                offset="100%"
                stopColor="#079bc2"
                stopOpacity="0"
              />
            </radialGradient>
          </defs>

          {/* Grille globale */}
          <rect
            width="1600"
            height="1000"
            fill="url(#oil-grid)"
          />

          {/* Halo technique haut droit */}
          <circle
            cx="1370"
            cy="120"
            r="420"
            fill="url(#oil-glow)"
          />

          {/* =================================================
              PIPELINE PRINCIPAL
          ================================================== */}
          <path
            d="
              M1600 180
              H1370
              C1325 180 1300 210 1300 255
              V370
              C1300 415 1270 445 1225 445
              H1080
              C1035 445 1005 475 1005 520
              V650
            "
            stroke="#079bc2"
            strokeWidth="2"
            opacity="0.07"
          />

          {/* Pipeline secondaire */}
          <path
            d="
              M1600 235
              H1415
              C1370 235 1350 265 1350 305
              V400
              C1350 445 1320 475 1275 475
              H1150
            "
            stroke="#5670b9"
            strokeWidth="1.5"
            opacity="0.055"
          />

          {/* =================================================
              NŒUDS INDUSTRIELS
          ================================================== */}
          <circle
            cx="1300"
            cy="255"
            r="7"
            fill="#079bc2"
            opacity="0.08"
          />

          <circle
            cx="1300"
            cy="370"
            r="7"
            fill="#079bc2"
            opacity="0.08"
          />

          <circle
            cx="1005"
            cy="520"
            r="7"
            fill="#5670b9"
            opacity="0.07"
          />

          {/* =================================================
              GRAND CERCLE TECHNIQUE
          ================================================== */}
          <circle
            cx="250"
            cy="850"
            r="260"
            stroke="#5670b9"
            strokeWidth="1"
            opacity="0.045"
          />

          <circle
            cx="250"
            cy="850"
            r="190"
            stroke="#079bc2"
            strokeWidth="1"
            opacity="0.04"
          />

          <circle
            cx="250"
            cy="850"
            r="120"
            stroke="#079bc2"
            strokeWidth="1"
            opacity="0.035"
          />

          {/* =================================================
              FLUX
          ================================================== */}
          <path
            d="
              M0 760
              C120 690 190 850 310 770
              C430 690 510 810 620 740
              C720 675 800 740 900 690
            "
            stroke="#079bc2"
            strokeWidth="1.5"
            opacity="0.045"
          />

          <path
            d="
              M0 800
              C130 730 200 890 325 810
              C445 730 520 850 635 780
            "
            stroke="#5670b9"
            strokeWidth="1"
            opacity="0.04"
          />

          {/* =================================================
              PETITES PARTICULES TECHNIQUES
          ================================================== */}
          <circle cx="110" cy="180" r="3" fill="#079bc2" opacity="0.07" />
          <circle cx="145" cy="215" r="2" fill="#079bc2" opacity="0.06" />
          <circle cx="180" cy="160" r="3" fill="#5670b9" opacity="0.06" />

          <circle cx="1450" cy="680" r="3" fill="#079bc2" opacity="0.06" />
          <circle cx="1490" cy="720" r="2" fill="#5670b9" opacity="0.06" />
          <circle cx="1530" cy="660" r="3" fill="#079bc2" opacity="0.05" />
        </svg>
      </div>

      {/* =====================================================
          APPLICATION
      ====================================================== */}
      <div className="w-full relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="relative flex w-full flex-1 max-w-full mt-[60px]">
          {children}
          <MediaThequeButton />
        </main>

        <Footer />
      </div>
    </div>
  );
}