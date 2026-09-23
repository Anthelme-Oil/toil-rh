"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Menu,
  MoreHorizontal,
  Search,
  Settings2,
  Sparkles,
  Users,
  Video,
  X,
} from "lucide-react";
import { getMyRequests } from "@/lib/services/my-requests";
import { RequestItem ,Actualite} from "@/types";
import Loader from "@/components/Loader";
import {getStatutColor,getStatutText} from "@/utils/statutRequest";
import Image from 'next/image'
import { DateFormat } from "@/utils/dateUtils";

import SingleLayout from "@/components/layout/SingleLayout";
import Link from "next/link";
import { apps } from "@/utils/dataUtils";
import { getActualites, getAnnonces, getEvenementsDuJour } from '@/lib/sharepoint';
import NewsCard from "@/components/ActuCard";
// import { auth } from '@/lib/auth';
const newss = [
  {
    title: "La sécurité, notre priorité à tous",
    desc: "Retrouvez les nouveaux réflexes à adopter au quotidien dans nos espaces de travail.",
    date: "18 sept. 2026",
    label: "Groupe",
    color: "bg-amber-100 text-amber-700",
    icon: ShieldIcon,
  },
  {
    title: "STSL inaugure son nouvel espace collaboratif",
    desc: "Un lieu pensé pour mieux se retrouver, partager et faire grandir nos idées.",
    date: "15 sept. 2026",
    label: "STSL",
    color: "bg-cyan-100 text-cyan-700",
    icon: Users,
  },
  {
    title: "T-Oil : cap sur une énergie plus responsable",
    desc: "Découvrez les engagements et les initiatives qui font avancer notre transition.",
    date: "11 sept. 2026",
    label: "T-Oil",
    color: "bg-emerald-100 text-emerald-700",
    icon: Sparkles,
  },
];

// const apps = [
//   {
//     name: "PowerPoint",
//     desc: "Présentations",
//     icon: "P",
//     color: "bg-orange-100 text-orange-600",
//   },
//   {
//     name: "OneDrive",
//     desc: "Vos fichiers",
//     icon: "☁",
//     color: "bg-blue-100 text-blue-600",
//   },
//   {
//     name: "SharePoint",
//     desc: "Sites & équipes",
//     icon: "S",
//     color: "bg-teal-100 text-teal-600",
//   },
//   {
//     name: "Outlook",
//     desc: "Messagerie",
//     icon: "O",
//     color: "bg-sky-100 text-sky-600",
//   },
// ];

const requests = [
  {
    title: "Demande de congé annuel",
    ref: "#REQ-2481",
    status: "En cours",
    statusColor: "bg-amber-50 text-amber-700",
    date: "18 sept. 2026",
  },
  {
    title: "Accès au dossier Finance",
    ref: "#REQ-2476",
    status: "Validée",
    statusColor: "bg-emerald-50 text-emerald-700",
    date: "12 sept. 2026",
  },
  {
    title: "Nouveau badge d’accès",
    ref: "#REQ-2464",
    status: "Traitée",
    statusColor: "bg-slate-100 text-slate-600",
    date: "04 sept. 2026",
  },
];

function ShieldIcon({ className }: { className?: string }) {
  return <CheckCircle2 className={className} />;
}

