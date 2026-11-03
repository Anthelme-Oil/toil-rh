import { cookies } from 'next/headers';

const COOKIE_NAME = 'pending-login-email';

export async function setPendingLoginEmail(email: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, email.toLowerCase().trim(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });
}

export async function getPendingLoginEmail() {
  const cookieStore = await cookies();

  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function clearPendingLoginEmail() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}