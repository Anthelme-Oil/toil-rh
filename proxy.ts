// ═══════════════════════════════════════════════════════════════
// Next.js 16 Proxy (remplace middleware.ts)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques (pages et API publiques)
const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/error',
  '/api/auth',
  '/api/images',    // Proxy images SharePoint
  '/api/uploads',   // Fichiers uploadés localement
  '/api/actualites',// Consultation et publication d'actualités
  '/api/reservations', // Consultation et réservation de salles
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Contournement explicite (BYPASS_AUTH=true) ──
  if (process.env.BYPASS_AUTH === 'true') {
    return NextResponse.next();
  }

  // ── Exclure les fichiers statiques (_next, favicon, etc.) ──
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ── Routes publiques : accès libre ──
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ── Vérification du token de session ──
  const sessionToken =
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value;

  if (!sessionToken) {
    // Si c'est une requête d'API, retourner JSON 401 au lieu d'une redirection HTML
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 });
    }

    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}