export default  function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const filteredNews = newss.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase()),
  );

  const [mesDemandes, setMesDemandes]=useState<RequestItem[]>([]);
  const [news, setNews]=useState<Actualite[]>([]);
  const [loading, setLoading]=useState<boolean>(false);
  const [newLoading, setNewLoading]=useState<boolean>(false);

  useEffect(()=>{
  fetchMyRequests();
  // fetchNews();
  },[])


    // const session = await auth();
    // const userEmail = session?.user?.email || '';
  
    // // Récupération en parallèle des données réelles
    // const [actualites, annonces, evenements] = await Promise.all([
    //   getActualites(3),
    //   getAnnonces(),
    //   getEvenementsDuJour(),
    //   // userEmail ? getCompteursDemandesParType(userEmail) : Promise.resolve({ materiel: 0, acces: 0, it: 0, rh: 0 }),
    // ]);


  const fetchMyRequests = async () => {
    try {
      setLoading(true);
  
      const data = await getMyRequests();
  
      setMesDemandes(data);
  
      // La sélection sera gérée par filteredRequest
      // setSelectedId(null);
    } catch (err) {
      console.error("Erreur chargement demandes:", err);
    } finally {
      setLoading(false);
    }
  };

  //  const fetchNews = async () => {
  //   try {
  //     setNewLoading(true);
  
  //     const data = await getActualites(3);
  
  //     setNews(data);
  
  //     // La sélection sera gérée par filteredRequest
  //     // setSelectedId(null);
  //   } catch (err) {
  //     console.error("Erreur chargement demandes:", err);
  //   } finally {
  //     setNewLoading(false);
  //   }
  // };

  return (
    <SingleLayout>
    <main className="min-h-screen  text-slate-900">
      {/* <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center gap-8 px-5 lg:px-10">
          <button
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#123b42] text-lg font-bold text-white shadow-sm">
              S
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-[17px] font-semibold tracking-tight">
                STSL · COMPEL · T-Oil
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[.16em] text-slate-400">
                Espace collaboratif
              </p>
            </div>
          </div>
          <nav
            className={`absolute left-0 top-[76px] w-full border-b border-slate-200 bg-white p-5 shadow-lg lg:static lg:ml-8 lg:flex lg:w-auto lg:items-center lg:gap-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${menuOpen ? "block" : "hidden lg:flex"}`}
            aria-label="Navigation principale"
          >
            <a
              className="flex items-center gap-2 border-b-2 border-[#127c80] py-3 text-sm font-semibold text-[#127c80] lg:py-7"
              href="#accueil"
            >
              Accueil
            </a>
            <a
              className="flex items-center gap-2 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 lg:py-7"
              href="#actualites"
            >
              Actualités
            </a>
            <a
              className="flex items-center gap-2 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 lg:py-7"
              href="#formations"
            >
              Formations
            </a>
            <a
              className="flex items-center gap-2 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 lg:py-7"
              href="#demandes"
            >
              Mes demandes
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search className="size-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher"
                className="w-32 bg-transparent text-sm outline-none placeholder:text-slate-400"
                aria-label="Rechercher"
              />
            </div>
            <button
              aria-label="Notifications"
              className="relative rounded-full p-2.5 text-slate-500 hover:bg-slate-100"
            >
              <Bell className="size-[19px]" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e18e45]" />
            </button>
            <button
              aria-label="Paramètres"
              className="hidden rounded-full p-2.5 text-slate-500 hover:bg-slate-100 sm:block"
            >
              <Settings2 className="size-[19px]" />
            </button>
            <div className="ml-1 flex size-9 items-center justify-center rounded-full bg-[#e8c7a3] text-xs font-bold text-[#68452d]">
              MA
            </div>
          </div>
        </div>
      </header> */}

      <div
        id="accueil"
        className="mx-auto max-w-[1440px] px-5 pb-16 pt-7 lg:px-10 lg:pt-10"
      >
        <section className="relative mb-[175px] min-h-[360px] overflow-visible rounded-[24px] bg-[#123b42] shadow-[0_14px_40px_rgba(18,59,66,.12)]">
          <img
            src="/images/banner2.png"
            alt="Les trois sociétés du groupe : T-Oil, STSL et COMPEL"
            className="absolute inset-0 size-full rounded-[24px] object-cover"
          />
          <div className="absolute inset-0 rounded-[24px] bg-gradient-to-t from-[#123b42]/80 via-transparent to-black/10" />
          <div className="relative flex min-h-[360px] items-end px-7 py-7 sm:px-10">
            <div
              className="absolute bottom-[-145px] left-7 z-10 w-[calc(100%-3.5rem)] max-w-md overflow-hidden rounded-2xl border border-white/70  bg-cover bg-center p-5 text-white shadow-[0_18px_35px_rgba(18,59,66,.22)] sm:left-10 sm:w-[calc(100%-5rem)]"
              style={{
                backgroundImage:
                  "url('/images/inter-rmbg.png')",
              }}
            >
              <div className="absolute inset-0 bg-emerald-300/45" />
              <div className="relative">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-red-700">
                  <Sparkles className="size-3.5" /> Espace collaboratif
                </span>
                <h1 className="mt-2 text-xl font-semibold leading-tight text-black tracking-[-.03em] sm:text-2xl">
                  Ensemble, faisons avancer nos idées.
                </h1>
                <p className="mt-2 text-sm leading-6 text-black/85">
                  Bienvenue dans l&apos;intranet de STSL, COMPEL et T-Oil.
                  Retrouvez vos outils, vos actualités et vos ressources au même
                  endroit.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href="#actualites"
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#123b42] transition hover:bg-[#f4eee7]"
                  >
                    Actualités <ArrowUpRight className="size-3.5" />
                  </a>
                  <a
                    href="#formations"
                    className="flex items-center gap-2 rounded-full border border-white/50 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    Formations
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="absolute bottom-7 right-8 hidden items-center gap-3 rounded-2xl border border-white/20 bg-black/15 px-4 py-3 backdrop-blur-md md:flex">
            <div className="flex -space-x-2">
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-[#568283] bg-[#d5a47d] text-[10px] font-bold text-white">
                JD
              </div>
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-[#568283] bg-[#8ca9a4] text-[10px] font-bold text-white">
                SK
              </div>
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-[#568283] bg-[#f0c497] text-[10px] font-bold text-white">
                +8
              </div>
            </div>
            <span className="text-xs text-white/80">
              Votre réseau est actif aujourd&apos;hui
            </span>
          </div> */}
        </section>

        <section className="mt-10" id="actualites">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[.18em] text-[#127c80]">
                Restez informé
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Les actualités du groupe
              </h2>
            </div>
            <Link href="/informations" className="hidden items-center gap-1 text-sm font-semibold text-[#127c80] sm:flex">
              Toutes les actualités <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {filteredNews.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${item.color}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.color}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[16px] font-semibold leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {item.desc}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" /> {item.date}
                    </span>
                    <button className="font-semibold text-[#127c80] opacity-0 transition group-hover:opacity-100">
                      Lire <ArrowUpRight className="ml-1 inline size-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}

            {/* {(newLoading && news.length ===0) ?
              
            (  <Loader/>):

          news.map((item, index) => (
      <NewsCard
        key={item.id || index} // Privilégiez une vraie ID si disponible plutôt que l'index
        title={item.titre}
        description={ item.description} // S'adapte selon votre structure de données
        imageUrl={item.imageUrl }
        publishDate={item.datePublication}
      />
    ))
  
          } */}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[.18em] text-[#127c80]">
                Votre quotidien
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Accès rapides
              </h2>
            </div>
            <Link href="/outils" className="flex items-center gap-1 text-sm font-semibold text-[#127c80]">
              Voir toutes les applications <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {apps.map((app,key) => (
              <Link
              href={app.href}
                key={key}
                onClick={() => setActiveApp(app.name)}
                className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${activeApp === app.name ? "border-[#127c80] ring-2 ring-[#127c80]/10" : "border-slate-200/80"}`}
              >
                <Image
                  className={`flex size-11 items-center justify-center rounded-xl text-lg font-bold ${app.color}`}
                  alt="app"
                  src={app.logo}
                  width={500}
                  height={500}
                />
                  {/* {app.icon}
                </span> */}
                <span>
                  <span className="block text-sm font-semibold">
                    {app.name}
                  </span>
                  <span className="text-xs text-slate-400">{app.desc}</span>
                </span>
                <ArrowUpRight className="ml-auto hidden size-4 text-slate-300 sm:block" />
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <section
            id="demandes"
            className="rounded-2xl border border-slate-200/80 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[.18em] text-[#127c80]">
                  Suivi personnel
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Mes demandes
                </h2>
              </div>
              <button
                className="rounded-full border border-slate-200 p-2 text-slate-400 hover:bg-slate-50"
                aria-label="Plus d'options"
              >
                <MoreHorizontal className="size-5" />
              </button>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {
                (loading && mesDemandes?.length ==0) ?
                (
                <div className="">
                <Loader/>
                </div>


                ):

            (  mesDemandes.map((request,key) => (
                <div
                  key={key}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <FileText className="size-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                    {`${request.typeDemande} : ${request.typeConge}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                       {request.titre}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatutColor(request.statutActuel)}`}
                  >
                    {getStatutText(request.statutActuel)}
                  </span>
                  <ChevronRight className="hidden size-4 text-slate-300 sm:block" />
                </div>
              )))
              
              }
            </div>
            <Link href={'/demandes/suivi'} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-semibold text-[#127c80] hover:bg-[#edf6f5]">
              Suivez votre demande<ArrowUpRight className="size-4" />
            </Link>
          </section>
          <section id="formations" className="rounded-2xl bg-[#e9f2f0] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[.18em] text-[#127c80]">
                  Mon espace d&apos;apprentissage
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Formations à la une
                </h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#127c80]">
                <GraduationCap className="size-5" />
              </div>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative h-28 overflow-hidden bg-[#15484b]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#15484b] to-[#2a7771]" />
                <div className="relative flex h-full items-center gap-4 px-5">
                  <div className="flex size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur">
                    <Video className="ml-0.5 size-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                      Guide pratique · 08 min
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-white">
                      Bien démarrer avec SharePoint
                    </h3>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock3 className="size-3.5" /> À voir cette semaine
                </span>
                <button className="flex items-center gap-1 text-xs font-semibold text-[#127c80]">
                  Regarder <ArrowUpRight className="size-3.5" />
                </button>
              </div>
            </div>
            <button className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#127c80]">
              Explorer le catalogue <ChevronRight className="size-4" />
            </button>
          </section>
        </div>
      </div>
    
    </main>
    </SingleLayout>
  );
}
