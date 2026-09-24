// @/app/(intranet)/execution/rh/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DataTable, { Column } from "@/components/tables/Datatable"; // <-- Import de votre DataTable et Column
import { 
  Loader2, 
  CheckCircle2, 
  FileSpreadsheet, 
  Download, 
  Clock, 
  CheckCircle, 
  Search,
  Filter,
  X,
  FileText
} from "lucide-react";
import { getAllRequests } from "@/lib/services/all-requestService";
import { RequestItem, WorkflowKey } from "@/types";
import { useUser } from "@/context/UserContext";
import { workflowDefinitions } from "@/lib/workflows/engine";
import ValidationHistoryPdf from "@/components/pdf/ValidationHistoryPdf";
import AttachmentCard from "@/components/AttachmentCard";

const REQUEST_TYPE_CONFIG: Record<string, { label: string; color: string; badgeBg: string; border: string }> = {
  ABSENCE: { label: "Absence / Congé", color: "text-blue-700", badgeBg: "bg-blue-50", border: "border-blue-200" },
  AVANCE: { label: "Avance sur salaire", color: "text-amber-700", badgeBg: "bg-amber-50", border: "border-amber-200" },
  NOTE_FRAIS: { label: "Note de frais", color: "text-purple-700", badgeBg: "bg-purple-50", border: "border-purple-200" },
  FORMATION: { label: "Formation", color: "text-indigo-700", badgeBg: "bg-indigo-50", border: "border-indigo-200" },
  DEFAULT: { label: "Autre demande", color: "text-slate-700", badgeBg: "bg-slate-50", border: "border-slate-200" },
};

