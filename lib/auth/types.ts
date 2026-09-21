import type { DefaultSession } from 'next-auth';
import type { AzureUserProfile } from '../azure/user';
import type { UserRole } from '../users/types';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
      isRH?: boolean;
      isDRH?: boolean;
      isCom?: boolean;
      managerEmail?: string | null;
      profile?: AzureUserProfile;
    } & DefaultSession['user'];
  }

  interface User {
    role?: UserRole;
    isRH?: boolean;
    isDRH?: boolean;
    isCom?: boolean;
    managerEmail?: string | null;
    dbUserId?: string;
    profile?: AzureUserProfile;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    dbUserId?: string;
    role?: UserRole;
    isRH?: boolean;
    isDRH?:boolean;
    isCom?: boolean;
    managerEmail?: string | null;
    profile?: AzureUserProfile;
  }
}