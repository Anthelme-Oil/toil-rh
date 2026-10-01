"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Edit3,
  Eye,
  FilePlus2,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { useUser } from "@/context/UserContext";
// import { publishMedia } from '@/lib/services/media.service';

import DataTable, { Column } from "@/components/tables/Datatable";

import MediaForm from "@/components/forms/MediaForm";

import MediaEditModal from "@/components/mediatheque/modals/MediaEditModal";
import MediaDeleteModal from "@/components/mediatheque/modals/MediaDeleteModal";

import PublishMediaModal from "@/components/mediatheque/modals/PublishMediaModal";

import {
  archiveMedia,
  getMediaList,
  publishMedia,
  restoreMedia,
} from "@/lib/services/media.service";
import { sendNotification } from "@/lib/services/notif.service";

import type {
  DocumentDepartment,
  MediaDocument,
  MediaDocumentFilters,
  MediaDocumentSort,
} from "@/types";
import { initGreffe } from "@/lib/services/com.service";
import { NotificationPayload } from "@/lib/notifications/types";

const DEPARTMENTS: Array<DocumentDepartment | "ALL"> = [
  "ALL",
  "IT",
  "COMMERCIAL",
  "FINANCE",
  "OPERATION",
  "RH",
  "DIRECTION",
  "JURIDIQUE",
];

type MediaStatus = "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";

const PAGE_SIZE = 10;

