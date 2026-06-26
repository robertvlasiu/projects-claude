import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const BIOMETRIC_KEY = 'auris_biometric_enabled';

/** Whether the user has turned on Face ID / Touch ID unlock for their account. */
export async function isBiometricEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(BIOMETRIC_KEY)) === 'true';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_KEY, enabled ? 'true' : 'false');
}

export type BiometricSupport = {
  available: boolean;
  type: 'face' | 'fingerprint' | null;
};

/** Detect whether the device has biometric hardware that is enrolled. */
export async function getBiometricSupport(): Promise<BiometricSupport> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return { available: false, type: null };
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) return { available: false, type: null };
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return {
    available: true,
    type: types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      ? 'face'
      : 'fingerprint',
  };
}

/**
 * Prompt the device biometric scanner. We pass `disableDeviceFallback: true` so
 * the OS never falls back to the system passcode/PIN — the app's own PIN screen
 * is the only PIN the user ever sees.
 */
export async function authenticateBiometric(promptMessage = 'Unlock Auris'): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    disableDeviceFallback: true,
    cancelLabel: 'Use PIN',
  });
  return result.success;
}
