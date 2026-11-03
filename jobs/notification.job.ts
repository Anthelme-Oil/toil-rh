import {
  getNotificationRecipients,
} from '@/lib/notifications/repository';
import { NotificationType } from '@/lib/notifications/types';

import {
  sendNotificationEmail,
} from '@/lib/notifications/providers/email';

import type {
  NotificationPayload,
} from '@/lib/notifications/types';

export async function notificationJob(
  payload: NotificationPayload,
) {
  const users =
    await getNotificationRecipients(
      payload.recipients,
    );

  if (!users.length) {
    return {
      success: true,
      total: 0,
      sent: 0,
      failed: 0,
    };
  }

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    if (!user.email) {
      continue;
    }

    try {
      await sendNotificationEmail({
        to: user.email,
        subject: payload.title,
        message: payload.message,
        title:payload.title,
        recipients:payload.recipients,
        type:payload.type
       
      });

      sent++;
    } catch (error) {
      failed++;

      console.error(
        `[Notification] Échec d'envoi vers ${user.email}`,
        error,
      );
    }
  }

  return {
    success: failed === 0,
    total: users.length,
    sent,
    failed,
  };
}