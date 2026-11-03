export async function getAllUsers() {
  const response = await fetch("/api/users", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      "Impossible de récupérer les utilisateurs"
    );
  }

  const result = await response.json();

  return result.data ?? [];
}

export async function updateUserRole(
  userId: string,
  role: "ADMIN" | "DRH" | "RH" | "COM"
) {
  const response = await fetch(
    `/api/users/${userId}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ role }),
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(
      () => null
    );

    throw new Error(
      result?.error ||
        "Impossible de modifier le rôle"
    );
  }

  return response.json();
}