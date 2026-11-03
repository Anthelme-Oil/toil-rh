// @/app/validation-rh-exec/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, ShieldAlert, CheckCircle, FileSpreadsheet } from "lucide-react";
import { getMyRequests } from "@/lib/services/my-requests";
import RhExecRequestCard from "@/components/RhExecRequestCard";

import { RequestItem } from "@/types";

export default function ValidationRhExecPage() {
  const [demandes, setDemandes] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userSession, setUserSession] = useState<any>(null);

  // Simulation / Récupération de la session utilisateur et de ses actions/rôles
  // Adaptez selon votre hook d'authentification (ex: useSession de NextAuth)
  useEffect(() => {
    async function loadSessionAndData() {
      try {
        setLoading(true);
        // Exemple d'appel pour récupérer la session (ou via votre provider)
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        setUserSession(sessionData?.user || { role: "USER", actions: [] });

        // Récupération de toutes les demandes via le service unifié
        const data = await getMyRequests();
        if (Array.isArray(data)) {
          // Filtrage global : ne garder que les demandes dont le nextStep est PENDING_RH_EXEC
          const rhExecDemandes = data.filter((d) => {
            return (
              d.statut?.toUpperCase() === "PENDING_RH_EXEC" ||
              d.nextStep?.statusMatcher === "PENDING_RH_EXEC"
            );
          });
          setDemandes(rhExecDemandes);
        }
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSessionAndData();
  }, []);

  // Fonction de vérification des permissions (gère le tableau de clés + Admin global)
  const hasAction = (actionKeys: string[]): boolean => {
    if (!userSession) return false;
    const role = (userSession.role || "").toUpperCase();
    
    // Si l'utilisateur est Admin, il a tous les droits
    if (role.includes("ADMIN") || role.includes("SUPER_ADMIN")) {
      return true;
    }

    const userActions: string[] = userSession.actions || [];
    // Vérifie si l'utilisateur possède au moins une des actions requises dans le tableau
    return actionKeys.some((action) => userActions.includes(action));
  };

  // Traitement du téléchargement du reçu d'historique et validation de l'étape
  const handleValidateAndDownload = async (demandeId: string, typeDemande: string) => {
    try {
      // 1. Appel API pour valider l'étape côté backend et faire passer le statut au suivant
      const res = await fetch("/api/requests/rh-exec-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demandeId }),
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Erreur lors de la validation");
        return;
      }

      // 2. Génération / Téléchargement du reçu d'historique (Format Texte / PDF simulé proprement)
      const demande = demandes.find((d) => d.id === demandeId);
      const receiptContent = `
=========================================
REÇU D'HISTORIQUE DE VALIDATION - RH EXEC
=========================================
Référence : ${demande?.reference || demandeId}
Type de demande : ${typeDemande}
Titre : ${demande?.titre}
Demandeur : ${demande?.nomDemandeur} (${demande?.emailDemandeur})
Date de soumission : ${demande?.creeLe}
Statut : VALIDÉ (RH EXÉCUTANT)
-----------------------------------------
Historique des validations :
${JSON.stringify(demande?.historique || [], null, 2)}
=========================================
      `.trim();

      const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Recu_Validation_${demande?.reference || demandeId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 3. Retirer la demande de la liste locale pour un rafraîchissement instantané
      setDemandes((prev) => prev.filter((d) => d.id !== demandeId));
    } catch (error) {
      console.error("Erreur téléchargement/validation:", error);
      alert("Une erreur technique est survenue.");
    }
  };

  // Groupement des demandes par type (ex: ABSENCE, ATTESTATION, etc.)
  const groupedDemandes = useMemo(() => {
    const map: Record<string, RequestItem[]> = {};
    demandes.forEach((d) => {
      const type = d.typeDemande || "AUTRE";
      if (!map[type]) map[type] = [];
      map[type].push(d);
    });
    return map;
  }, [demandes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const availableTypes = Object.keys(groupedDemandes);

  return (
    <div className="max-w-full mx-auto p-6 md:p-10 space-y-10 bg-slate-50/50 min-h-screen">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle className="w-4 h-4" /> Espace Exécutant RH
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Validation & Génération des Reçus RH
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les dossiers en attente d'exécution. Le téléchargement de l'historique valide automatiquement l'étape.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
          Total en attente : <span className="text-emerald-600 font-bold text-sm ml-1">{demandes.length}</span>
        </div>
      </div>

      {availableTypes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-2xs">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucune demande en attente</h3>
          <p className="text-sm text-slate-400 mt-1">Tous les dossiers au statut RH Exécutant ont été traités.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {availableTypes.map((typeDemande) => {
            // Clé d'action dynamique requise (ex: ABSENCE_PENDING_RH_EXEC, ATTESTATION_PENDING_RH_EXEC)
            const requiredActionKey = `${typeDemande}_PENDING_RH_EXEC`;
            const canViewSection = hasAction([requiredActionKey, "PENDING_RH_EXEC"]);

            if (!canViewSection) {
              return null; // Masque la section si l'utilisateur n'a pas l'autorisation ni le rôle Admin
            }

            const items = groupedDemandes[typeDemande];

            return (
              <div key={typeDemande} className="space-y-4">
                <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Section : {typeDemande}
                  </h3>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                    {items.length} dossier{items.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((demande) => (
                    <RhExecRequestCard
                      key={demande.id}
                      demande={demande}
                      onValidateAndDownload={handleValidateAndDownload}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}