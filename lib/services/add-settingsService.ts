import { WorkflowType, WorkflowStatus } from "@/lib/workflows/engine";

export interface SettingsItem {
  id?: string;
  cle: string;
  valeur: string;
  description?: string;
  miseAJour?: string;
}

export async function createSettings(data: {
  cle: string;
  valeur: string;
  description?: string;
}): Promise<any> {
  try {
    const res = await fetch("/api/requests/admin/parametres", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const json = await res.json();

    // Si le statut HTTP n'est pas OK ou si l'API renvoie une erreur explicite
    if (!res.ok || json.error) {
      throw new Error(json.error || `Erreur HTTP: ${res.status}`);
    }

    // Récupération directe de l'objet 'parametre' renvoyé par votre POST
    return json.parametre || json;
  } catch (error: any) {
    console.error("Erreur détaillée createSettings :", error.message || error);
    throw error;
  }
}