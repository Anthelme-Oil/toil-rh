import {
  notificationJob,
} from '@/jobs/notification.job';

import type {
  NotificationPayload,
} from './types';

export async function sendNotification(
  payload: NotificationPayload,
) {

  // console.log("look the payload",payload)
  if (!payload) {
    throw new Error(
      'Le payload de notification est requis.',
    );
  }

  if (!payload.title?.trim()) {
    throw new Error(
      'Le titre de la notification est requis.',
    );
  }

  if (!payload.message?.trim()) {
    throw new Error(
      'Le message de la notification est requis.',
    );
  }

  if (!payload.recipients) {
    throw new Error(
      'Les destinataires de la notification sont requis.',
    );
  }

  return notificationJob(payload);
}