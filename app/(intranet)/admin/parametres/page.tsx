"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  Crown,
  UserRound,
} from "lucide-react";

import ParametreModal from "@/components/ParametreModal";
import ActionModal from "@/components/ActionModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import DataTable, {
  type Column,
} from "@/components/tables/Datatable";
import SwitchBar from "@/components/SwitchBar";

import { getSettings } from "@/lib/services/settingsService";
import { createSettings } from "@/lib/services/add-settingsService";
import { deleteSetting } from "@/lib/services/deleteSettingsService";

/* ============================================================================
   TYPES
============================================================================ */

interface ParametreItem {
  id: string | number;
  cle: string;
  valeur: string;
  description: string | null;
  misAJourLe: string;
}

interface UserItem {
  id: string;
  nom: string;
  email: string;
  role: "EMPLOYE" | "MANAGER" | "RH" | "ADMIN";
  emailManager: string | null;
  estRH: boolean;
  estCom: boolean;
  estDRH: boolean;
  estRHPrint: boolean;
  estGestionnaireSalle: boolean;
  departement: string | null;
  poste: string | null;
  creeLe: string | null;
  misAJourLe: string | null;
}

type RoleAction =
  | "ADMIN"
  | "MANAGER"
  | "RH"
  | "DRH"
  | "EMPLOYE"
  | "COM";

/* ============================================================================
   CONSTANTES
============================================================================ */

const ROLE_LABELS: Record<RoleAction, string> = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  RH: "RH",
  EMPLOYE: "EMPLOYE",
  DRH: "DRH",
  COM: "COM",
};

const ROLE_ACTIONS: RoleAction[] = [
  "ADMIN",
  "MANAGER",
  "RH",
  "EMPLOYE",
  "DRH",
  "COM",
];

/* ============================================================================
   NORMALISATION PARAMÈTRES
============================================================================ */

function normalizeParametres(
  data: unknown
): ParametreItem[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item: any) => ({
    id: item?.id ?? item?.cle ?? item?.key ?? "",
    cle: item?.cle ?? item?.key ?? "",
    valeur: item?.valeur ?? item?.value ?? "",
    description: item?.description ?? null,
    misAJourLe:
      item?.misAJourLe ??
      item?.updatedAt ??
      item?.updated_at ??
      new Date().toISOString(),
  }));
}

/* ============================================================================
   NORMALISATION UTILISATEURS
============================================================================ */

function normalizeUsers(
  data: unknown
): UserItem[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((user: any) => ({
    id: String(user?.id ?? ""),
    nom: user?.nom ?? "",
    email: user?.email ?? "",

    role:
      user?.role === "ADMIN"
        ? "ADMIN"
        : user?.role === "MANAGER"
          ? "MANAGER"
          : user?.role === "RH"
            ? "RH"
            : "EMPLOYE",

    emailManager:
      user?.emailManager ??
      user?.email_manager ??
      null,

    estRH: Boolean(
      user?.estRH ??
        user?.est_rh
    ),

    estCom: Boolean(
      user?.estCom ??
        user?.est_com
    ),

    estDRH: Boolean(
      user?.estDRH ??
        user?.est_drh
    ),

    estRHPrint: Boolean(
      user?.estRHPrint ??
        user?.est_rh_print
    ),

    estGestionnaireSalle: Boolean(
      user?.estGestionnaireSalle ??
        user?.est_gestionnaire_salle
    ),

    departement:
      user?.departement ?? null,

    poste:
      user?.poste ?? null,

    creeLe:
      user?.creeLe ??
      user?.cree_le ??
      null,

    misAJourLe:
      user?.misAJourLe ??
      user?.mis_a_jour_le ??
      null,
  }));
}

/* ============================================================================
   NOM UTILISATEUR
============================================================================ */

function getUserName(
  user: UserItem
): string {
  return user.nom?.trim() || user.email;
}

/* ============================================================================
   RÔLE PRINCIPAL
============================================================================ */

function getUserPrimaryRole(
  user: UserItem
):
  | "ADMIN"
  | "DRH"
  | "RH"
  | "MANAGER"
  | "EMPLOYE" {
  if (user.role === "ADMIN") {
    return "ADMIN";
  }

  if (user.estDRH) {
    return "DRH";
  }

  if (
    user.role === "RH" ||
    user.estRH
  ) {
    return "RH";
  }

  if (user.role === "MANAGER") {
    return "MANAGER";
  }

  return "EMPLOYE";
}

/* ============================================================================
   API UTILISATEURS
============================================================================ */

