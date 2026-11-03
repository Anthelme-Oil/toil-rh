'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UserContextType {
  userEmail: string;
  userName: string;
  userRole: string;
  /** Adresse e-mail du N+1 (issue de Graph / DB via /api/roles/me) */
  managerEmail: string;
  isRH: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isCom: boolean;
  isDRH: boolean;
  isRHPrint: boolean;
  isRoomManager: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshPermissions: () => void;
  /** Vérifie si l'e-mail de l'utilisateur est associé à la clé (ou liste de clés) dans la table Parametre */
  hasAction: (actions: string | string[]) => Record<string, boolean>;
}

const UserContext = createContext<UserContextType>({
  userEmail: '',
  userName: '',
  userRole: 'EMPLOYE',
  managerEmail: '',
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
  hasAction: () => ({}),
});

const CACHE_KEY_PREFIX = 'toil_permissions_';
const CACHE_TTL = 15 * 1000;

interface CachedPermissions {
  role: string;
  managerEmail: string;
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
  perms: { role: string; managerEmail: string; isRH: boolean; isManager: boolean; isAdmin: boolean; isCom: boolean; isDRH: boolean; isRHPrint: boolean; isRoomManager: boolean; name: string }
) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      CACHE_KEY_PREFIX + email.toLowerCase(),
      JSON.stringify({ ...perms, cachedAt: Date.now() })
    );
  } catch {}
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const [permissions, setPermissions] = useState({
    role: 'EMPLOYE',
    managerEmail: '',
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

  // État pour stocker les paramètres de la base de données (pour hasAction)
  const [parametres, setParametres] = useState<Array<{ cle: string; valeur: string }>>([]);

  const fetchInFlightRef = useRef<string | null>(null);

  const userEmail = session?.user?.email || '';
  const sessionName = session?.user?.name || '';
  const isAuthenticated = status === 'authenticated' && !!userEmail;

  // Chargement des paramètres admin pour la vérification hasAction
  useEffect(() => {
    async function loadParametres() {
      try {
        const res = await fetch('/api/requests/admin/parametres', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setParametres(json.data || json.parametres || json || []);
        }
      } catch (err) {
        console.error('[UserContext] Erreur chargement paramètres:', err);
      }
    }
    loadParametres();
  }, []);

  const fetchPermissions = useCallback(async (email: string, forceRefresh = false) => {
    if (!email) {
      setPermissions({ role: 'EMPLOYE', managerEmail: '', isRH: false, isManager: false, isAdmin: false, isCom: false, isDRH: false, isRHPrint: false, isRoomManager: false, name: '' });
      setIsLoading(false);
      return;
    }

    if (forceRefresh && typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(CACHE_KEY_PREFIX + email.toLowerCase());
      } catch {}
    } else {
      const cached = getCachedPermissions(email);
      if (cached) {
        setPermissions({
          role: cached.role,
          managerEmail: cached.managerEmail || '',
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

    if (fetchInFlightRef.current === email) return;
    fetchInFlightRef.current = email;

    try {
      const res = await fetch('/api/roles/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const perms = {
          role: data.role || 'EMPLOYE',
          managerEmail: data.managerEmail || data.manager?.email || '',
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

  useEffect(() => {
    if (status === 'loading') return;
    if (userEmail) {
      fetchPermissions(userEmail);
    } else {
      setPermissions({ role: 'EMPLOYE', managerEmail: '', isRH: false, isManager: false, isAdmin: false, isCom: false, isDRH: false, isRHPrint: false, isRoomManager: false, name: '' });
      setIsLoading(false);
    }
  }, [userEmail, status, fetchPermissions]);

  /**
   * Fonction qui vérifie si l'utilisateur courant (userEmail) possède l'action 
   * en se basant sur les clés configurées dans la table Parametre.
   */
const hasAction = useCallback(
  (actions: string | string[]): Record<string, boolean> => {
    const actionList = Array.isArray(actions) ? actions : [actions];

    const formattedActions = actionList.map((action) =>
      action.trim().toUpperCase()
    );

    // Aucun utilisateur connecté
    if (!userEmail) {
      return Object.fromEntries(
        formattedActions.map((action) => [action, false])
      );
    }

    // Un administrateur possède toutes les actions
    if (permissions.isAdmin) {
      return Object.fromEntries(
        formattedActions.map((action) => [action, true])
      );
    }

    const normalizedEmail = userEmail.trim().toLowerCase();

    return Object.fromEntries(
      formattedActions.map((formattedKey) => {
        const setting = parametres.find(
          (p) => p.cle.trim().toUpperCase() === formattedKey
        );

        // console.log("settings",setting,"formatedAction=>",formattedActions)

        if (!setting?.valeur) {
          return [formattedKey, false];
        }

        const allowedEmails = setting.valeur
          .split(",")
          .map((email) => email.trim().toLowerCase());

        const hasPermission =
          allowedEmails.includes(normalizedEmail) ||
          allowedEmails.includes("*");

        return [formattedKey, hasPermission];
      })
    );
  },
  [userEmail, parametres, permissions.isAdmin]
);

  const displayName = sessionName || permissions.name || userEmail.split('@')[0] || '';

  return (
    <UserContext.Provider
      value={{
        userEmail,
        userName: displayName,
        userRole: permissions.role,
        managerEmail: permissions.managerEmail,
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
        hasAction,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);