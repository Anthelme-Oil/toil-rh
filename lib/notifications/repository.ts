import {
  getAllUsers,
  findUserWithEmail,
  findUsersByEmails,
} from '@/lib/users/service';

import type {
  NotificationRecipients,
} from './types';

export async function getNotificationRecipients(
  recipients: NotificationRecipients,
) {
  /**
   * Tous les utilisateurs
   */
  if (recipients === 'ALL') {
    return getAllUsers();
  }

  /**
   * Un seul email
   */
  if (typeof recipients === 'string') {
    const user = await findUserWithEmail(
      recipients,
    );

    return user ? [user] : [];
  }

  /**
   * Plusieurs emails
   */
  return findUsersByEmails(recipients);
}