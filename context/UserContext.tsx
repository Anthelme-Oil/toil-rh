'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UserContextType {
  userEmail: string;
  userName: string;
  userRole: string;
  isRH: boolean;
  isManager: boolean;
  isAdmin: boolean;
  setUserEmail: (email: string) => void;
  refreshPermissions: () => void;
}

const UserContext = createContext<UserContextType>({
  userEmail: 'lino@gmail.com',
  userName: 'Lino lino',
  userRole: 'EMPLOYE',
  isRH: false,
  isManager: false,
  isAdmin: false,
  setUserEmail: () => {},
  refreshPermissions: () => {},
});

// ── Helpers cache sessionStorage ──

const CACHE_KEY_PREFIX = 'toil_permissions_';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes (aligné sur le cache serveur)

interface CachedPermissions {
  role: string;
  isRH: boolean;
  isManager: boolean;
  isAdmin: boolean;
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
  perms: { role: string; isRH: boolean; isManager: boolean; isAdmin: boolean }
) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      CACHE_KEY_PREFIX + email.toLowerCase(),
      JSON.stringify({ ...perms, cachedAt: Date.now() })
    );
  } catch {
    // sessionStorage plein ou indisponible — on ignore
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [userEmail, setUserEmailState] = useState<string>('lino@gmail.com');
  const [userName, setUserName] = useState<string>('Lino lino');
  const [permissions, setPermissions] = useState({
    role: 'EMPLOYE',
    isRH: false,
    isManager: false,
    isAdmin: false,
  });

  // Guard pour ne pas fetch en doublon (React strict mode + fast nav)
  const fetchInFlightRef = useRef<string | null>(null);

  // Si l'utilisateur est connecté via NextAuth/Microsoft 365, utiliser son email réel
  useEffect(() => {
    if (session?.user?.email) {
      setUserEmailState(session.user.email);
      setUserName(session.user.name || session.user.email);
    } else {
      const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('toil_simulated_email') : null;
      if (savedEmail) {
        setUserEmailState(savedEmail);
      }
    }
  }, [session]);

  const fetchPermissions = useCallback(async (email: string, forceRefresh = false) => {
    if (!email) return;

    // 1. Vérification du cache sessionStorage (instantané, 0 requête)
    if (!forceRefresh) {
      const cached = getCachedPermissions(email);
      if (cached) {
        setPermissions({
          role: cached.role,
          isRH: cached.isRH,
          isManager: cached.isManager,
          isAdmin: cached.isAdmin,
        });
        return;
      }
    }

    // 2. Éviter les requêtes en double si un fetch est déjà en cours pour cet email
    if (fetchInFlightRef.current === email) return;
    fetchInFlightRef.current = email;

    try {
      const res = await fetch(`/api/auth/role?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
        setCachedPermissions(email, data);
      }
    } catch (err) {
      console.error('Erreur récupération permissions:', err);
    } finally {
      fetchInFlightRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchPermissions(userEmail);
    }
  }, [userEmail, fetchPermissions]);

  const setUserEmail = (email: string) => {
    setUserEmailState(email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('toil_simulated_email', email);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userEmail,
        userName,
        userRole: permissions.role,
        isRH: permissions.isRH,
        isManager: permissions.isManager,
        isAdmin: permissions.isAdmin,
        setUserEmail,
        refreshPermissions: () => fetchPermissions(userEmail, true),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
