


export async function deleteSetting(cle: string) {
  if (!cle) {
    throw new Error("La clé du paramètre est requise pour la suppression.");
  }

  // Passer explicitement 'cle' en query param
  const response = await fetch(`/api/requests/admin/parametres?cle=${encodeURIComponent(cle)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur lors de la suppression du paramètre.");
  }

  return data;
}