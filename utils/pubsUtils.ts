export type PublicationType = 'actualites' | 'annonces' | 'evenements' | 'videos'

export const publicationMeta = {
  actualites: { label: 'Actualités', singular: 'actualité', color: 'violet', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iW54TwjcJ1XrG1j1GWmpUVmRE6MLi7.png' },
  annonces: { label: 'Annonces', singular: 'annonce', color: 'orange', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rYFW65Wn1UYcvTdRAvjTQxKNWOxytp.png' },
  evenements: { label: 'Événements', singular: 'événement', color: 'pink', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kMREVa7onpXNhauuXp5M8JSdlFlTta.png' },
  videos: { label: 'Vidéos', singular: 'vidéo', color: 'green', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NwiXCtSaEeUzz9d1XPFVAIBbTV5bLu.png' },
} as const

export const recentPublications = [
  { type: 'actualites' as const, title: 'La rentrée démarre sous le signe de l’innovation', excerpt: 'Découvrez les projets et les temps forts qui rythment ce nouveau trimestre.', date: 'Aujourd’hui, 09:42', tag: 'Institution' },
  { type: 'actualites' as const, title: 'Un nouveau programme pour accompagner les talents', excerpt: 'Une initiative pensée pour soutenir chaque parcours et chaque ambition.', date: 'Hier, 16:20', tag: 'Vie de l’établissement' },
  { type: 'annonces' as const, title: 'Maintenance de la plateforme', excerpt: 'Une intervention technique est prévue samedi de 22h à 00h.', date: '12 sept. 2024', tag: 'Information' },
  { type: 'annonces' as const, title: 'Fermeture exceptionnelle des bureaux', excerpt: 'Nos équipes seront exceptionnellement indisponibles lundi matin.', date: '10 sept. 2024', tag: 'Important' },
  { type: 'evenements' as const, title: 'Forum des associations', excerpt: 'Venez rencontrer les associations et découvrir leurs activités.', date: '20 sept. 2024', tag: 'Campus central' },
  { type: 'evenements' as const, title: 'Conférence : imaginer demain', excerpt: 'Un moment d’échange avec des intervenants inspirants.', date: '28 sept. 2024', tag: 'Auditorium' },
  { type: 'videos' as const, title: 'Dans les coulisses de notre communauté', excerpt: 'Une immersion en images au cœur de nos équipes.', date: '08 sept. 2024', tag: '03:42' },
  { type: 'videos' as const, title: 'Les 5 minutes de la semaine', excerpt: 'L’essentiel de l’actualité en vidéo, chaque vendredi.', date: '05 sept. 2024', tag: '05:18' },
]

export const navItems = [
  { key: 'overview', label: 'Vue d’ensemble', icon: 'LayoutDashboard' },
  { key: 'actualites', label: 'Actualités', icon: 'Newspaper' },
  { key: 'annonces', label: 'Annonces', icon: 'Megaphone' },
  { key: 'evenements', label: 'Événements', icon: 'CalendarDays' },
  { key: 'videos', label: 'Vidéos', icon: 'PlaySquare' },
] as const

export type NavKey = typeof navItems[number]['key']
export type { Actualite, Annonce, Evenement, Video } from './types'
