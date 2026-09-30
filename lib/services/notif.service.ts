import { NotificationPayload } from "../notifications/types";

export interface SendNotificationResponse {
  success: boolean;
  message?: string;
}

export async function sendNotification(
  data: NotificationPayload,
): Promise<SendNotificationResponse> {
  const response = await fetch("/api/requests/notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || "Erreur lors de l'envoi de la notification.",
    );
  }

  return result;
}