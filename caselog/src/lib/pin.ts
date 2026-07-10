import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const LEGACY_PIN_KEY = 'auris_pin';

function pinKey(userId: string): string {
  return `auris_pin_${userId}`;
}

function storageGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return Promise.resolve(localStorage.getItem(key));
  return SecureStore.getItemAsync(key);
}

function storageSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') { localStorage.setItem(key, value); return Promise.resolve(); }
  return SecureStore.setItemAsync(key, value);
}

function storageDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') { localStorage.removeItem(key); return Promise.resolve(); }
  return SecureStore.deleteItemAsync(key);
}

/** PIN is stored per account on this device — never synced to Supabase. */
export async function getStoredPin(userId: string): Promise<string | null> {
  return storageGet(pinKey(userId));
}

export async function savePin(userId: string, pin: string): Promise<void> {
  await storageSet(pinKey(userId), pin);
  // Drop the old device-wide key so a previous account's PIN can't block a new sign-in.
  await storageDelete(LEGACY_PIN_KEY);
}

export async function clearPin(userId: string): Promise<void> {
  await storageDelete(pinKey(userId));
  await storageDelete(LEGACY_PIN_KEY);
}
