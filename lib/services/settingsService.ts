import { WorkflowType, WorkflowStatus } from "@/lib/workflows/engine";

export interface SettingsItem {
  id: string;
    cle: string;
    valeur: string;
    description?: string;
    miseAJour?: string;
}

export async function getSettings(): Promise<SettingsItem[]> {
  try {
    const res = await fetch("/api/requests/admin/parametres", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Évite le cache pour avoir le suivi en temps réel
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }

    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }

    return [];
  } catch (error) {
    console.error("Erreur lors de la récupération des parametres :", error);
    throw error;
  }
}