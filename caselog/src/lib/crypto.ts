import './cryptoPolyfill'; // must come first — crypto-js reads the crypto global at load
import CryptoJS from 'crypto-js';

const KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY ?? 'fallback-dev-key-change-in-prod!!';

export function encrypt(data: object): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), KEY).toString();
}

export function decrypt<T>(ciphertext: string): T {
  const bytes = CryptoJS.AES.decrypt(ciphertext, KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as T;
}

export function encryptBytes(base64: string): string {
  const wordArray = CryptoJS.enc.Base64.parse(base64);
  return CryptoJS.AES.encrypt(wordArray, KEY).toString();
}

export function decryptToBase64(ciphertext: string): string {
  const decrypted = CryptoJS.AES.decrypt(ciphertext, KEY);
  return decrypted.toString(CryptoJS.enc.Base64);
}
