import { sendMail } from '@/lib/emails/mail.service';
import { NotificationPayload } from '../types';

import {
  notificationEmailTemplate,
} from '@/lib/notifications/templates';

// export interface NotificationEmailPayload {
//   to: string;
//   subject: string;
//   title: string;
//   message: string;
//   actionUrl?: string;
//   actionLabel?: string;
// }

export async function sendNotificationEmail({
  to,
  subject,
  title,
  message,
  actionUrl,
  actionLabel,
}: NotificationPayload) {
  return sendMail({
    to,
    subject,
    template: notificationEmailTemplate,
    props: {
      title,
      message,
      actionUrl,
      actionLabel,
    },
  });
}