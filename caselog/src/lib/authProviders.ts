import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// Result contract: `error: null` means either success (a session was set and
// the auth listener will navigate) or the user simply cancelled — neither
// should show an error message.
export type SsoResult = { error: string | null };

/**
 * Native Sign in with Apple → Supabase id-token exchange.
 * iOS only; requires the Apple provider enabled in Supabase with the app's
 * bundle id (and `host.exp.Exponent` while testing in Expo Go) in its client ids.
 */
export async function signInWithApple(): Promise<SsoResult> {
  if (Platform.OS !== 'ios') return { error: 'Apple Sign-In is only available on iOS.' };
  try {
    const AppleAuthentication = await import('expo-apple-authentication');
    if (!(await AppleAuthentication.isAvailableAsync())) {
      return { error: 'Apple Sign-In is not available on this device.' };
    }
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) return { error: 'Apple did not return a sign-in token. Try again.' };
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    return { error: error?.message ?? null };
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED') return { error: null };
    return { error: e?.message ?? 'Apple Sign-In failed. Try again.' };
  }
}

/**
 * Google sign-in via the Supabase OAuth flow in an in-app browser session.
 * Requires the Google provider enabled in Supabase and this app's redirect
 * URI in Supabase Auth → URL Configuration → Redirect URLs.
 */
export async function signInWithGoogle(): Promise<SsoResult> {
  try {
    const redirectTo = makeRedirectUri({ scheme: 'auris', path: 'auth/callback' });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data?.url) return { error: error?.message ?? 'Could not start Google sign-in.' };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success' || !result.url) return { error: null }; // cancelled/dismissed

    return createSessionFromUrl(result.url);
  } catch (e: any) {
    return { error: e?.message ?? 'Google sign-in failed. Try again.' };
  }
}

/** Handles both implicit (#access_token=…) and PKCE (?code=…) callback URLs. */
async function createSessionFromUrl(url: string): Promise<SsoResult> {
  const fragment = url.split('#')[1];
  if (fragment) {
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      return { error: error?.message ?? null };
    }
    const description = params.get('error_description');
    if (description) return { error: decodeURIComponent(description.replace(/\+/g, ' ')) };
  }
  const code = new URL(url).searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return { error: error?.message ?? null };
  }
  return { error: 'Sign-in was interrupted before completing. Try again.' };
}
