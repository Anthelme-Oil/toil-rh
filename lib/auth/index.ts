import NextAuth from 'next-auth';

import { authProviders } from './providers';

import {
  signInCallback,
  jwtCallback,
  sessionCallback,
} from './callbacks';

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,

  providers: authProviders,

  callbacks: {
    signIn: signInCallback,
    jwt: jwtCallback,
    session: sessionCallback,
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',

      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure:
          process.env.NODE_ENV === 'production',
      },
    },
  },
});