'use client';

// ═══════════════════════════════════════════════════════════════
// UserContext — Source unique d'identité via NextAuth (SSO Microsoft)
// ═══════════════════════════════════════════════════════════════
// L'identité utilisateur provient UNIQUEMENT de la session NextAuth.
// Les permissions (rôle, isRH, isManager, etc.) sont lues depuis MySQL
// via l'API /api/roles/me (protégée par session serveur).
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UserContextType {
  /** Email de l'utilisateur connecté (vide si non connecté) */
  userEmail: string;
  /** Nom affiché de l'utilisateur */
  userName: string;
  /** Rôle principal (EMPLOYE, MANAGER, RH, ADMIN) */
  userRole: string;
  /** Flags de permissions */
  isRH: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isCom: boolean;
  isDRH: boolean;
  isRHPrint: boolean;
  isRoomManager: boolean;
  /** L'utilisateur est-il authentifié via SSO ? */
  isAuthenticated: boolean;
  /** Chargement en cours des permissions ? */
  isLoading: boolean;
  /** Forcer le rechargement des permissions depuis le serveur */
  refreshPermissions: () => void;
}

const UserContext = createContext<UserContextType>({
  userEmail: '',
  userName: '',
  userRole: 'EMPLOYE',
  isRH: false,
  isManager: false,
  isAdmin: false,
  isCom: false,
  isDRH: false,
  isRHPrint: false,
  isRoomManager: false,
  isAuthenticated: false,
  isLoading: true,
  refreshPermissions: () => {},
});

// ── Cache sessionStorage (évite les requêtes en doublon lors de la navigation) ──

const CACHE_KEY_PREFIX = 'toil_permissions_';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface CachedPermissions {
  role: string;
  isRH: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isCom: boolean;
  isDRH: boolean;
  isRHPrint: boolean;
  isRoomManager: boolean;
  name: string;
  cachedAt: number;
}

function getCachedPermissions(email: string): CachedPermissions | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + email.toLowerCase());
    if (!raw) return null;
    const parsed: CachedPermissions = JSON.parse(raw);
    if (Date.now() - parsed.cachedAt > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY_PREFIX + email.toLowerCase());
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setCachedPermissions(
  email: string,
  perms: { role: string; isRH: boolean; isManager: boolean; isAdmin: boolean; isCom: boolean; isDRH: boolean; isRHPrint: boolean; isRoomManager: boolean; name: string }
) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      CACHE_KEY_PREFIX + email.toLowerCase(),
      JSON.stringify({ ...perms, cachedAt: Date.now() })
    );
  } catch {
    // sessionStorage plein ou indisponible
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // État par défaut = non connecté, aucun privilège
  const [permissions, setPermissions] = useState({
    role: 'EMPLOYE',
    isRH: false,
    isManager: false,
    isAdmin: false,
    isCom: false,
    isDRH: false,
    isRHPrint: false,
    isRoomManager: false,
    name: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Guard pour ne pas fetch en doublon
  const fetchInFlightRef = useRef<string | null>(null);

  // Email et nom proviennent uniquement de la session NextAuth
  const userEmail = session?.user?.email || '';
  const sessionName = session?.user?.name || '';
  const isAuthenticated = status === 'authenticated' && !!userEmail;

  const fetchPermissions = useCallback(async (email: string, forceRefresh = false) => {
    if (!email) {
      setPermissions({ role: 'EMPLOYE', isRH: false, isManager: false, isAdmin: false, isCom: false, isDRH: false, isRHPrint: false, isRoomManager: false, name: '' });
      setIsLoading(false);
      return;
    }

    // 1. Cache sessionStorage (instantané, 0 requête)
    if (!forceRefresh) {
      const cached = getCachedPermissions(email);
      if (cached) {
        setPermissions({
          role: cached.role,
          isRH: cached.isRH,
          isManager: cached.isManager,
          isAdmin: cached.isAdmin,
          isCom: cached.isCom,
          isDRH: cached.isDRH,
          isRHPrint: cached.isRHPrint,
          isRoomManager: cached.isRoomManager,
          name: cached.name,
        });
        setIsLoading(false);
        return;
      }
    }

    // 2. Éviter les requêtes en double
    if (fetchInFlightRef.current === email) return;
    fetchInFlightRef.current = email;

    try {
      // L'API /api/roles/me lit l'email depuis la session serveur (auth())
      const res = await fetch('/api/roles/me');
      if (res.ok) {
        const data = await res.json();
        const perms = {
          role: data.role || 'EMPLOYE',
          isRH: data.isRH || false,
          isManager: data.isManager || false,
          isAdmin: data.isAdmin || false,
          isCom: data.isCom || false,
          isDRH: data.isDRH || false,
          isRHPrint: data.isRHPrint || false,
          isRoomManager: data.isRoomManager || false,
          name: data.name || '',
        };
        setPermissions(perms);
        setCachedPermissions(email, perms);
      }
    } catch (err) {
      console.error('[UserContext] Erreur récupération permissions:', err);
    } finally {
      fetchInFlightRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // Charger les permissions dès que la session est disponible
  useEffect(() => {
    if (status === 'loading') return; // Attendre que NextAuth ait fini
    if (userEmail) {
      fetchPermissions(userEmail);
    } else {
      setPermissions({ role: 'EMPLOYE', isRH: false, isManager: false, isAdmin: false, isCom: false, isDRH: false, isRHPrint: false, isRoomManager: false, name: '' });
      setIsLoading(false);
    }
  }, [userEmail, status, fetchPermissions]);

  // Le nom affiché = nom de la session SSO, ou nom stocké en BD via permissions
  const displayName = sessionName || permissions.name || userEmail.split('@')[0] || '';

  return (
    <UserContext.Provider
      value={{
        userEmail,
        userName: displayName,
        userRole: permissions.role,
        isRH: permissions.isRH,
        isManager: permissions.isManager,
        isAdmin: permissions.isAdmin,
        isCom: permissions.isCom,
        isDRH: permissions.isDRH,
        isRHPrint: permissions.isRHPrint,
        isRoomManager: permissions.isRoomManager,
        isAuthenticated,
        isLoading,
        refreshPermissions: () => fetchPermissions(userEmail, true),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