async function fetchUsersApi(): Promise<UserItem[]> {
  const response = await fetch(
    "/api/users",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de récupérer les utilisateurs."
    );
  }

  const res = await response.json();


  if(res?.success){
return normalizeUsers(res?.data);
  }else {
    return []
  }


  
}

async function updateUserRoleApi(
  userId: string,
  action: RoleAction
): Promise<void> {
  const response = await fetch(
    "/api/users",
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        userId,
        action,
      }),
    }
  );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "Impossible de modifier le rôle de cet utilisateur."
    );
  }
}

/* ============================================================================
   PAGE
============================================================================ */

export default function WorkflowParametresPage() {
  const [defaultKey, setDefaultKey] =
    useState("attr_per");

  /* ==========================================================================
     PARAMÈTRES
  ========================================================================== */

  const [parametres, setParametres] =
    useState<ParametreItem[]>([]);

  const [
    loadingParametres,
    setLoadingParametres,
  ] = useState(true);

  const [
    isParametreModalOpen,
    setIsParametreModalOpen,
  ] = useState(false);

  const [editingParam, setEditingParam] =
    useState<ParametreItem | null>(null);

  const [openDelete, setOpenDelete] =
    useState(false);

  const [itemKey, setItemKey] =
    useState<string | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  /* ==========================================================================
     UTILISATEURS
  ========================================================================== */

  const [users, setUsers] =
    useState<UserItem[]>([]);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  /* ==========================================================================
     CONFIRMATION RÔLE
  ========================================================================== */

  const [
    confirmationOpen,
    setConfirmationOpen,
  ] = useState(false);

  const [selectedUser, setSelectedUser] =
    useState<UserItem | null>(null);

  const [
    selectedAction,
    setSelectedAction,
  ] = useState<RoleAction | null>(null);

  const [
    isUpdatingRole,
    setIsUpdatingRole,
  ] = useState(false);

  /* ==========================================================================
     MESSAGES
  ========================================================================== */

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const showSuccess = (
    message: string
  ) => {
    setSuccessMessage(message);
    setErrorMessage(null);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);
  };

  const showError = (
    message: string
  ) => {
    setErrorMessage(message);
    setSuccessMessage(null);

    setTimeout(() => {
      setErrorMessage(null);
    }, 4500);
  };

  /* ==========================================================================
     CHARGEMENT INITIAL
  ========================================================================== */

  useEffect(() => {
    fetchParametres();
  }, []);

  useEffect(() => {
    if (defaultKey === "attr_rol") {
      fetchUsers();
    }
  }, [defaultKey]);

  /* ==========================================================================
     PARAMÈTRES
  ========================================================================== */

  const fetchParametres = async () => {
    setLoadingParametres(true);

    try {
      const data = await getSettings();

      setParametres(
        normalizeParametres(data)
      );
    } catch {
      setParametres([]);

      showError(
        "Impossible de charger les paramètres."
      );
    } finally {
      setLoadingParametres(false);
    }
  };

  /* ==========================================================================
     UTILISATEURS
  ========================================================================== */

  const fetchUsers = async () => {
    setLoadingUsers(true);

    try {
      const data =
        await fetchUsersApi();

      setUsers(data);
    } catch {
      setUsers([]);

      showError(
        "Impossible de charger les utilisateurs."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  /* ==========================================================================
     PARAMÈTRE : CRÉATION / MODIFICATION
  ========================================================================== */

  const handleOpenCreate = () => {
    setEditingParam(null);
    setIsParametreModalOpen(true);
  };

  const handleOpenEdit = (
    item: ParametreItem
  ) => {
    setEditingParam(item);
    setIsParametreModalOpen(true);
  };

  const handleSaveParametre = async ({
    cle,
    valeur,
    description,
  }: {
    cle: string;
    valeur: string;
    description: string;
  }) => {
    try {
      const savedParam =
        await createSettings({
          cle,
          valeur,
          description,
        });

      setParametres((prev) => {
        const existingIndex =
          prev.findIndex(
            (item) =>
              item.cle === cle
          );

        const normalized: ParametreItem =
          {
            id:
              savedParam?.id ??
              cle,

            cle:
              savedParam?.cle ??
              cle,

            valeur:
              savedParam?.valeur ??
              valeur,

            description:
              savedParam?.description ??
              description ??
              null,

            misAJourLe:
              savedParam?.miseAJour ??
              new Date().toISOString(),
          };

        if (existingIndex !== -1) {
          const updated = [
            ...prev,
          ];

          updated[
            existingIndex
          ] = normalized;

          return updated;
        }

        return [
          ...prev,
          normalized,
        ];
      });

      setIsParametreModalOpen(
        false
      );

      showSuccess(
        `Configuration « ${cle} » enregistrée avec succès.`
      );
    } catch {
      showError(
        "Impossible d'enregistrer la configuration."
      );
    }
  };

  /* ==========================================================================
     PARAMÈTRE : SUPPRESSION
  ========================================================================== */

  const handleOpenDelete = (
    item: ParametreItem
  ) => {
    setItemKey(item.cle);
    setOpenDelete(true);
  };

  const handleConfirmDelete =
    async () => {
      if (!itemKey) {
        return;
      }

      setIsDeleting(true);

      try {
        await deleteSetting(
          itemKey
        );

        setParametres((prev) =>
          prev.filter(
            (item) =>
              item.cle !== itemKey
          )
        );

        showSuccess(
          `Configuration « ${itemKey} » supprimée avec succès.`
        );

        setOpenDelete(false);
        setItemKey(null);
      } catch {
        showError(
          "Impossible de supprimer cette configuration."
        );
      } finally {
        setIsDeleting(false);
      }
    };

  /* ==========================================================================
     RÔLES : VÉRIFICATION ACTION
  ========================================================================== */

  const isRoleActionDisabled = (
    user: UserItem,
    action: RoleAction
  ): boolean => {
    const primaryRole =
      getUserPrimaryRole(user);

    switch (action) {
      case "ADMIN":
        return primaryRole === "ADMIN";

      case "MANAGER":
        return primaryRole === "MANAGER";

      case "RH":
        return user.estRH;

      case "DRH":
        return user.estDRH;

      case "COM":
        return user.estCom;

      case "EMPLOYE":
         return primaryRole === "ADMIN";

      default:
        return false;
    }
  };

  /* ==========================================================================
     RÔLES : OUVERTURE CONFIRMATION
  ========================================================================== */

  const handleRoleClick = (
    user: UserItem,
    action: RoleAction
  ) => {
    if (
      isRoleActionDisabled(
        user,
        action
      )
    ) {
      return;
    }

    setSelectedUser(user);
    setSelectedAction(action);
    setConfirmationOpen(true);
  };

  /* ==========================================================================
     RÔLES : FERMETURE CONFIRMATION
  ========================================================================== */

  const handleCloseRoleConfirmation =
    () => {
      if (isUpdatingRole) {
        return;
      }

      setConfirmationOpen(false);
      setSelectedUser(null);
      setSelectedAction(null);
    };

  /* ==========================================================================
     RÔLES : CONFIRMATION
  ========================================================================== */

  const handleConfirmRoleChange =
    async () => {
      if (
        !selectedUser ||
        !selectedAction
      ) {
        return;
      }

      setIsUpdatingRole(true);

      try {
        await updateUserRoleApi(
          selectedUser.id,
          selectedAction
        );

        await fetchUsers();

        showSuccess(
          `${getUserName(selectedUser)} a reçu l'attribution ${ROLE_LABELS[selectedAction]}.`
        );

        setConfirmationOpen(false);
        setSelectedUser(null);
        setSelectedAction(null);
      } catch (error) {
        showError(
          error instanceof Error
            ? error.message
            : "Impossible de modifier le rôle de cet utilisateur."
        );
      } finally {
        setIsUpdatingRole(false);
      }
    };

  /* ==========================================================================
     COLONNES UTILISATEURS
     
     IMPORTANT :
     Ton DataTable utilise :
       accessor
       render

     et non :
       accessorKey
       cell
  ========================================================================== */

  const userColumns: Column<UserItem>[] =
    useMemo(
      () => [
        {
          header: "Utilisateur",
          accessor: "email",

          render: (
            user: UserItem
          ) => (
            <div className="min-w-0">
              <div className="font-medium text-[#14171C] truncate">
                {getUserName(user)}
              </div>

              <div className="text-xs text-[#8A887F] truncate">
                {user.email}
              </div>
            </div>
          ),
        },

        {
          header: "Département",
          accessor: "departement",

          render: (
            user: UserItem
          ) => (
            <span className="text-sm text-[#54524C]">
              {user.departement ||
                "—"}
            </span>
          ),
        },

        {
          header: "Rôle",
          accessor: "role",

          render: (
            user: UserItem
          ) => {
            const primaryRole =
              getUserPrimaryRole(
                user
              );

            return (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F0EFEA] text-xs font-medium text-[#14171C]">
                  <ShieldCheck className="w-3 h-3" />

                  {primaryRole}
                </span>

                {user.estCom && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#EEF3FA] text-xs font-medium text-[#25406B]">
                    COM
                  </span>
                )}
              </div>
            );
          },
        },

        {
          header: "Attribution",
          headerClassName:
            "min-w-[420px]",
          cellClassName:
            "min-w-[420px]",

          render: (
            user: UserItem
          ) => (
            <div className="flex flex-wrap gap-1.5">
              {ROLE_ACTIONS.map(
                (action) => {
                  const disabled =
                    isRoleActionDisabled(
                      user,
                      action
                    );

                  return (
                    <button
                      key={action}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        handleRoleClick(
                          user,
                          action
                        )
                      }
                      className={`
                        px-2.5
                        py-1.5
                        rounded
                        text-[11px]
                        font-medium
                        border
                        transition
                        ${
                          disabled
                            ? "bg-[#14171C] text-white border-[#14171C] cursor-not-allowed"
                            : "bg-white text-[#54524C] border-[#E4E2DC] hover:border-[#25406B] hover:text-[#25406B]"
                        }
                      `}
                    >
                      {ROLE_LABELS[action]}
                    </button>
                  );
                }
              )}
            </div>
          ),
        },
      ],
      []
    );

  /* ==========================================================================
     DONNÉES
  ========================================================================== */

  const existingKeys =
    parametres.map(
      (item) => item.cle
    );

  const totalParametres =
    parametres.length;

  const barItems = [
    {
      key: "attr_per",
      label: "Attribution des permissions",
    },
    {
      key: "attr_rol",
      label: "Attribution des rôles",
    },
  ];

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-full mx-auto px-6 py-12">

        {/* ================================================================
            SWITCH BAR
        ================================================================ */}

        <SwitchBar
          onChange={setDefaultKey}
          defaultKey={defaultKey}
          items={barItems}
        />

        {/* ================================================================
            MESSAGES
        ================================================================ */}

        {successMessage && (
          <div className="mt-6 px-4 py-3 bg-[#0F7A5C]/[0.06] border border-[#0F7A5C]/20 text-[#0F7A5C] text-xs rounded flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />

            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
            {errorMessage}
          </div>
        )}

        {/* ================================================================
            ATTRIBUTION DES PARAMÈTRES
        ================================================================ */}

        {defaultKey === "attr_per" && (
          <>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-10 mb-10">
              <div>
                <h1 className="text-[22px] font-semibold text-[#14171C] tracking-tight">
                  Paramètres & attributions
                </h1>

                <p className="text-sm text-[#6B6B65] mt-1.5 max-w-md leading-relaxed">
                  Les adresses e-mail
                  ci-dessous déterminent les
                  responsables des différentes
                  étapes du workflow.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    fetchParametres
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#54524C] border border-[#E4E2DC] rounded hover:bg-[#FAFAF8] transition"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      loadingParametres
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Actualiser
                </button>

                <button
                  type="button"
                  onClick={
                    handleOpenCreate
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#25406B] rounded hover:bg-[#1d3357] transition"
                >
                  <Plus className="w-3.5 h-3.5" />

                  Nouvelle configuration
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E4E2DC] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
                <h2 className="text-[13px] font-medium text-[#14171C]">
                  Attributions enregistrées
                </h2>

                <span className="text-[11px] text-[#9C9A92]">
                  {totalParametres} clé
                  {totalParametres >
                  1
                    ? "s"
                    : ""}
                </span>
              </div>

              <div className="divide-y divide-[#EFEEE9]">
                {loadingParametres ? (
                  <div className="p-10 text-center text-sm text-[#9C9A92]">
                    Chargement…
                  </div>
                ) : parametres.length ===
                  0 ? (
                  <div className="p-10 text-center text-sm text-[#9C9A92]">
                    Aucune configuration
                    pour le moment.
                  </div>
                ) : (
                  parametres.map(
                    (param) => (
                      <div
                        key={
                          param.cle
                        }
                        className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-[#FAFAF8] transition"
                      >
                        <div className="md:w-[38%] min-w-0">
                          <code className="text-[12px] font-mono font-medium text-[#14171C] bg-[#F0EFEA] px-1.5 py-0.5 rounded">
                            {param.cle}
                          </code>

                          <p className="text-xs text-[#8A887F] mt-1.5 leading-relaxed">
                            {param.description ||
                              "Aucune description."}
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            readOnly
                            value={
                              param.valeur
                            }
                            className="w-full px-3 py-2 text-[13px] font-mono bg-[#FAFAF8] border border-[#E4E2DC] rounded text-[#14171C]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEdit(
                              param
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#54524C] border border-[#E4E2DC] rounded hover:bg-white transition"
                        >
                          <Pencil className="w-3 h-3" />

                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenDelete(
                              param
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#54524C] border border-[#E4E2DC] rounded hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3 h-3" />

                          Suppr.
                        </button>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </>
        )}

        {/* ================================================================
            ATTRIBUTION DES RÔLES
        ================================================================ */}

        {defaultKey === "attr_rol" && (
          <>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-10 mb-8">
              <div>
                <h1 className="text-[22px] font-semibold text-[#14171C] tracking-tight">
                  Attribution des rôles
                </h1>

                <p className="text-sm text-[#6B6B65] mt-1.5 max-w-xl leading-relaxed">
                  Gérez les rôles et
                  permissions des utilisateurs
                  enregistrés dans la base de
                  données interne.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchUsers}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#54524C] border border-[#E4E2DC] rounded hover:bg-[#FAFAF8] transition self-start"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    loadingUsers
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Actualiser
              </button>
            </div>

            {/* ============================================================
                STATISTIQUES
            ============================================================ */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">

              <div className="border border-[#E4E2DC] rounded p-4 bg-white">
                <Users className="w-4 h-4 text-[#25406B] mb-3" />

                <div className="text-xl font-semibold text-[#14171C]">
                  {users.length}
                </div>

                <div className="text-xs text-[#8A887F] mt-1">
                  Utilisateurs
                </div>
              </div>

              <div className="border border-[#E4E2DC] rounded p-4 bg-white">
                <Crown className="w-4 h-4 text-[#25406B] mb-3" />

                <div className="text-xl font-semibold text-[#14171C]">
                  {
                    users.filter(
                      (user) =>
                        getUserPrimaryRole(
                          user
                        ) === "ADMIN"
                    ).length
                  }
                </div>

                <div className="text-xs text-[#8A887F] mt-1">
                  Administrateurs
                </div>
              </div>

              <div className="border border-[#E4E2DC] rounded p-4 bg-white">
                <ShieldCheck className="w-4 h-4 text-[#25406B] mb-3" />

                <div className="text-xl font-semibold text-[#14171C]">
                  {
                    users.filter(
                      (user) =>
                        user.estDRH ||
                        user.estRH
                    ).length
                  }
                </div>

                <div className="text-xs text-[#8A887F] mt-1">
                  RH / DRH
                </div>
              </div>

              <div className="border border-[#E4E2DC] rounded p-4 bg-white">
                <UserRound className="w-4 h-4 text-[#25406B] mb-3" />

                <div className="text-xl font-semibold text-[#14171C]">
                  {
                    users.filter(
                      (user) =>
                        user.estCom
                    ).length
                  }
                </div>

                <div className="text-xs text-[#8A887F] mt-1">
                  Communication
                </div>
              </div>

            </div>

            {/* ============================================================
                TABLE
            ============================================================ */}

            <div className="bg-white border border-[#E4E2DC] overflow-hidden">
              {loadingUsers ? (
                <div className="p-12 text-center text-sm text-[#9C9A92]">
                  Chargement des
                  utilisateurs…
                </div>
              ) : (
                <DataTable<UserItem>
                  data={users}
                  columns={userColumns}
                  itemsOptions={[
                    5,
                    10,
                    25,
                    50,
                    100,
                  ]}

                  hasSearch={true}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* ================================================================
          MODAL PARAMÈTRE
      ================================================================ */}

      <ParametreModal
        isOpen={
          isParametreModalOpen
        }
        onClose={() =>
          setIsParametreModalOpen(
            false
          )
        }
        onSave={
          handleSaveParametre
        }
        existingKeys={
          existingKeys
        }
        editingParam={
          editingParam
        }
      />

      {/* ================================================================
          SUPPRESSION PARAMÈTRE
      ================================================================ */}

      <ActionModal
        isOpen={openDelete}
        onClose={() =>
          setOpenDelete(false)
        }
        onConfirm={
          handleConfirmDelete
        }
        requestTitle="Suppression d'une clé de paramètre"
        loading={isDeleting}
        actionType="DELETE"
      />

      {/* ================================================================
          CONFIRMATION RÔLE
      ================================================================ */}

      <ConfirmationModal
        isOpen={
          confirmationOpen
        }
        onClose={
          handleCloseRoleConfirmation
        }
        onConfirm={
          handleConfirmRoleChange
        }
        title={
          selectedUser &&
          selectedAction
            ? `Attribuer ${ROLE_LABELS[selectedAction]}`
            : "Confirmation"
        }
        message={
          selectedUser &&
          selectedAction
            ? `Voulez-vous vraiment attribuer ${ROLE_LABELS[selectedAction]} à ${getUserName(selectedUser)} ?`
            : ""
        }
        confirmText="Confirmer"
        cancelText="Annuler"
        loading={
          isUpdatingRole
        }
      />
    </div>
  );
}