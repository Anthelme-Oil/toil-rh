import 'server-only';
import { query, execute } from './db';

export interface SystemSettings {
  senderEmail: string;
  rhEmail: string;
  rhPrintEmail: string;
  enableEmailNotifications: boolean;
}

/**
 * S'assure que la table MySQL 'parametres' existe
 */
async function ensureSettingsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS parametres (
      cle VARCHAR(100) PRIMARY KEY,
      valeur TEXT NOT NULL,
      description VARCHAR(255),
      mis_a_jour_le DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  try {
    await execute(sql);
  } catch (err) {
    console.error('[Settings] Erreur création table parametres:', err);
  }
}

/**
 * Récupère les paramètres de configuration système (depuis MySQL avec fallback sur .env)
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  await ensureSettingsTable();
  try {
    const rows = await query<{ cle: string; valeur: string }>('SELECT cle, valeur FROM parametres');
    const settingsMap = new Map(rows.map((r) => [r.cle, r.valeur]));

    return {
      senderEmail:
        settingsMap.get('NOTIFICATION_SENDER_EMAIL') ||
        process.env.NOTIFICATION_SENDER_EMAIL ||
        'it.helpdesk@togosh.com',
      rhEmail:
        settingsMap.get('RH_NOTIFICATION_EMAIL') ||
        process.env.RH_NOTIFICATION_EMAIL ||
        'rh@compel-toil.com',
      rhPrintEmail:
        settingsMap.get('RH_PRINT_EMAIL') ||
        process.env.RH_PRINT_EMAIL ||
        'rh.attestation@compel-toil.com',
      enableEmailNotifications:
        settingsMap.has('ENABLE_EMAIL_NOTIFICATIONS')
          ? settingsMap.get('ENABLE_EMAIL_NOTIFICATIONS') === 'true'
          : true,
    };
  } catch (err) {
    console.error('[Settings] Erreur lecture des paramètres:', err);
    return {
      senderEmail: process.env.NOTIFICATION_SENDER_EMAIL || 'it.helpdesk@togosh.com',
      rhEmail: process.env.RH_NOTIFICATION_EMAIL || 'rh@compel-toil.com',
      rhPrintEmail: process.env.RH_PRINT_EMAIL || 'rh.attestation@compel-toil.com',
      enableEmailNotifications: true,
    };
  }
}

/**
 * Sauvegarde ou met à jour les paramètres système dans MySQL
 */
export async function saveSystemSettings(settings: Partial<SystemSettings>): Promise<boolean> {
  await ensureSettingsTable();
  try {
    const entries: [string, string][] = [];
    if (settings.senderEmail !== undefined) {
      entries.push(['NOTIFICATION_SENDER_EMAIL', settings.senderEmail.trim()]);
    }
    if (settings.rhEmail !== undefined) {
      entries.push(['RH_NOTIFICATION_EMAIL', settings.rhEmail.trim()]);
    }
    if (settings.rhPrintEmail !== undefined) {
      entries.push(['RH_PRINT_EMAIL', settings.rhPrintEmail.trim()]);
    }
    if (settings.enableEmailNotifications !== undefined) {
      entries.push(['ENABLE_EMAIL_NOTIFICATIONS', String(settings.enableEmailNotifications)]);
    }

    for (const [cle, valeur] of entries) {
      await execute(
        `INSERT INTO parametres (cle, valeur) VALUES (?, ?) ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)`,
        [cle, valeur]
      );
    }
    return true;
  } catch (err) {
    console.error('[Settings] Erreur sauvegarde des paramètres:', err);
    return false;
  }
}
