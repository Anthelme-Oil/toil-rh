"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Actualite } from "@/types";
import { actualitesClientService } from "@/lib/services/actualite.service";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Search,
  Loader2,
} from "lucide-react";

export function NewsExplorer() {
  const [articles, setArticles] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Toutes");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);

  // Chargement des données dynamiques depuis la base de données
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await actualitesClientService.getAll();
      setArticles(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des actualités:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Extraction dynamique des catégories uniques à partir des articles récupérés
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      articles.map((article) => article.categorie).filter(Boolean)
    );
    return ["Toutes", ...Array.from(uniqueCategories)];
  }, [articles]);

  // Filtrage combiné par catégorie et terme de recherche
  const filteredArticles = useMemo(
    () =>
      articles.filter((article) => {
        const matchesCategory =
          category === "Toutes" || article.categorie === category;
        const matchesQuery = `${article.titre} ${article.description}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [articles, category, query]
  );

  const featured = filteredArticles[0];
  const rest = filteredArticles.slice(1, visibleCount);

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
            <a className="text-[#20312d]" href="#actualites">
              Actualités
            </a>
            <a href="#categories">Catégories</a>
            <a href="#newsletter">La lettre</a>
          </nav>
          <a
            href="#actualites"
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
            Le journal du territoire
          </p>
          <h1 className="text-5xl font-normal tracking-[-0.07em] sm:text-7xl">
            Les actualités,{" "}
            <em className="font-serif text-[#879e8d]">sans détour.</em>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#71807b]">
            Les histoires, les projets et les initiatives qui font évoluer notre
            quotidien. Une lecture claire, au même endroit.
          </p>
        </div>
      </section>

      {/* Section Principale des Actualités */}
      <section
        id="actualites"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16 sm:px-8"
      >
        {/* Barre de Recherche et de Filtres */}
        <div className="mb-8 flex flex-col gap-4 rounded-sm border border-[#dfe6e1] bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            id="categories"
            className="flex gap-2 overflow-x-auto pb-1 sm:pb-0"
          >
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setCategory(item ?? "Toutes");
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
            <span className="sr-only">Rechercher une actualité</span>
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
            <p className="text-sm font-medium">Chargement des actualités...</p>
          </div>
        ) : featured ? (
          <>
            {/* Article à la Une */}
            <article className="group grid overflow-hidden rounded-3xl border border-[#dfe6e1] bg-white shadow-[0_16px_45px_rgba(43,67,57,0.07)] lg:grid-cols-[1.12fr_0.88fr]">
              <div className="relative min-h-72 overflow-hidden lg:min-h-[390px]">
                <img
                  src={
                    featured.imageUrl ||
                    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85"
                  }
                  alt={featured.titre}
                  className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#20312d]/45 to-transparent" />
                <span className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#315b4b]">
                  À la une
                </span>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <div className="mb-6 flex items-center gap-3 text-xs text-[#8b9892]">
                  <span>{formatDate(featured.datePublication)}</span>
                  {featured.tempsLecture && (
                    <>
                      <span className="size-1 rounded-full bg-[#b6c7bf]" />
                      <span>{featured.tempsLecture} de lecture</span>
                    </>
                  )}
                </div>
                <span className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#8b6d48]">
                  {featured.categorie || "Général"}
                </span>
                <h2 className="text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                  {featured.titre}
                </h2>
                <p className="mt-5 text-sm leading-6 text-[#71807b]">
                  {featured.description}
                </p>
                <a
                  href={`/actualites/${featured.id}`}
                  className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#315b4b]"
                >
                  Lire l’article{" "}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </article>

            {/* En-tête de la Liste Secondaire */}
            <div className="mt-12 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8b6d48]">
                  À découvrir
                </p>
                <h2 className="text-2xl font-medium tracking-tight">
                  Toutes les actualités
                </h2>
              </div>
              <span className="hidden text-sm text-[#8b9892] sm:block">
                {filteredArticles.length} résultat
                {filteredArticles.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Grille des Articles de Réserve */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <article
                  key={article.id}
                  className="group overflow-hidden rounded-2xl border border-[#dfe6e1] bg-white transition hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(43,67,57,0.09)]"
                >
                  <div className="relative aspect-[1.55] overflow-hidden">
                    <img
                      src={
                        article.imageUrl ||
                        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85"
                      }
                      alt={article.titre}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs text-[#315b4b]">
                      {article.categorie || "Actualité"}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-[#8b9892]">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {formatDate(article.datePublication)}
                      {article.tempsLecture && (
                        <>
                          <span className="mx-1">·</span>
                          <Clock3 className="size-3.5" aria-hidden="true" />
                          {article.tempsLecture}
                        </>
                      )}
                    </div>
                    <h3 className="mt-4 text-xl font-medium leading-snug tracking-[-0.025em]">
                      {article.titre}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#71807b]">
                      {article.description}
                    </p>
                    <a
                      href={`/actualites/${article.id}`}
                      className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#315b4b]"
                    >
                      Lire{" "}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {/* Bouton de Pagination/Chargement de plus */}
            {rest.length < filteredArticles.length - 1 && (
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
          /* État de recherche sans résultat */
          <div className="rounded-2xl border border-dashed border-[#b6c7bf] p-12 text-center text-[#71807b]">
            Aucune actualité ne correspond à votre recherche.
          </div>
        )}
      </section>

      {/* Section Newsletter */}
      {/* <section
        id="newsletter"
        className="mx-auto mb-16 max-w-7xl scroll-mt-24 px-5 sm:px-8"
      >
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-[#315b4b] p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#c8d9cd]">
              La lettre du fil
            </p>
            <h2 className="text-2xl font-medium tracking-tight">
              Les nouvelles essentielles, une fois par mois.
            </h2>
          </div>
          <button className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-[#315b4b]">
            S’inscrire <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </section> */}

      {/* Pied de Page */}
      {/* <footer className="border-t border-[#dfe6e1] px-5 py-8 text-center text-sm text-[#8b9892] sm:px-8">
        Le fil public · Une information claire, au bon moment.
      </footer> */}
    </main>
  );
}