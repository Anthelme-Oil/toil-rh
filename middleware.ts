// ═══════════════════════════════════════════════════════════════
// Middleware — Protection des routes (NextAuth.js)
// ═══════════════════════════════════════════════════════════════
//
// Ce middleware redirige les utilisateurs non authentifiés
// vers la page de connexion. En développement, la protection
// est désactivée pour faciliter le travail.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/error',
  '/api/auth',
  '/api/images',    // Proxy images SharePoint — chargé directement par le navigateur (src img)
  '/api/uploads',   // Fichiers uploadés localement — servis publiquement
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Contournement explicite de l'authentification (si BYPASS_AUTH=true) ──
  if (process.env.BYPASS_AUTH === 'true') {
    return NextResponse.next();
  }

  // ── Routes publiques : accès libre ──
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ── Fichiers statiques : accès libre ──
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ── Vérification du token de session ──
  const sessionToken =
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value;

  if (!sessionToken) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
