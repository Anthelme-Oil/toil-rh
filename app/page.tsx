"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  ChevronRight,
  FileText,
  HelpCircle,
  LayoutGrid,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  Video,
  ExternalLink,
} from "lucide-react";

import SingleLayout from "@/components/layout/SingleLayout";
import Link from "next/link";

import { useUser } from "@/context/UserContext";
import { getActualites } from "@/lib/services/actualites.service";
import { getDayOffs } from "@/lib/services/calendars.service";
import { EventsAndCalendarSection } from "@/components/EventsAndCalendarSection";

import { ActualitesResponse, Actualite, Evenement, DayOff } from "@/types";
import { DateFormat } from "@/utils/dateUtils";
import { getNewsColor } from "@/utils/newsUtils";
import Loader from "@/components/Loader";
const heroImage = "/images/banner2.png";

import { apps } from "@/utils/dataUtils";
import Image from "next/image";
import { removeFirstWord } from "@/utils/utils";

export function IntranetHome() {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const visibleApps = useMemo(
    () =>
      apps.filter((app) =>
        `${app.name} ${app.desc}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  const { userEmail, userName } = useUser();

  const [infos, setInfos] = useState<ActualitesResponse>({
    actualites: [],
    videos: [],
    evenements: [],
  });

  const [dataLoader, setDataLoader] = useState(true);
  const [offDays, setOffDays] = useState<DayOff[]>([]);

  // Chargement des actualités et événements
  const fetchActus = async () => {
    setDataLoader(true);

    try {
      const infoData = await getActualites(3);
      setInfos(infoData);
    } catch (error) {
      console.error("Erreur lors du chargement des actualités :", error);
    } finally {
      setDataLoader(false);
    }
  };

  // Chargement des jours fériés avec l'année en cours
  const fetchDayOffs = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const daysOffData = await getDayOffs(currentYear);
      setOffDays(daysOffData || []);
    } catch (error) {
      console.error("Erreur lors du chargement des jours fériés :", error);
    }
  };

  useEffect(() => {
    fetchActus();
    fetchDayOffs();
  }, []);

  const actus = infos.actualites;
  const events = infos.evenements;

  return (
    <SingleLayout>
      <main className="overflow-hidden text-[#17223b] w-full">
        <section
          id="accueil"
          className="relative z-10 mx-auto grid max-w-[1320px] gap-8 px-5 pb-9 pt-8 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-12 lg:pb-14 lg:pt-16"
        >
          <div className="relative isolate overflow-hidden">
            {/* Background SVG décoratif */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 -z-10 h-[520px] w-[520px] text-[#079bc2]/10"
              viewBox="0 0 500 500"
              fill="none"
            >
              <circle
                cx="250"
                cy="250"
                r="190"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle
                cx="250"
                cy="250"
                r="135"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle
                cx="250"
                cy="250"
                r="80"
                stroke="currentColor"
                strokeWidth="1"
              />

              <path
                d="M250 20V480M20 250H480"
                stroke="currentColor"
                strokeWidth="1"
              />

              <path
                d="M88 88L412 412M412 88L88 412"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>

            {/* Petites formes décoratives */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -left-10 bottom-0 -z-10 h-48 w-48 text-[#5670b9]/10"
              viewBox="0 0 200 200"
              fill="none"
            >
              <path
                d="M20 150C55 110 80 105 110 120C140 135 160 120 180 80"
                stroke="currentColor"
                strokeWidth="1.5"
              />

              <path
                d="M10 175C55 125 90 125 120 140C150 155 170 140 195 100"
                stroke="currentColor"
                strokeWidth="1.5"
              />

              <circle cx="42" cy="150" r="4" fill="currentColor" />

              <circle cx="155" cy="126" r="3" fill="currentColor" />
            </svg>

            {/* Points décoratifs */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[18%] top-20 -z-10 grid grid-cols-5 gap-3 opacity-30"
            >
              {Array.from({ length: 25 }).map((_, index) => (
                <span
                  key={index}
                  className="size-1 rounded-full bg-[#079bc2]"
                />
              ))}
            </div>

            {/* Contenu */}
            <div className="flex flex-col justify-center animate-[fadeUp_.7s_ease-out_both]">
              {/* Badge */}
              <div className="mb-5 flex w-fit items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-xs font-bold text-[#5670b9] ring-1 ring-[#e8edf6] backdrop-blur-sm">
                <span className="size-2 rounded-full bg-[#5fc5a2]" />
                Tout est là, au même endroit
              </div>

              {/* Titre */}
              <h1 className="max-w-[620px] text-3xl font-extrabold leading-[1.08] tracking-[-0.055em] text-[#16233b] sm:text-5xl">
                Bonjour{" "}
                <span className="text-[#5670b9]">
                  {removeFirstWord(userName)}
                </span>
                ,
                <br />
                <span className="text-[#079bc2]">on avance ensemble.</span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-[530px] text-base leading-7 text-[#748097]">
                Votre espace pour rester informée, trouver vos outils et faire
                avancer vos projets simplement.
              </p>

              {/* Recherche */}
              <div className="relative mt-8 max-w-[500px]">
                <Search
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#98a4b9]"
                />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher une ressource, une personne..."
                  className="h-14 w-full rounded-2xl border border-[#e9edf5] bg-white/90 pl-12 pr-4 text-sm text-[#16233b] outline-none placeholder:text-[#a5afc0] backdrop-blur-sm transition focus:border-[#079bc2]/40 focus:ring-2 focus:ring-[#079bc2]/15"
                />
              </div>
            </div>
          </div>

          <div className="group relative min-h-[320px] overflow-hidden rounded-0 bg-[#102d4f] shadow-[0_20px_55px_rgba(26,61,96,.2)] animate-[fadeUp_.7s_.12s_ease-out_both] lg:min-h-[390px]">
            {/* Image */}
            <Image
              src={heroImage}
              width={800}
              height={600}
              alt="Les activités de COMPEL, STSL et T-Oil"
              className="absolute inset-0 size-full object-cover object-center opacity-80 transition duration-700 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#102d4f]/20 via-[#102d4f]/20 to-[#102d4f]/95" />

            {/* Contenu */}
            <div className="relative z-10 flex min-h-[320px] flex-col justify-between p-6 sm:p-8 lg:min-h-[390px] lg:p-10">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-[#167c97] shadow-sm backdrop-blur-sm">
                  T-Oil / STSL / COMPEL
                </span>
              </div>

              <div className="max-w-[430px] text-white">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#a6e6e5]">
                  Notre groupe, notre énergie
                </p>

                <h2 className="text-3xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-4xl">
                  Ensemble, construisons la suite.
                </h2>

                <Link
                  href="/informations"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#102d4f] transition-all hover:gap-3 hover:bg-[#a6e6e5]"
                >
                  Découvrir l’actualité
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Accès rapides */}
        <section className="relative z-10 mx-auto max-w-[1320px] px-5 pb-10 sm:px-8 lg:px-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.17em] text-[#98a4b9]">
                Votre quotidien
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-.04em]">
                Accès rapides
              </h2>
            </div>
            <Link
              href="/outils"
              className="hidden items-center gap-1 text-sm font-bold text-[#079bc2] sm:flex"
            >
              Voir toutes les applications <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {visibleApps.map((app, index) => (
              <a
                key={app.name}
                href={app.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => announce(`Ouverture de ${app.name}`)}
                className="group flex min-h-[125px] flex-col items-start justify-between rounded-2xl bg-white p-4 text-left shadow-[0_8px_25px_rgba(41,62,110,.05)] ring-1 ring-[#edf0f6] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(41,62,110,.12)] animate-[fadeUp_.5s_ease-out_both]"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#f5f8fc] p-2 transition group-hover:scale-110">
                  <img
                    src={app.logo}
                    alt=""
                    className="size-full object-contain"
                  />
                </span>
                <span>
                  <span className="block text-sm font-bold text-[#27344f]">
                    {app.name}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium text-[#9aa5b7]">
                    {app.desc}
                  </span>
                </span>
                <ExternalLink
                  className="absolute hidden size-3 text-[#079bc2]"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </section>

        {/* SECTION ÉVÉNEMENTS & CALENDRIER */}
        <EventsAndCalendarSection events={events} offDays={offDays} />

        {/* Actualités [0_8px_25px_rgba(41,62,110,.05)] */}
        <section
          className="relative z-10 mx-auto grid max-w-[1320px] gap-6 px-5 pb-12 sm:px-8 lg:grid-cols-[1.35fr_.65fr] lg:px-12"
          id="actualites"
        >
          <div className="rounded-0 bg-white p-5 shadow-0 ring-1 ring-[#edf0f6] sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.17em] text-[#98a4b9]">
                  Restez au courant
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-.04em]">
                  Actualités & communications
                </h2>
              </div>
              <Link
                href={"/informations"}
                className="rounded-xl p-2 text-[#9ca8ba] transition hover:bg-[#f4f6fb] hover:text-[#079bc2]"
                aria-label="Plus d’actualités"
              >
                <ArrowRight className="size-5" />
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {dataLoader ? (
                <div className="col-span-full flex min-h-40 items-center justify-center">
                  <Loader />
                </div>
              ) : (
                actus.map((item, index) => (
                  <article
                    key={index}
                    className={`group relative min-h-[220px] overflow-hidden rounded-2xl bg-${getNewsColor(
                      index,
                    )}-50 transition duration-300 hover:-translate-y-1`}
                  >
                    {/* Image de fond */}
                    {item.imageUrl && (
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url("${item.imageUrl}")`,
                        }}
                      />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071a2d]/95 via-[#071a2d]/45 to-transparent" />

                    {/* Date */}
                    <div className="absolute right-4 top-4 z-10">
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#52627a] shadow-sm backdrop-blur-sm">
                        {String(DateFormat(item.datePublication, false))}
                      </span>
                    </div>

                    {/* Contenu */}
                    <div className="relative z-10 flex min-h-[220px] flex-col justify-end p-4">
                      <p className="line-clamp-3 font-bold text-sm leading-5 text-white/90">
                        {item.titre}
                      </p>
                      <p className="line-clamp-3 text-xs leading-5 text-white/90">
                        {item.description}
                      </p>

                      <button
                        onClick={() => announce("Lecture de l’article")}
                        className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
                      >
                        Lire la suite
                        <ArrowRight className="size-3" />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
          <aside
            id="formations"
            className="relative isolate flex min-h-[330px] flex-col justify-between overflow-hidden rounded-[0.75rem] bg-[#102d4f] p-7 text-white shadow-[0_15px_35px_rgba(16,45,79,.18)] before:absolute before:-right-16 before:-top-16 before:-z-10 before:size-56 before:rounded-full before:border-[24px] before:border-[#4fc1c5]/20 after:absolute after:-bottom-24 after:-left-16 after:-z-10 after:size-48 after:rounded-full after:bg-[#079bc2]/15 sm:p-8"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                  <BookOpen className="size-5 text-[#9ce2df]" />
                </div>
                <span className="rounded-full bg-[#1e5572] px-3 py-1.5 text-[10px] font-bold">
                  À découvrir
                </span>
              </div>
              <h2 className="mt-8 text-2xl font-extrabold leading-tight">
                Développez vos talents.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#b4c9d9]">
                Formations, ateliers et ressources pour progresser ensemble.
              </p>
            </div>
            <Link
              href="/formations"
              className="mt-8 flex items-center gap-2 text-sm font-bold text-[#9ce2df]"
            >
              Voir le catalogue <ArrowRight className="size-4" />
            </Link>
          </aside>
        </section>

        {/* Section Collectif */}
        <section
          id="collectif"
          className="relative z-10 mx-auto flex max-w-[1320px] flex-wrap gap-3 px-5 pb-12 sm:px-8 lg:px-12"
        >
          <Link
            href="/demandes/catalogue"
            className="flex flex-1 items-center gap-4 rounded-2xl bg-[#fff0e6] p-4 text-left transition hover:-translate-y-1 sm:min-w-[220px]"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#e58c62]">
              <MessageSquareText className="size-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold">Faire une demande</p>
              <p className="mt-1 text-xs text-[#b07c67]">IT, RH, matériel...</p>
            </div>
            <ArrowRight className="ml-auto size-4 text-[#ce8b6c]" />
          </Link>
          <button
            onClick={() => announce("Annuaire ouvert")}
            className="flex flex-1 items-center gap-4 rounded-2xl bg-[#eaf7f2] p-4 text-left transition hover:-translate-y-1 sm:min-w-[220px]"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#4aaf8c]">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold">Trouver un collègue</p>
              <p className="mt-1 text-xs text-[#78a993]">
                Annuaire de l’entreprise
              </p>
            </div>
            <ArrowRight className="ml-auto size-4 text-[#64ae94]" />
          </button>
          <button
            onClick={() => announce("Bibliothèque ouverte")}
            className="flex flex-1 items-center gap-4 rounded-2xl bg-[#f0edff] p-4 text-left transition hover:-translate-y-1 sm:min-w-[220px]"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#8175d4]">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold">Bibliothèque</p>
              <p className="mt-1 text-xs text-[#8b86b8]">Ressources communes</p>
            </div>
            <ArrowRight className="ml-auto size-4 text-[#8278c8]" />
          </button>
        </section>

        {notice && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#102d4f] px-5 py-3 text-sm font-semibold text-white shadow-xl animate-[fadeUp_.25s_ease-out_both]"
          >
            <ShieldCheck className="size-4 text-[#9ce2df]" /> {notice}
          </div>
        )}
      </main>
    </SingleLayout>
  );
}

export default IntranetHome;