export type NotificationRecipients =
  | 'ALL'
  | string
  | string[];

export type NotificationType =
  | 'MEDIA_CREATED'
  | 'MESSAGE_RECEIVED'
  | 'EVENT_CREATED'
  | 'REQUEST_CREATED'
  | 'SYSTEM';

export interface NotificationPayload {
  to:string;
  title: string;
  message: string;
  subject: string;
  actionUrl?:string;
  actionLabel?:string;

  /**
   * 'ALL'       → tous les utilisateurs
   * string      → un email
   * string[]    → plusieurs emails
   */
  recipients: NotificationRecipients;

  type: NotificationType;

  /**
   * Données supplémentaires liées
   * à l'événement.
   */
  data?: Record<string, unknown>;
}