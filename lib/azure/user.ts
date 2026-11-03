export interface AzureUserProfile {
  sub?: string;
  oid?: string;
  tid?: string;
  tenantId?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  userPrincipalName?: string;
  [key: string]: unknown;
}

export interface AzureUserIdentity {
  id: string | null;
  email: string;
  name: string;
  tenantId: string | null;
  profile: AzureUserProfile;
}

export function getAzureEmail(
  profile?: AzureUserProfile | null
): string | null {
  if (!profile) {
    return null;
  }

  const email =
    profile.email ||
    profile.preferred_username ||
    profile.userPrincipalName;

  if (!email || typeof email !== 'string') {
    return null;
  }

  return email.toLowerCase().trim();
}

export function getAzureId(
  profile?: AzureUserProfile | null
): string | null {
  if (!profile) {
    return null;
  }

  const id = profile.oid || profile.sub;

  return typeof id === 'string' ? id : null;
}

export function getAzureName(
  profile?: AzureUserProfile | null
): string {
  if (!profile) {
    return '';
  }

  return (
    profile.name ||
    profile.preferred_username?.split('@')[0] ||
    profile.email?.split('@')[0] ||
    ''
  );
}

export function getAzureTenantId(
  profile?: AzureUserProfile | null
): string | null {
  if (!profile) {
    return null;
  }

  return profile.tid || profile.tenantId || null;
}

export function normalizeAzureProfile(
  profile?: AzureUserProfile | null
): AzureUserIdentity | null {
  const email = getAzureEmail(profile);

  if (!email) {
    return null;
  }

  return {
    id: getAzureId(profile),
    email,
    name: getAzureName(profile),
    tenantId: getAzureTenantId(profile),
    profile: profile ?? {},
  };
}