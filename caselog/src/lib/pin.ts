import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'auris_pin';

export async function getStoredPin(): Promise<string | null> {
  return SecureStore.getItemAsync(PIN_KEY);
}

export async function savePin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_KEY);
}