export default function GestionnaireMedia() {
  const { userEmail, userName, isAdmin, isCom } = useUser();

  const [documents, setDocuments] = useState<MediaDocument[]>([]);

  const [publishDocument, setPublishDocument] = useState<MediaDocument | null>(
    null,
  );

  const [publishing, setPublishing] = useState<boolean>(false);

  const [openPub, setOpenPub] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [department, setDepartment] = useState<DocumentDepartment | "ALL">(
    "ALL",
  );

  const [status, setStatus] = useState<MediaStatus>("ALL");

  const [sort, setSort] = useState<MediaDocumentSort>("LATEST");

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showCreate, setShowCreate] = useState(false);

  const [editingMedia, setEditingMedia] = useState<MediaDocument | null>(null);

  const [deletingMedia, setDeletingMedia] = useState<MediaDocument | null>(
    null,
  );

  const [actionLoading, setActionLoading] = useState<string | number | null>(
    null,
  );

  /*
   * Seuls l'admin et le COM peuvent accéder
   * au gestionnaire.
   *
   *
   *
   */
  const canManage = Boolean(isAdmin) || Boolean(isCom);

  /*
   * Vérifie si l'utilisateur peut modifier
   * un média donné.
   *
   * Admin :
   *   → tous les médias
   *
   * Auteur :
   *   → uniquement ses propres médias
   */
  const canEdit = useCallback(
    (media: MediaDocument) => {
      if (isAdmin) {
        return true;
      }

      if (!userEmail) {
        return false;
      }

      return media.author?.email?.toLowerCase() === userEmail.toLowerCase();
    },
    [isAdmin, userEmail],
  );

  /*
   * Chargement de la liste.
   */
  const loadMedia = useCallback(
    async (withRefreshLoader = false) => {
      if (withRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const filters: MediaDocumentFilters = {
          search: search.trim() || undefined,
          department,
          status,
        };

        const result = await getMediaList({
          page,
          limit: PAGE_SIZE,
          sort,
          filters,
        });

        setDocuments(result.documents);
        setTotal(result.total);
        setTotalPages(Math.max(1, result.totalPages));
      } catch (error) {
        console.error("Erreur lors du chargement des médias :", error);

        setDocuments([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [department, page, search, sort, status],
  );

  function handleOpenPublish(element: MediaDocument): void {
    setOpenPub(true);

    setPublishDocument(element);
  }

  /*
   * Chargement initial + lorsque les filtres
   * ou la pagination changent.
   */
  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    void loadMedia();
  }, [canManage, loadMedia]);

  /*
   * Lorsqu'un filtre change, on revient
   * toujours à la première page.
   */
  useEffect(() => {
    setPage(1);
  }, [search, department, status, sort]);

  /*
   * Publication.
   */
const handlePublish = async () => {
  console.log("🚀 [PUBLISH] Début handlePublish");

  if (!publishDocument) {
    console.warn("⚠️ [PUBLISH] publishDocument est null/undefined");
    return;
  }

  console.log("📄 [PUBLISH] Document :", publishDocument);

  if (!canEdit(publishDocument)) {
    console.warn("⛔ [PUBLISH] canEdit() retourne false");
    return;
  }

  console.log("✅ [PUBLISH] canEdit() retourne true");

  setActionLoading(publishDocument.id);
  setPublishing(true);

  try {
    // =========================================================
    // 1. PUBLIER LE MÉDIA
    // =========================================================
    console.log("1️⃣ [PUBLISH] Début publishMedia");
    console.log("➡️ [PUBLISH] ID média :", publishDocument.id);

    const publishPayload = {
      id: userEmail ?? undefined,
      name: userName || userEmail || "Utilisateur",
      email: userEmail ?? undefined,
    };

    console.log("➡️ [PUBLISH] Payload :", publishPayload);

    const publishResult = await publishMedia(
      publishDocument.id,
      publishPayload
    );

    console.log("✅ [PUBLISH] publishMedia réussi");
    console.log("📥 [PUBLISH] Résultat :", publishResult);

    // =========================================================
    // 2. ENVOYER LA NOTIFICATION
    // =========================================================
    console.log("2️⃣ [PUBLISH] Début sendNotification");

   const notificationPayload = {
  to: "",
  title: `Nouveau média publié : ${publishDocument.title}`,
  recipients: "ALL",
  subject: "Publication Intranet",
  message: `Le média « ${publishDocument.title} », de la catégorie « ${publishDocument.category} », vient d’être publié sur l’Intranet.${
    publishDocument.description
      ? `\n\n${publishDocument.description}`
      : ""
  }`,
  type: "MEDIA_CREATED",
} satisfies NotificationPayload;

    console.log(
      "➡️ [PUBLISH] Notification payload :",
      notificationPayload
    );

    const notificationResult = await sendNotification(
      notificationPayload
    );

    console.log("✅ [PUBLISH] sendNotification réussi");
    console.log("📥 [PUBLISH] Résultat notification :", notificationResult);

    // =========================================================
    // 3. INITIALISER LE GREFFE
    // =========================================================
    console.log("3️⃣ [PUBLISH] Début initGreffe");
    console.log("➡️ [PUBLISH] Média ID :", publishDocument.id);
    console.log("➡️ [PUBLISH] Type :", "MEDIA");

    const greffeResult = await initGreffe(
      publishDocument.id,
      "MEDIA"
    );

    console.log("✅ [PUBLISH] initGreffe réussi");
    console.log("📥 [PUBLISH] Résultat greffe :", greffeResult);

    // =========================================================
    // 4. RECHARGER LES MÉDIAS
    // =========================================================
    console.log("4️⃣ [PUBLISH] Début loadMedia(true)");

    const loadResult = await loadMedia(true);

    console.log("✅ [PUBLISH] loadMedia(true) réussi");
    console.log("📥 [PUBLISH] Résultat loadMedia :", loadResult);

    // =========================================================
    // 5. FERMER LA MODALE
    // =========================================================
    console.log("5️⃣ [PUBLISH] Fermeture de la fenêtre de publication");

    closePublish();

    console.log("🎉 [PUBLISH] PUBLICATION TERMINÉE AVEC SUCCÈS");

  } catch (error) {
    console.error("❌ [PUBLISH] ERREUR :", error);
    console.error("❌ [PUBLISH] Type erreur :", typeof error);

    if (error instanceof Error) {
      console.error("❌ [PUBLISH] Message :", error.message);
      console.error("❌ [PUBLISH] Stack :", error.stack);
    }

  } finally {
    console.log("🏁 [PUBLISH] finally");

    setActionLoading(null);
    setPublishing(false);

    console.log("🏁 [PUBLISH] États de chargement réinitialisés");
  }
};

  /*
   * Archivage.
   */
  const handleArchive = async (media: MediaDocument) => {
    if (!canEdit(media)) {
      return;
    }

    setActionLoading(media.id);

    try {
      await archiveMedia(media.id);
      await loadMedia(true);
    } catch (error) {
      console.error("Erreur lors de l'archivage :", error);
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * Restauration.
   */
  const handleRestore = async (media: MediaDocument) => {
    if (!canEdit(media)) {
      return;
    }

    setActionLoading(media.id);

    try {
      await restoreMedia(media.id);
      await loadMedia(true);
    } catch (error) {
      console.error("Erreur lors de la restauration :", error);
    } finally {
      setActionLoading(null);
    }
  };

  function closePublish(): void {
    setPublishDocument(null);
    setOpenPub(false);
  }

  /*
   * Après création.
   */
  const handleCreated = async () => {
    setShowCreate(false);
    setPage(1);

    await loadMedia(true);
  };

  /*
   * Après modification.
   */
  const handleUpdated = async () => {
    setEditingMedia(null);

    await loadMedia(true);
  };

  /*
   * Après suppression / archivage.
   */
  const handleDeleted = async () => {
    setDeletingMedia(null);

    await loadMedia(true);
  };

  /*
   * Colonnes du tableau.
   */
  const columns = useMemo<Column<MediaDocument>[]>(
    () => [
      {
        header: "Document",
        accessor: "title",
        cellClassName: "min-w-[300px]",
        render: (media) => (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
              <FileText size={18} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {media.title}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                {media.fileName}
              </p>
            </div>
          </div>
        ),
      },

      {
        header: "Département",
        accessor: "department",
        render: (media) => (
          <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            {media.department}
          </span>
        ),
      },

      {
        header: "Catégorie",
        accessor: "category",
        render: (media) => (
          <span className="text-sm text-slate-600">
            {media.category || "—"}
          </span>
        ),
      },

      {
        header: "Auteur",
        cellClassName: "min-w-[180px]",
        render: (media) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">
              {media.author?.name || "—"}
            </p>

            {media.author?.email && (
              <p className="truncate text-xs text-slate-400">
                {media.author.email}
              </p>
            )}
          </div>
        ),
      },

      {
        header: "Statut",
        accessor: "status",
        render: (media) => {
          const styles = {
            DRAFT: "border-amber-200 bg-amber-50 text-amber-700",
            PUBLISHED: "border-emerald-200 bg-emerald-50 text-emerald-700",
            ARCHIVED: "border-slate-200 bg-slate-100 text-slate-600",
          };

          const labels = {
            DRAFT: "Brouillon",
            PUBLISHED: "Publié",
            ARCHIVED: "Archivé",
          };

          return (
            <span
              className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium ${styles[media.status]}`}
            >
              {labels[media.status]}
            </span>
          );
        },
      },

      {
        header: "Consultations",
        accessor: "views",
        render: (media) => (
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Eye size={14} />
            {media.views}
          </div>
        ),
      },

      {
        header: "Téléchargements",
        accessor: "downloads",
        render: (media) => (
          <span className="text-sm text-slate-600">{media.downloads}</span>
        ),
      },

      {
        header: "Actions",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (media) => {
          const editable = canEdit(media);
          const busy = actionLoading === media.id;

          return (
            <div className="flex justify-end gap-1.5">
              {editable && media.status === "DRAFT" && (
                <button
                  type="button"
                  title="Publier"
                  disabled={busy}
                  onClick={() => void handleOpenPublish(media)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Upload size={15} />
                  )}
                </button>
              )}

              {editable && media.status === "PUBLISHED" && (
                <button
                  type="button"
                  title="Archiver"
                  disabled={busy}
                  onClick={() => void handleArchive(media)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Archive size={15} />
                  )}
                </button>
              )}

              {editable && media.status === "ARCHIVED" && (
                <button
                  type="button"
                  title="Restaurer"
                  disabled={busy}
                  onClick={() => void handleRestore(media)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <RefreshCw size={15} />
                  )}
                </button>
              )}

              {editable ? (
                <>
                  <button
                    type="button"
                    title="Modifier"
                    onClick={() => setEditingMedia(media)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    type="button"
                    title="Supprimer"
                    onClick={() => setDeletingMedia(media)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              ) : (
                <span
                  title="Seul l'auteur ou un administrateur peut modifier ce média"
                  className="flex h-8 w-8 items-center justify-center text-slate-300"
                >
                  <MoreHorizontal size={17} />
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [actionLoading, canEdit],
  );

  /*
   * Contrôle d'accès.
   */
  if (!canManage) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FileText size={22} />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-slate-800">
            Accès non autorisé
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Vous ne disposez pas des droits nécessaires pour accéder au
            gestionnaire de la médiathèque.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FileText size={16} />
              <span>Médiathèque</span>
              <span>/</span>
              <span>Gestionnaire</span>
            </div>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
              Gestion des médias
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Gérez les documents, publications et ressources de la médiathèque.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0d675f]"
          >
            <Plus size={17} />
            Nouveau média
          </button>
        </div>

        {/* Statistiques */}
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={total} />

          <StatCard
            label="Affichés"
            value={
              documents.filter((item) => item.status === "PUBLISHED").length
            }
            valueClassName="text-emerald-600"
          />

          <StatCard
            label="Brouillons"
            value={documents.filter((item) => item.status === "DRAFT").length}
            valueClassName="text-amber-600"
          />

          <StatCard
            label="Archivés"
            value={
              documents.filter((item) => item.status === "ARCHIVED").length
            }
            valueClassName="text-slate-500"
          />
        </div>

        {/* Filtres */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_190px_170px_180px_auto]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un document..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0f766e]"
              />
            </div>

            <select
              value={department}
              onChange={(event) =>
                setDepartment(event.target.value as DocumentDepartment | "ALL")
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#0f766e]"
            >
              {DEPARTMENTS.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "Tous les départements" : item}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as MediaStatus)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#0f766e]"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="DRAFT">Brouillons</option>
              <option value="PUBLISHED">Publiés</option>
              <option value="ARCHIVED">Archivés</option>
            </select>

            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as MediaDocumentSort)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#0f766e]"
            >
              <option value="LATEST">Plus récents</option>
              <option value="OLDEST">Plus anciens</option>
              <option value="MOST_VIEWED">Plus consultés</option>
              <option value="MOST_DOWNLOADED">Plus téléchargés</option>
              <option value="TITLE_ASC">Titre A → Z</option>
              <option value="TITLE_DESC">Titre Z → A</option>
            </select>

            <button
              type="button"
              onClick={() => void loadMedia(true)}
              disabled={refreshing}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : undefined}
              />
              Actualiser
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <DataTable
            data={documents}
            columns={columns}
            itemsOptions={[10, 20, 50]}
            hasSearch={false}
          />

          {loading && (
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 py-8 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Chargement des médias...
            </div>
          )}

          {!loading && documents.length === 0 && (
            <div className="border-t border-slate-100 px-6 py-12 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <FilePlus2 size={20} />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                Aucun média trouvé
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Modifiez vos critères de recherche ou créez un nouveau média.
              </p>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                Page {page} sur {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Précédent
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Création */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Nouveau média
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Ajouter une ressource à la médiathèque.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[calc(100vh-140px)] overflow-y-auto p-5">
              <MediaForm
                userEmail={userEmail}
                userName={userName}
                onSuccess={handleCreated}
                onCancel={() => setShowCreate(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modification */}
      {editingMedia && (
        <MediaEditModal
          media={editingMedia}
          userEmail={userEmail}
          userName={userName}
          isAdmin={isAdmin}
          onClose={() => setEditingMedia(null)}
          onSuccess={handleUpdated}
        />
      )}

      {openPub && (
        <PublishMediaModal
          document={publishDocument}
          open={openPub}
          onConfirm={handlePublish}
          onClose={closePublish}
          loading={publishing}
        />
      )}

      {/* Suppression */}
      {deletingMedia && (
        <MediaDeleteModal
          media={deletingMedia}
          onClose={() => setDeletingMedia(null)}
          onSuccess={handleDeleted}
        />
      )}
    </>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  valueClassName?: string;
}

function StatCard({
  label,
  value,
  valueClassName = "text-slate-800",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className={`mt-1 text-2xl font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}