export default function ValidationRhExecPage() {
  const [demandes, setDemandes] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedDemandeForAction, setSelectedDemandeForAction] = useState<{ id: string; type: string } | null>(null);
  const [pdfDemande, setPdfDemande] = useState<RequestItem | null>(null);

  const { hasAction: authAction } = useUser();

  const wkfKeys = Object.keys(workflowDefinitions) as WorkflowKey[];
  const sessionWithKeys: string[] = wkfKeys.map((wfk) => `${wfk}_PENDING_RH_EXEC`);
  const permissionsMap = authAction(sessionWithKeys);
 
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getAllRequests();

        if (Array.isArray(data)) {
          const rhExecDemandes = data.filter((d) => {
            return (
              d.statut?.toUpperCase() === "PENDING_RH_EXEC" ||
              d.nextStep?.statusMatcher === "PENDING_RH_EXEC"
            );
          });
          setDemandes(rhExecDemandes);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des demandes RH Exec:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const canAccessSection = (typeDemande: string): boolean => {
    const targetActionKey = `${typeDemande}_PENDING_RH_EXEC`;
    return Boolean(permissionsMap[targetActionKey]);
  };

  const accessibleDemandes = useMemo(() => {
    return demandes.filter((demande) => {
      const type = demande.typeDemande || "AUTRE";
      return canAccessSection(type);
    });
  }, [demandes, permissionsMap]);

  const openConfirmationModal = (demandeId: string, typeDemande: string) => {
    setSelectedDemandeForAction({ id: demandeId, type: typeDemande });
    setModalOpen(true);
  };

  const confirmAndExecuteValidation = async () => {
    if (!selectedDemandeForAction) return;

    const { id: demandeId } = selectedDemandeForAction;

    try {
      setModalOpen(false);

      const action = "VALIDATE";
      const commentaire = "Validation par la RH exécutante";

      const res = await fetch("/api/requests/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demandeId, action, commentaire }),
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.error || "Erreur lors de la validation de l'étape");
        return;
      }

      const demande = demandes.find((d) => d.id === demandeId);

      if (!demande) {
        alert("La demande validée est introuvable dans la liste.");
        return;
      }

      setPdfDemande(demande);
      setDemandes((prev) => prev.filter((d) => d.id !== demandeId));

      setSuccessMessage(`Le dossier ${demande.reference || demandeId} a été validé avec succès.`);
      setTimeout(() => setSuccessMessage(null), 6000);

    } catch (error) {
      console.error("Erreur lors de l'action de validation :", error);
      alert("Une erreur technique est survenue.");
    } finally {
      setSelectedDemandeForAction(null);
    }
  };

  const filteredDemandes = useMemo(() => {
    return accessibleDemandes.filter((d) => {
      const type = demandeType(d);
      if (selectedTypeFilter !== "ALL" && type !== selectedTypeFilter) {
        return false;
      }

      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        const matchRef = d.reference?.toLowerCase().includes(searchLower);
        const matchTitle = d.titre?.toLowerCase().includes(searchLower);
        const matchUser = d.nomDemandeur?.toLowerCase().includes(searchLower) || d.emailDemandeur?.toLowerCase().includes(searchLower);
        return matchRef || matchTitle || matchUser;
      }

      return true;
    });
  }, [accessibleDemandes, searchTerm, selectedTypeFilter]);

  function demandeType(d: RequestItem) {
    return d.typeDemande || "AUTRE";
  }

  const kpis = useMemo(() => {
    const total = accessibleDemandes.length;
    const typesCount = new Set(accessibleDemandes.map((d) => d.typeDemande)).size;
    return { total, typesCount };
  }, [accessibleDemandes]);

  // Définition des colonnes pour le DataTable réutilisable
  const columns: Column<RequestItem>[] = [
    {
      header: "Référence & Titre",
      render: (demande) => (
        <div>
          <div className="font-bold text-slate-900">{demande.reference || demande.id.slice(0, 8)}</div>
          <div className="text-xs text-slate-500 truncate max-w-xs">{demande.titre || "Sans titre"}</div>
        </div>
      )
    },
    {
      header: "Type de demande",
      render: (demande) => {
        const type = demande.typeDemande || "AUTRE";
        const config = REQUEST_TYPE_CONFIG[type] || REQUEST_TYPE_CONFIG.DEFAULT;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.badgeBg} ${config.color} ${config.border}`}>
            {demande?.typeDemande + (demande?.typeConge ? ' / ' + demande?.typeConge : '')}
          </span>
        );
      }
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
            fileName={`${demande.typeDemande}_${demande.reference}`}
            fileUrl={demande.pieceJointe}
          />
        ) : (
          <div className="font-medium text-slate-800">Aucune pièce jointe</div>
        )
      )
    },
    {
      header: "Date de soumission",
      render: (demande) => (
        <span className="text-slate-600 text-xs">
          {demande.creeLe ? new Date(demande.creeLe).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }) : "-"}
        </span>
      )
    },
    {
      header: "Action / Téléchargement",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (demande) => {
        const type = demande.typeDemande || "AUTRE";
        return (
          <button
            onClick={() => openConfirmationModal(demande.id, type)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all hover:scale-[1.02]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Valider & Télécharger</span>
          </button>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6 md:p-8 space-y-0 bg-slate-50/50 shadow-xs">
      
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" /> Espace Exécutant RH
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sessions de Validations & Reçus
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez rapidement l'ensemble des requêtes en attente d'exécution et téléchargez les historiques officiels.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
        <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dossiers en attente</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.total}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Catégories actives</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.typesCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recherche et Filtres */}
      <div className="bg-white p-4 border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrer par réf, titre, demandeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <button
            onClick={() => setSelectedTypeFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              selectedTypeFilter === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tous ({demandes.length})
          </button>
          {demandes?.map((demande, key) => {
            const type = demande?.typeDemande;
            const conge = demande?.typeConge;
            const config = REQUEST_TYPE_CONFIG[type] || REQUEST_TYPE_CONFIG.DEFAULT;
            return (
              <button
                key={key}
                onClick={() => setSelectedTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedTypeFilter === type ? "bg-emerald-600 text-white" : `${config.badgeBg}${config.color} hover:opacity-80`
                }`}
              >
                {type + (conge ? ' / ' + conge : '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Utilisation du Composant DataTable Réutilisable */}
      {filteredDemandes.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-0 shadow-xs p-16 text-center">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucune demande correspondante</h3>
          <p className="text-sm text-slate-400 mt-1">Aucun dossier ne correspond à vos critères de recherche ou filtres actuels.</p>
        </div>
      ) : (
        <DataTable 
          data={filteredDemandes} 
          columns={columns} 
          itemsOptions={[5, 10, 20, 50]} 
        />
      )}

      {/* Modal de Confirmation */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Confirmer la validation</h3>
              <p className="text-sm text-slate-500 mt-1">
                Êtes-vous sûr de vouloir valider ce dossier ? Cette action va clôturer l'étape en cours, mettre à jour le statut global et lancer automatiquement le téléchargement du reçu PDF.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmAndExecuteValidation}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Confirmer & Télécharger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Générateur PDF masqué / automatisé après validation réussie */}
     {pdfDemande && (
  <div className="mb-4">
    <ValidationHistoryPdf
      title="DEMANDE D’AUTORISATION D’ABSENCE"
      companyName="T-OIL / COMPEL / STSL"
      companySubtitle="Gestion des demandes RH"
      dateDebut={pdfDemande.dateDebut ?? undefined}
      dateFin={pdfDemande.dateFin ?? undefined}
      nbreJour={pdfDemande.nombreJours ?? undefined}
      motif={pdfDemande.typeConge ?? undefined}
      data={{
        reference:
          pdfDemande.reference ||
          pdfDemande.id.slice(0, 8).toUpperCase(),

        typeDemande: pdfDemande.typeDemande || "AUTRE",

        titre: pdfDemande.titre || "Sans titre",

        demandeur:
          pdfDemande.nomDemandeur ||
          pdfDemande.emailDemandeur ||
          "Utilisateur",

        dateSoumission: pdfDemande.creeLe
          ? new Date(pdfDemande.creeLe).toISOString()
          : "",

        statut: "VALIDÉ & EXÉCUTÉ",

        historique: Array.isArray(pdfDemande.historique)
          ? pdfDemande.historique
          : [],
      }}
      fileName={`Recu_Historique_${
        pdfDemande.reference || pdfDemande.id
      }`}
      buttonLabel="Télécharger le reçu PDF"
      onGenerated={() => setPdfDemande(null)}
    />
  </div>
)}

    </div>
  );
}