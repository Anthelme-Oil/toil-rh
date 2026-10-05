"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronRight, Plus, Loader2 } from "lucide-react";

import { publicationMeta, type NavKey } from "@/config/navigation";
import { PublicationType } from "@/types";
import { PublicationForm } from "@/components/forms/PubsForm";
import { useUser } from "@/context/UserContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Overview } from "./Overview";
import { Listing } from "./Listing";

import { DeleteConfirmationModal } from "./modals/DeleteConfirmationModal";
import { EditPublicationModal } from "./modals/EditPublicationModal";

import { actualitesClientService } from "@/lib/services/actualite.service";
import { evenementsClientService } from "@/lib/services/evenements.service";
import { videosClientService } from "@/lib/services/videos.service";
import { annoncesClientService } from "@/lib/services/annonces.service";

export function PublicationsPage() {
  const [active, setActive] = useState<NavKey>("overview");
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const { userName } = useUser();

  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modales d'édition et de suppression
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);

  // Chargement global parallélisé et optimisé
  const fetchPublications = useCallback(async () => {
    setLoading(true);
    try {
      const [actuRes, evtRes, vidRes, annRes] = await Promise.allSettled([
        actualitesClientService.getAll(),
        evenementsClientService.getAll(),
        videosClientService.getAll(),
        annoncesClientService.getAll(),
      ]);

      const formattedActu =
        actuRes.status === "fulfilled"
          ? actuRes.value.map((item) => ({
              ...item,
              givenType: "actualites" as const,
              title: item.titre,
              excerpt: item.description,
              date: new Date(item.datePublication).toLocaleDateString("fr-FR"),
              tag: item.categorie || "Institution",
            }))
          : [];

      const formattedEvt =
        evtRes.status === "fulfilled"
          ? evtRes.value.map((item) => ({
              ...item,
              givenType: "evenements" as const,
              title: item.titre,
              excerpt: item.description,
              date: new Date(item.dateDebut).toLocaleDateString("fr-FR"),
              tag: "Événement",
            }))
          : [];

      const formattedVid =
        vidRes.status === "fulfilled"
          ? vidRes.value.map((item) => ({
              ...item,
              givenType: "videos" as const,
              title: item.titre,
              excerpt: item.description,
              date: new Date(item.date).toLocaleDateString("fr-FR"),
              tag: item.categorie || "Média",
            }))
          : [];

     const formattedAnn =
  annRes.status === "fulfilled"
    ? annRes.value.map((item) => ({
        ...item,

        // Type de publication pour le système de listing
        givenType: "annonces" as const,

        // Type métier réel de l'annonce
        type: item.type,

        title: item.titre,
        excerpt: item.contenu,
        date: new Date(item.datePublication).toLocaleDateString("fr-FR"),
        tag: item.type.toUpperCase(),
      }))
    : [];

      setPublications([
        ...formattedActu,
        ...formattedEvt,
        ...formattedVid,
        ...formattedAnn,
      ]);
    } catch (err) {
      console.error("Erreur globale lors de la récupération des données", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  // Handler de suppression polymorphe selon le type
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const { id, givenType } = deletingItem;

    switch (givenType) {
      case "actualites":
        await actualitesClientService.delete(id);
        break;
      case "evenements":
        await evenementsClientService.delete(id);
        break;
      case "videos":
        await videosClientService.delete(id);
        break;
      case "annonces":
        await annoncesClientService.delete(id);
        break;
    }
    await fetchPublications();
  };

  const filtered = useMemo(
    () =>
      publications.filter((item) =>
        (item.title || item.titre || "")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query, publications]
  );

  const currentType =
    active === "overview" ? "actualites" : (active as PublicationType);
  const currentMeta = publicationMeta[currentType];
  const isOverview = active === "overview";

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active={active} setActive={setActive} setShowForm={setShowForm} />

        <section className="min-w-0 flex-1">
          <Header query={query} setQuery={setQuery} />

          <div className="mx-auto max-w-[1400px] p-5 sm:p-8">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span>Publication</span>
                  <ChevronRight size={14} />
                  <span className="text-slate-600">
                    {isOverview ? "Vue d’ensemble" : currentMeta.label}
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {isOverview
                    ? `Bonjour ${userName ? userName.split(" ")[1] || userName : ""}... `
                    : `Gérer vos ${currentMeta.label.toLowerCase()}`}
                  <span className="text-violet-600">
                    {isOverview ? "voici vos actualités." : "."}
                  </span>
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  {isOverview
                    ? "Pilotez vos contenus et gardez votre communauté informée en quelques clics."
                    : "Créez, organisez et publiez vos contenus depuis un espace unique."}
                </p>
              </div>

              {!isOverview && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700 transition"
                >
                  <Plus size={18} /> Nouvelle {currentMeta.singular}
                </button>
              )}
            </div>

            {showForm && (
              <div className="mb-7">
                <PublicationForm
                  type={currentType}
                  onClose={() => setShowForm(false)}
                  onSuccess={() => {
                    setShowForm(false);
                    fetchPublications();
                  }}
                />
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-violet-600" />
                <span className="text-sm font-medium">Chargement des données...</span>
              </div>
            ) : isOverview ? (
              <Overview filtered={filtered} setActive={setActive} />
            ) : (
              <Listing
                type={currentType}
                items={filtered.filter((item) => item.givenType === currentType)}
                onEdit={(item) => setEditingItem(item)}
                onDelete={(id) => {
                  const target = publications.find((p) => p.id === id);
                  if (target) setDeletingItem(target);
                }}
              />
            )}
          </div>
        </section>
      </div>

      {/* Modale de Modification Polymorphe */}
      {editingItem && (
        <EditPublicationModal
          type={editingItem.givenType || currentType}
          item={editingItem}
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            fetchPublications();
          }}
        />
      )}

      {/* Modale de Suppression Polymorphe */}
      {deletingItem && (
        <DeleteConfirmationModal
          title={deletingItem.titre || deletingItem.title || "l'élément"}
          isOpen={Boolean(deletingItem)}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </main>
  );
}