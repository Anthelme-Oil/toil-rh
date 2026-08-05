'use client';

import { createContext, useContext, useState, useEffect } from 'react';
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

  const fetchPermissions = async (email: string) => {
    try {
      const res = await fetch(`/api/auth/role?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
      }
    } catch (err) {
      console.error('Erreur récupération permissions:', err);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchPermissions(userEmail);
    }
  }, [userEmail]);

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
        refreshPermissions: () => fetchPermissions(userEmail),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
