import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Pause token auto-refresh while backgrounded (Supabase RN guidance) — a
// refresh frozen mid-flight by iOS suspending timers leaves the auth lock
// held, and the next auth call after unlock hangs forever.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', state => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

/** Resolves null after `ms` instead of hanging forever on a wedged request. */
export function withTimeout<T>(promise: PromiseLike<T>, ms = 15000): Promise<T | null> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>(resolve => setTimeout(() => resolve(null), ms)),
  ]);
}

/** Current user id from the locally cached session — no network round-trip. */
export async function getUserId(): Promise<string | null> {
  try {
    const result = await withTimeout(supabase.auth.getSession(), 8000);
    return result?.data?.session?.user?.id ?? null;
  } catch {
    return null;
  }
}
