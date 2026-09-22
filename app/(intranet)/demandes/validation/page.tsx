"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, ShieldCheck, Search, Filter, FileText, Eye, Check, X, AlertCircle } from "lucide-react";
import ActionModal from "@/components/ActionModal";
import RequestDetailsModal from "@/components/RequestDetailsModal";
import { getN1Validate } from "@/lib/services/n1-validate";
import { RequestItem } from "@/types";
import DataTable, { Column } from "@/components/tables/Datatable";
import AttachmentCard from "@/components/AttachmentCard";

export default function ValidationDemandesPage() {
  const [demandes, setDemandes] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // États de notification douce (remplace les alertes)
  const [notification, setNotification] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // États de filtrage
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");

  // Gestion de la modale d'action (Approuver / Rejeter)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    demandeId: string | null;
    actionType: "VALIDATE" | "REJECT" | null;
  }>({
    isOpen: false,
    demandeId: null,
    actionType: null,
  });

  // Gestion de la modale de détails
  const [selectedDetailsDemande, setSelectedDetailsDemande] = useState<RequestItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fonction utilitaire pour afficher les notifications temporaires
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: "" });
    }, 5000); // Disparaît après 5 secondes
  };

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const data = await getN1Validate();
      
      if (Array.isArray(data)) {
        const n1Demandes = data.filter((d) => {
          const isStatusN1 = d.statut?.toUpperCase() === "PENDING_N1";
          const isNextStepN1 = d.nextStep?.statusMatcher === "PENDING_N1" || d.nextStep?.role?.includes("N+1");
          return isStatusN1 || isNextStepN1;
        });
        setDemandes(n1Demandes);
      }
    } catch (error) {
      console.error("Erreur chargement validations N+1:", error);
      showNotification("error", "Impossible de charger les demandes en attente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const filteredDemandes = useMemo(() => {
    return demandes.filter((d) => {
      const matchQuery =
        d.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.reference && d.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.emailDemandeur.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === "ALL" || d.typeDemande === selectedType;

      return matchQuery && matchType;
    });
  }, [demandes, searchQuery, selectedType]);

  const availableTypes = useMemo(() => {
    return Array.from(new Set(demandes.map((d) => d.typeDemande)));
  }, [demandes]);

  const openActionModal = (demandeId: string, actionType: "VALIDATE" | "REJECT") => {
    const demande = demandes.find((d) => d.id === demandeId);
    if (!demande || (demande.statut?.toUpperCase() !== "PENDING_N1" && demande.nextStep?.statusMatcher !== "PENDING_N1")) {
      showNotification("error", "Cette demande n'est plus disponible pour validation.");
      fetchPendingRequests();
      return;
    }
    setModalConfig({ isOpen: true, demandeId, actionType });
  };

  const handleConfirmAction = async (commentaire: string) => {
    const { demandeId, actionType: action } = modalConfig;
    if (!demandeId || !action) return;

    try {
      setProcessingId(demandeId);
      const res = await fetch("/api/requests/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demandeId, action, commentaire }),
      });

      const json = await res.json();
      if (json.success) {
        setDemandes((prev) => prev.filter((d) => d.id !== demandeId));
        setModalConfig({ isOpen: false, demandeId: null, actionType: null });
        showNotification("success", action === "VALIDATE" ? "Demande validée avec succès." : "Demande rejetée avec succès.");
      } else {
        showNotification("error", json.error || "Une erreur est survenue lors de l'action.");
        fetchPendingRequests();
      }
    } catch (error) {
      console.error("Erreur action validation N+1:", error);
      showNotification("error", "Une erreur technique est survenue.");
    } finally {
      setProcessingId(null);
    }
  };

  // Définition des colonnes pour le DataTable
  const columns: Column<RequestItem>[] = [
    {
      header: "Référence & Titre",
      render: (demande) => (
        <div>
          <div className="font-bold text-[#10192E]">{demande.reference || demande.id.slice(0, 8)}</div>
          <div className="text-xs text-slate-500 truncate max-w-xs">{demande.titre || "Sans titre"}</div>
        </div>
      )
    },
    {
      header: "Type",
      render: (demande) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#A9782F]/10 text-[#A9782F]">
          {demande.typeDemande}
        </span>
      )
    },
    {
      header: "Demandeur",
      render: (demande) => (
        <div>
          <div className="font-medium text-slate-800">{demande.nomDemandeur || "Utilisateur"}</div>
          <div className="text-xs text-slate-400">{demande.emailDemandeur}</div>
        </div>
      )
    },
    {
      header: "Pièce jointe",
      render: (demande) => (
        demande.pieceJointe ? (
          <AttachmentCard
            fileName={`${demande.typeDemande}_${demande.reference || 'piece'}`}
            fileUrl={demande.pieceJointe}
          />
        ) : (
          <span className="text-xs text-slate-400 italic">Aucune</span>
        )
      )
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (demande) => {
        const isProcessing = processingId === demande.id;

        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setSelectedDetailsDemande(demande);
                setIsDetailsOpen(true);
              }}
              title="Voir les détails"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => openActionModal(demande.id, "VALIDATE")}
              disabled={isProcessing}
              title="Valider"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Valider</span>
            </button>

            <button
              onClick={() => openActionModal(demande.id, "REJECT")}
              disabled={isProcessing}
              title="Rejeter"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Rejeter</span>
            </button>
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#F7F7F5]">
        <Loader2 className="w-7 h-7 animate-spin text-[#A9782F]" />
      </div>
    );
  }

  const selectedDemandeForModal = demandes.find((d) => d.id === modalConfig.demandeId);

  return (
    <div className="bg-slate-50 shadow-xs min-h-screen">
      <style jsx global>{`
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
      
      <div className="max-w-full mx-auto px-6 md:px-10 py-10 md:py-14 space-y-6">
        
        {/* Encart de notification soft (succès / erreur) */}
        {notification.type && (
          <div
            className={`flex items-center justify-between p-4 rounded-xl border text-sm transition-all animate-fadeIn ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification({ type: null, message: "" })}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* En-tête de la page */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#10192E]/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#A9782F]" />
              <p className="text-xs font-medium text-[#A9782F] tracking-wide">Validation Hiérarchique N+1</p>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#10192E] tracking-tight">
              Demandes de votre équipe
            </h1>
            <p className="text-sm text-slate-500 max-w-md">
              Traitez les requêtes dont la prochaine étape active requiert votre validation hiérarchique.
            </p>
          </div>

          <div className="text-xs font-medium text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-[#10192E]/8 shadow-2xs shrink-0">
            En attente (N1) : <span className="font-serif text-base font-bold text-[#10192E] ml-1">{demandes.length}</span>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white p-4 rounded-xl border border-[#10192E]/8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par réf, titre ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A9782F]/20 focus:border-[#A9782F] text-slate-700"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600 shrink-0">Type :</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A9782F]/20 focus:border-[#A9782F] text-slate-700 font-medium"
            >
              <option value="ALL">Tous les types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau Réutilisable DataTable */}
        {filteredDemandes.length === 0 ? (
          <div className="bg-white border border-[#10192E]/8 rounded-xl p-16 text-center shadow-2xs">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-4 stroke-[1.3]" />
            <h3 className="font-serif text-lg text-[#10192E]">Aucune demande en attente</h3>
            <p className="text-sm text-slate-400 mt-1">Votre périmètre hiérarchique est parfaitement à jour.</p>
          </div>
        ) : (
          <DataTable
            data={filteredDemandes}
            columns={columns}
            itemsOptions={[5, 10, 20]}
          />
        )}
      </div>

      {/* Modale de validation / rejet */}
     {selectedDemandeForModal && ( <ActionModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, demandeId: null, actionType: null })}
        onConfirm={handleConfirmAction}
        actionType={modalConfig.actionType}
        requestTitle={selectedDemandeForModal.titre}
        loading={processingId !== null}
      />)}

      {/* Modale dédiée aux détails de la demande */}
      <RequestDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedDetailsDemande(null);
        }}
        demande={selectedDetailsDemande}
      />
    </div>
  );
}