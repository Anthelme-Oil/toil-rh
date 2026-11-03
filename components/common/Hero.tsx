'use client'

import { useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  Menu,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

const navItems = ['Accueil', 'Le groupe', 'Actualités', 'Ressources']

function PulseVisual() {
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <div className="relative aspect-[1.14/1] w-full max-w-[620px] overflow-hidden rounded-[2rem] border border-white/15 bg-[#071d2a] shadow-2xl shadow-black/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(192,255,77,.24),transparent_27%),linear-gradient(130deg,#0a2b3b,#061722)]" />
      <svg className={`absolute inset-0 h-full w-full opacity-70 ${isPlaying ? 'animate-[pulse_4s_ease-in-out_infinite]' : ''}`} viewBox="0 0 620 545" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c0ff4d" stopOpacity=".8"/><stop offset="1" stopColor="#c0ff4d" stopOpacity="0"/></linearGradient>
          <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" stroke="#C0FF4D" strokeOpacity=".11"/></pattern>
          <filter id="glow"><feGaussianBlur stdDeviation="10" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="620" height="545" fill="url(#grid)"/>
        <path d="M-20 417C89 360 133 444 226 375C307 315 330 206 431 233C495 250 541 187 658 119" stroke="url(#beam)" strokeWidth="2"/>
        <path d="M-20 425C89 368 133 452 226 383C307 323 330 214 431 241C495 258 541 195 658 127" stroke="#C0FF4D" strokeOpacity=".35" strokeWidth="1" filter="url(#glow)"/>
        <circle cx="431" cy="233" r="7" fill="#C0FF4D"/>
        <circle cx="431" cy="233" r="20" stroke="#C0FF4D" strokeOpacity=".25"/>
        <circle cx="431" cy="233" r="35" stroke="#C0FF4D" strokeOpacity=".12"/>
        <g filter="url(#glow)">
          <circle r="10" fill="#F6FFD8">
            {isPlaying && <animateMotion dur="4s" repeatCount="indefinite" path="M-20 417C89 360 133 444 226 375C307 315 330 206 431 233C495 250 541 187 658 119" />}
          </circle>
          <circle r="22" fill="none" stroke="#C0FF4D" strokeOpacity=".28">
            {isPlaying && <animateMotion dur="4s" repeatCount="indefinite" path="M-20 417C89 360 133 444 226 375C307 315 330 206 431 233C495 250 541 187 658 119" />}
          </circle>
        </g>
        <path d="M77 96L174 40M77 96L35 143" stroke="#C0FF4D" strokeOpacity=".5"/>
      </svg>
      <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white/80 backdrop-blur-md">
        <span className="size-2 animate-pulse rounded-full bg-[#c0ff4d]" /> En direct · réseau interne
      </div>
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[.2em] text-[#c0ff4d]">Inside the movement</p>
          <p className="max-w-[260px] text-2xl font-medium leading-tight text-white">L&apos;énergie de nos équipes, en mouvement.</p>
        </div>
        <button type="button" onClick={() => setIsPlaying((playing) => !playing)} aria-label={isPlaying ? 'Mettre la vidéo en pause' : 'Lancer la vidéo de présentation'} aria-pressed={isPlaying} className="group flex size-16 shrink-0 items-center justify-center rounded-full bg-[#c0ff4d] text-[#071d2a] shadow-lg shadow-[#c0ff4d]/20 transition-transform hover:scale-105">
          {isPlaying ? <Pause className="size-5 fill-current transition-transform group-hover:scale-110" /> : <Play className="ml-1 size-5 fill-current transition-transform group-hover:scale-110" />}
        </button>
      </div>
    </div>
  )
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7f2] text-[#092433]">
      <div className="mx-auto max-w-[1440px] px-5 py-5 sm:px-8 lg:px-12">
       

        <section id="accueil" className="relative grid gap-12 pb-16 pt-16 sm:pt-24 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-28">
          <div className="relative z-10 max-w-[600px]">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d8e3d4] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[.16em] text-[#587267]"><span className="size-2 rounded-full bg-[#c0ff4d]" /> Bienvenue chez nous</div>
            <h1 className="max-w-[680px] text-[clamp(3.5rem,7vw,6.8rem)] font-semibold leading-[.91] tracking-[-.075em] text-[#092433]">Ensemble,<br /><span className="text-[#94c738]">on va plus loin.</span></h1>
            <p className="mt-8 max-w-[530px] text-lg leading-relaxed text-[#60746d]">Votre point de repère au quotidien : retrouvez les dernières actualités, les annonces importantes, les demandes à suivre et les vidéos qui font vivre nos métiers. Explorez, partagez une idée ou rejoignez la conversation — tout ce qui nous rassemble est ici.</p>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Accès rapides">
              {['Actualités', 'Demandes', 'Annonces', 'Communauté'].map((item) => <a key={item} href={`#${item.toLowerCase()}`} className="rounded-full border border-[#d8e3d4] bg-white px-3 py-2 text-xs font-semibold text-[#587267] transition-colors hover:border-[#b4dd51] hover:bg-[#f1f9e5] hover:text-[#092433]">{item}</a>)}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4"><a href="#actualites" className="group inline-flex items-center gap-3 rounded-full bg-[#092433] px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-[#143d50]">Découvrir l&apos;intranet <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></a><a href="#le-groupe" className="inline-flex items-center gap-2 px-3 py-4 text-sm font-semibold text-[#60746d] hover:text-[#092433]">Explorer le groupe <ChevronDown className="size-4" /></a></div>
            <div className="mt-16 flex flex-wrap gap-8 border-t border-[#dfe6dd] pt-6"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-white"><Users className="size-4 text-[#7ca72e]" /></span><div><p className="text-sm font-semibold">+ 1 200</p><p className="text-xs text-[#799087]">collaborateurs</p></div></div><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-white"><ShieldCheck className="size-4 text-[#7ca72e]" /></span><div><p className="text-sm font-semibold">3 entités</p><p className="text-xs text-[#799087]">un même élan</p></div></div></div>
          </div>
          <div className="relative flex justify-end"><div className="absolute -right-20 -top-20 size-72 rounded-full bg-[#c0ff4d]/25 blur-3xl" /><PulseVisual /></div>
        </section>
      </div>
     
    </main>
  )
}
