// ═══════════════════════════════════════════════════════════════
// Cache serveur en mémoire — Évite les appels redondants à
// SharePoint / Microsoft Graph pour les données peu volatiles
// (rôles, listes de demandes, etc.)
// ═══════════════════════════════════════════════════════════════

import 'server-only';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ServerCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Récupère une valeur depuis le cache, ou exécute `fetcher` et la met en cache.
   * @param key    Clé unique (ex: `role:email@domain.com`)
   * @param fetcher  Fonction async qui produit la donnée
   * @param ttlMs    Durée de validité du cache en ms (défaut : 5 minutes)
   */
  async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = 5 * 60 * 1000): Promise<T> {
    const now = Date.now();
    const cached = this.store.get(key) as CacheEntry<T> | undefined;

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const data = await fetcher();
    this.store.set(key, { data, expiresAt: now + ttlMs });
    return data;
  }

  /**
   * Invalide une entrée spécifique du cache
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalide toutes les entrées dont la clé commence par `prefix`
   * Utile après une mutation (ex: créer un congé → invalider `conges:*`)
   */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Nettoie les entrées expirées (appelé périodiquement si besoin)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton — une seule instance partagée par tout le processus serveur
export const serverCache = new ServerCache();
