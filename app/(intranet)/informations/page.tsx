"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  Video as VideoIcon,
  Newspaper,
  Megaphone,
  ArrowUpRight,
  Clock3,
  MapPin,
  Play,
  X,
  Loader2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import { Video, Evenement, Annonce, Actualite } from "@/types";
import { actualitesClientService } from "@/lib/services/actualite.service";
import { evenementsClientService } from "@/lib/services/evenements.service";
import { videosClientService } from "@/lib/services/videos.service";
import { annoncesClientService } from "@/lib/services/annonces.service";

type ContentType = "all" | "actualites" | "evenements" | "videos" | "annonces";

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return null;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
};

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<ContentType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [playingVideoId, setPlayingVideoId] = useState<string | number | null>(null);

  const [announcements, setAnnouncements] = useState<Annonce[]>([]);
  const [news, setNews] = useState<Actualite[]>([]);
  const [events, setEvents] = useState<Evenement[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [annRes, actuRes, evtRes, vidRes] = await Promise.allSettled([
        annoncesClientService.getAll(),
        actualitesClientService.getAll(),
        evenementsClientService.getAll(),
        videosClientService.getAll(),
      ]);

      if (annRes.status === "fulfilled") setAnnouncements(annRes.value);
      if (actuRes.status === "fulfilled") setNews(actuRes.value);
      if (evtRes.status === "fulfilled") setEvents(evtRes.value);
      if (vidRes.status === "fulfilled") setVideos(vidRes.value);
    } catch (err) {
      console.error("Erreur lors du chargement des données", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    news.forEach((n) => n.categorie && cats.add(n.categorie));
    videos.forEach((v) => v.categorie && cats.add(v.categorie));
    return Array.from(cats);
  }, [news, videos]);

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchesSearch =
        item.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === "all" || item.categorie === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [news, searchQuery, selectedCategory]);

  const filteredEvents = useMemo(() => {
    return events.filter(
      (item) =>
        item.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lieu?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  const filteredVideos = useMemo(() => {
    return videos.filter((item) => {
      const matchesSearch =
        item.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === "all" || item.categorie === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [videos, searchQuery, selectedCategory]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(
      (item) =>
        item.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contenu.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [announcements, searchQuery]);

  const totalCount =
    filteredNews.length +
    filteredEvents.length +
    filteredVideos.length +
    filteredAnnouncements.length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen pb-20 pt-8">
      {/* En-tête */}
      <header className="pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
              <Sparkles size={14} /> Le fil public
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Tout le contenu, réuni.
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-md">
            Consultez en direct l’ensemble des actualités, des annonces importantes, des vidéos et des événements à venir.
          </p>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div className="mt-8 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une publication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {categories.length > 0 && (
            <div className="relative w-full md:w-auto">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-52 pl-9 pr-8 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-violet-600 cursor-pointer"
              >
                <option value="all">Toutes catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Onglets Navigation */}
        <nav className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "all", label: "Tout voir", icon: Sparkles, count: totalCount },
            { id: "actualites", label: "Actualités", icon: Newspaper, count: filteredNews.length },
            { id: "annonces", label: "Annonces", icon: Megaphone, count: filteredAnnouncements.length },
            { id: "videos", label: "Vidéos", icon: VideoIcon, count: filteredVideos.length },
            { id: "evenements", label: "Agenda", icon: Calendar, count: filteredEvents.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ContentType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                <span
                  className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-900"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Contenu */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
          <Loader2 size={36} className="animate-spin text-violet-600" />
          <p className="text-sm font-medium">Chargement du contenu...</p>
        </div>
      ) : (
        <div className="mt-10 space-y-16">
          {/* Section Annonces */}
          {(activeTab === "all" || activeTab === "annonces") && filteredAnnouncements.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Megaphone size={20} className="text-amber-500" /> Annonces importantes
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAnnouncements.map((ann) => {
                  const isUrgent = ann.type === "urgent";
                  const isWarning = ann.type === "warning";
                  return (
                    <div
                      key={ann.id}
                      className={`relative p-6 rounded-3xl border transition-all ${
                        isUrgent
                          ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900"
                          : isWarning
                          ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-3">
                        <span
                          className={`px-3 py-1 rounded-full uppercase tracking-wider text-[10px] ${
                            isUrgent
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"
                              : isWarning
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {isUrgent ? "Urgent" : isWarning ? "À noter" : "Information"}
                        </span>
                        <span className="text-slate-400">{formatDate(ann.datePublication)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {ann.titre}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {ann.contenu}
                      </p>
                      {ann.lien && (
                        <a
                          href={ann.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400"
                        >
                          En savoir plus <ArrowUpRight size={14} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section Actualités */}
          {(activeTab === "all" || activeTab === "actualites") && filteredNews.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Newspaper size={20} className="text-violet-600" /> Les Actualités
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item) => (
                  <article
                    key={item.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={
                          item.imageUrl ||
                          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85"
                        }
                        alt={item.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                        {item.categorie || "Général"}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                          <span>{formatDate(item.datePublication)}</span>
                          {item.tempsLecture && (
                            <>
                              <span>•</span>
                              <span>{item.tempsLecture}</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors line-clamp-2">
                          {item.titre}
                        </h3>
                        <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-violet-600 dark:text-violet-400">
                        <span>Lire l’article</span>
                        <ChevronRight size={14} className="ml-0.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Section Vidéos */}
          {(activeTab === "all" || activeTab === "videos") && filteredVideos.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <VideoIcon size={20} className="text-rose-600" /> Les Vidéos
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => {
                  const isPlaying = playingVideoId === video.id;
                  const embedUrl = getEmbedUrl(video.videoUrl);

                  return (
                    <article
                      key={video.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col"
                    >
                      {/* Vignette avec hauteur fixe preservee */}
                      <div className="relative aspect-video bg-black overflow-hidden group">
                        {isPlaying ? (
                          <div className="relative w-full h-full">
                            <button
                              onClick={() => setPlayingVideoId(null)}
                              className="absolute top-2 right-2 z-20 p-1.5 bg-black/80 hover:bg-black text-white rounded-full transition-all"
                              title="Fermer"
                            >
                              <X size={16} />
                            </button>

                            {embedUrl ? (
                              <iframe
                                src={embedUrl}
                                title={video.titre}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={video.videoUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-cover"
                              >
                                Votre navigateur ne supporte pas la lecture vidéo.
                              </video>
                            )}
                          </div>
                        ) : (
                          <div
                            className="relative w-full h-full cursor-pointer"
                            onClick={() => setPlayingVideoId(`${video.id}`)}
                          >
                            <img
                              src={
                                video.thumbnailUrl ||
                                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85"
                              }
                              alt={video.titre}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors flex items-center justify-center">
                              <span className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play fill="currentColor" size={20} className="ml-0.5" />
                              </span>
                            </div>
                            {video.duree && (
                              <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                                {video.duree}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                            <span>{video.categorie || "Vidéo"}</span>
                            <span>•</span>
                            <span>{formatDate(video.date)}</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {video.titre}
                          </h3>
                          {video.description && (
                            <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section Événements / Agenda */}
          {(activeTab === "all" || activeTab === "evenements") && filteredEvents.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Calendar size={20} className="text-blue-600" /> L'Agenda
                </h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                {filteredEvents.map((event) => (
                  <article
                    key={event.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Date d'évènement */}
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-extrabold shrink-0 border border-violet-100 dark:border-violet-900">
                        <span className="text-lg leading-none">
                          {new Date(event.dateDebut).getDate()}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider mt-0.5">
                          {new Intl.DateTimeFormat("fr-FR", { month: "short" })
                            .format(new Date(event.dateDebut))
                            .replace(".", "")}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-1">
                          <span className="flex items-center gap-1">
                            <Clock3 size={13} /> {formatTime(event.dateDebut)}
                            {event.dateFin && ` — ${formatTime(event.dateFin)}`}
                          </span>
                          {event.lieu && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin size={13} /> {event.lieu}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {event.titre}
                        </h3>
                        {event.description && (
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button className="self-end sm:self-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
                      <ArrowUpRight size={18} />
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* État vide */}
          {totalCount === 0 && (
            <div className="text-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Search className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={44} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aucun résultat</h3>
              <p className="text-slate-500 text-sm mt-1">
                Aucun contenu ne correspond à votre recherche "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setActiveTab("all");
                }}
                className="mt-5 px-5 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-2xl shadow-sm"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}