export const PRIVACY_POLICY_URL = 'https://cleverforyou.ro/auris-privacy-policy/';

/** Required EXPO_PUBLIC_* vars — must be set at EAS build time (not read from local .env on device). */
export type AppConfigStatus = {
  ok: boolean;
  missing: string[];
};

/** Each var must be read literally — Metro only inlines static `process.env.EXPO_PUBLIC_*` access. */
export function getAppConfigStatus(): AppConfigStatus {
  const missing: string[] = [];

  if (!(process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim()) {
    missing.push('EXPO_PUBLIC_SUPABASE_URL');
  }
  if (!(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()) {
    missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
  if (!(process.env.EXPO_PUBLIC_ENCRYPTION_KEY ?? '').trim()) {
    missing.push('EXPO_PUBLIC_ENCRYPTION_KEY');
  }

  return { ok: missing.length === 0, missing };
}
