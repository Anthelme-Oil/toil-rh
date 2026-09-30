import { FileText, Hash, Image as ImageIcon, LayoutGrid, Video } from "lucide-react";
import { Channel, ChannelConfig, Post } from "./types";

export const CHANNELS: ChannelConfig[] = [
  { label: "Standard", icon: LayoutGrid },
  { label: "Articles", icon: FileText, count: 0,key:"ARTICLE" },
  { label: "Vidéos", icon: Video, count: 0 ,key:'VIDEO'},
  { label: "Médias", icon: ImageIcon, count: 0 ,key:'MEDIA'},
  { label: "Informations", icon: Hash, count: 0 ,key:'INFO'},
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    type: "Articles",
    author: "Nadia Benali",
    role: "Direction des opérations",
    initials: "NB",
    tone: "coral",
    time: "Il y a 18 min",
    title: "STSL Toil Compel accélère sa transformation digitale",
    body: "Une nouvelle étape dans notre histoire collective. Découvrez les trois priorités qui guideront nos équipes pour les prochains mois.",
    tag: "À la une",
    likes: 48,
    dislikes: 2,
    comments: 12,
    commentsList: [
      { author: "Marie A.", text: "Une très belle dynamique pour la suite.", time: "Il y a 8 min" },
      { author: "Thomas K.", text: "Merci pour cette vision claire.", time: "Il y a 3 min" },
    ],
  },
  {
    id: 2,
    type: "Vidéos",
    author: "Équipe Communication",
    role: "Vie de l’entreprise",
    initials: "EC",
    tone: "blue",
    time: "Hier à 16:42",
    title: "Retour en images sur notre journée équipe",
    body: "Merci à toutes et à tous pour cette belle énergie. Revivez les meilleurs moments de notre rencontre annuelle.",
    tag: "Vie d’équipe",
    likes: 72,
    dislikes: 1,
    comments: 19,
    commentsList: [
      { author: "Sonia M.", text: "Quel plaisir de revoir ces moments.", time: "Hier" },
    ],
  },
  {
    id: 3,
    type: "Médias",
    author: "Studio STSL",
    role: "Communication interne",
    initials: "SS",
    tone: "purple",
    time: "Lundi à 09:20",
    title: "Les visages de nos métiers",
    body: "Une série de portraits pour découvrir les talents qui font vivre notre entreprise au quotidien.",
    tag: "Portraits",
    likes: 36,
    dislikes: 0,
    comments: 7,
    commentsList: [],
  },
];

export const TREND_SETS: Record<Channel, { name: string; posts: string }[]> = {
  Standard: [
    { name: "Vie de l’entreprise", posts: "24 publications" },
    { name: "Innovation & projets", posts: "18 publications" },
    { name: "Nos réussites", posts: "12 publications" },
  ],
  Articles: [
    { name: "Transformation digitale", posts: "8 articles" },
    { name: "Management", posts: "6 articles" },
    { name: "Vie de l’entreprise", posts: "4 articles" },
  ],
  Vidéos: [
    { name: "Vie d’équipe", posts: "9 vidéos" },
    { name: "Nos métiers", posts: "6 vidéos" },
    { name: "Événements", posts: "4 vidéos" },
  ],
  Médias: [
    { name: "Portraits", posts: "12 médias" },
    { name: "Coulisses", posts: "8 médias" },
    { name: "Nos équipes", posts: "5 médias" },
  ],
  Informations: [
    { name: "À retenir", posts: "5 informations" },
    { name: "RH", posts: "4 informations" },
    { name: "Sécurité", posts: "3 informations" },
  ],
};