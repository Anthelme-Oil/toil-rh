"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Play,
  Search,
  Loader2,
} from "lucide-react";

import { Video } from "@/types";
import { videosClientService } from "@/lib/services/videos.service";

export function VideoExplorer() {
  const [videosList, setVideosList] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Toutes");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);

  // Chargement des vidéos réelles depuis la BDD
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await videosClientService.getAll();
      setVideosList(data);
    } catch (error) {
      console.error("Erreur lors du chargement des vidéos :", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Extraction dynamique et sécurisée des catégories (Type Guard pour éviter 'undefined')
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      videosList
        .map((video) => video.categorie)
        .filter((cat): cat is string => Boolean(cat))
    );
    return ["Toutes", ...Array.from(uniqueCategories)];
  }, [videosList]);

  // Filtrage combiné (Catégorie + Recherche)
  const filteredVideos = useMemo(
    () =>
      videosList.filter((video) => {
        const matchesCategory =
          category === "Toutes" || video.categorie === category;
        const matchesQuery = `${video.titre || ""} ${video.description || ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [videosList, category, query]
  );

  const featured = filteredVideos[0];
  const rest = filteredVideos.slice(1, visibleCount);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="w-full text-[#20312d]">
      {/* En-tête Sticky */}
      {/* <header className="sticky top-0 z-20 border-b border-[#dfe6e1]/80 bg-[#f7f8f6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
          <a
            href="#top"
            className="flex items-center gap-3 text-sm font-medium tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[#d7e7dc] text-[#315b4b]">
              lf
            </span>
            <span>
              Le fil <strong>public</strong>
            </span>
          </a>
          <nav
            className="hidden items-center gap-8 text-sm text-[#71807b] md:flex"
            aria-label="Navigation principale"
          >
            <a href="#videos" className="text-[#20312d]">
              Vidéos
            </a>
            <a href="#categories">Catégories</a>
            <a href="#selection">La sélection</a>
          </nav>
          <a
            href="#videos"
            className="inline-flex items-center gap-2 border-b border-[#b6c7bf] pb-1 text-sm"
          >
            Explorer <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </header> */}

      {/* Hero Header */}
      <section
        id="top"
        className="mx-auto max-w-7xl px-5 pb-14 pt-16 sm:px-8 sm:pt-24"
      >
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#8b6d48]">
            Le journal en images
          </p>
          <h1 className="text-5xl font-normal tracking-[-0.07em] sm:text-7xl">
            Les vidéos,{" "}
            <em className="font-serif text-[#879e8d]">à regarder.</em>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#71807b]">
            Des reportages, des portraits et des formats courts pour voir le
            territoire autrement.
          </p>
        </div>
      </section>

      {/* Section Principale */}
      <section
        id="videos"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-20 sm:px-8"
      >
        {/* Barre de Recherche et de Filtres */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#dfe6e1] bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            id="categories"
            className="flex gap-2 overflow-x-auto pb-1 sm:pb-0"
          >
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setCategory(item);
                  setVisibleCount(4);
                }}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm transition-colors ${
                  category === item
                    ? "bg-[#315b4b] text-white"
                    : "text-[#71807b] hover:bg-[#eef3ef]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="flex min-w-52 items-center gap-2 rounded-xl bg-[#eef3ef] px-3 py-2 text-sm text-[#71807b]">
            <Search className="size-4" aria-hidden="true" />
            <span className="sr-only">Rechercher une vidéo</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(4);
              }}
              placeholder="Rechercher"
              className="w-full bg-transparent outline-none placeholder:text-[#9aa7a1]"
            />
          </label>
        </div>

        {/* État de Chargement */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#71807b] gap-3">
            <Loader2 className="size-8 animate-spin text-[#315b4b]" />
            <p className="text-sm font-medium">Chargement des vidéos...</p>
          </div>
        ) : featured ? (
          <>
            {/* Vidéo à la Une */}
            <article className="group grid overflow-hidden rounded-3xl border border-[#dfe6e1] bg-white shadow-[0_16px_45px_rgba(43,67,57,0.07)] lg:grid-cols-[1.12fr_0.88fr]">
              <a
                href={featured.videoUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Lire ${featured.titre}`}
                className="relative min-h-72 overflow-hidden lg:min-h-[390px]"
              >
                <img
                  src={
                    featured.thumbnailUrl ||
                    "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1400&q=85"
                  }
                  alt={featured.titre}
                  className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#20312d]/60 via-transparent to-transparent" />
                <span className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#315b4b]">
                  À la une
                </span>
                <span className="absolute bottom-6 left-6 grid size-14 place-items-center rounded-full bg-white text-[#315b4b] shadow-lg transition group-hover:scale-110">
                  <Play
                    className="ml-0.5 size-5 fill-current"
                    aria-hidden="true"
                  />
                </span>
                {featured.duree && (
                  <span className="absolute bottom-7 right-6 rounded-md bg-[#20312d]/80 px-2 py-1 text-xs text-white">
                    {featured.duree}
                  </span>
                )}
              </a>

              <div className="flex flex-col justify-center p-7 sm:p-10">
                <div className="mb-6 flex items-center gap-3 text-xs text-[#8b9892]">
                  <span>{formatDate(featured.date)}</span>
                  {featured.duree && (
                    <>
                      <span className="size-1 rounded-full bg-[#b6c7bf]" />
                      <span>{featured.duree}</span>
                    </>
                  )}
                </div>
                <span className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#8b6d48]">
                  {featured.categorie || "Média"}
                </span>
                <h2 className="text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                  {featured.titre}
                </h2>
                <p className="mt-5 text-sm leading-6 text-[#71807b]">
                  {featured.description}
                </p>
                <a
                  href={featured.videoUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#315b4b]"
                >
                  Voir la vidéo{" "}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </article>

            {/* Titre de Section */}
            <div
              id="selection"
              className="mt-12 flex items-end justify-between"
            >
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8b6d48]">
                  À découvrir
                </p>
                <h2 className="text-2xl font-medium tracking-tight">
                  Toutes les vidéos
                </h2>
              </div>
              <span className="hidden text-sm text-[#8b9892] sm:block">
                {filteredVideos.length} résultat
                {filteredVideos.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Grille des Vidéos Restantes */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((video) => (
                <article
                  key={video.id}
                  className="group overflow-hidden rounded-2xl border border-[#dfe6e1] bg-white transition hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(43,67,57,0.09)]"
                >
                  <a
                    href={video.videoUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block aspect-[1.55] overflow-hidden"
                  >
                    <img
                      src={
                        video.thumbnailUrl ||
                        "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1000&q=85"
                      }
                      alt={video.titre}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#20312d]/50 to-transparent" />
                    <span className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-full bg-white/95 text-[#315b4b]">
                      <Play
                        className="ml-0.5 size-4 fill-current"
                        aria-hidden="true"
                      />
                    </span>
                    {video.duree && (
                      <span className="absolute bottom-3 right-3 rounded-md bg-[#20312d]/80 px-2 py-1 text-xs text-white">
                        {video.duree}
                      </span>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs text-[#315b4b]">
                      {video.categorie || "Vidéo"}
                    </span>
                  </a>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-[#8b9892]">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {formatDate(video.date)}
                      {video.duree && (
                        <>
                          <span className="mx-1">·</span>
                          <Clock3 className="size-3.5" aria-hidden="true" />
                          {video.duree}
                        </>
                      )}
                    </div>
                    <h3 className="mt-4 text-xl font-medium leading-snug tracking-[-0.025em]">
                      {video.titre}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#71807b]">
                      {video.description}
                    </p>
                    <a
                      href={video.videoUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#315b4b]"
                    >
                      Regarder{" "}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {/* Bouton Voir Plus */}
            {rest.length < filteredVideos.length - 1 && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisibleCount((count) => count + 3)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#b6c7bf] px-5 py-3 text-sm font-medium text-[#315b4b] transition hover:bg-[#eef3ef]"
                >
                  Voir plus{" "}
                  <ChevronDown className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#b6c7bf] p-12 text-center text-[#71807b]">
            Aucune vidéo ne correspond à votre recherche.
          </div>
        )}
      </section>

      {/* Footer */}
      {/* <footer className="border-t border-[#dfe6e1] px-5 py-8 text-center text-sm text-[#8b9892]">
        Le fil public · Des images pour mieux comprendre.
      </footer> */}
    </main>
  );
}

export default VideoExplorer;