// React Native / Hermes has no global crypto.getRandomValues, which crypto-js
// needs for AES salt generation — without this, every encrypt() throws
// "Native crypto module could not be used to get secure random number".
// crypto-js captures the global when its module loads, so this file MUST be
// imported before crypto-js (see crypto.ts import order). No-op on web.
import * as ExpoCrypto from 'expo-crypto';

const g = globalThis as any;
if (!g.crypto) g.crypto = {};
if (typeof g.crypto.getRandomValues !== 'function') {
  g.crypto.getRandomValues = (array: any) => ExpoCrypto.getRandomValues(array);
}
