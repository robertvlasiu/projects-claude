// SDK 54 moved the classic read/write helpers to the `legacy` entry point.
// The new File API doesn't expose a stable base64 read across platforms yet,
// so we use the legacy helpers which are still fully supported.
import * as FileSystem from 'expo-file-system/legacy';
import { decryptToBase64, encryptBytes } from './crypto';
import { supabase } from './supabase';

const BUCKET = 'attachments';

// React Native's `Blob` upload to supabase-storage produces empty (0-byte)
// objects. Uploading raw bytes (Uint8Array) is the reliable path. Our ciphertext
// is OpenSSL/base64 ASCII text, so a byte-per-char conversion is lossless.
function asciiToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
  return bytes;
}

function bytesToAscii(bytes: Uint8Array): string {
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return str;
}

export async function uploadEncryptedFile(
  localUri: string,
  storagePath: string
): Promise<{ path: string; error: Error | null }> {
  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const encrypted = encryptBytes(base64);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, asciiToBytes(encrypted), {
        upsert: true,
        contentType: 'application/octet-stream',
      });
    return { path: data?.path ?? storagePath, error: error as Error | null };
  } catch (e) {
    return { path: storagePath, error: e as Error };
  }
}

export async function downloadDecryptedFile(
  storagePath: string,
  destUri: string
): Promise<{ uri: string; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
    if (error || !data) return { uri: '', error: error as Error };
    const buffer = await data.arrayBuffer();
    const ciphertext = bytesToAscii(new Uint8Array(buffer));
    const decryptedBase64 = decryptToBase64(ciphertext);
    await FileSystem.writeAsStringAsync(destUri, decryptedBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { uri: destUri, error: null };
  } catch (e) {
    return { uri: '', error: e as Error };
  }
}

// Unique, collision-free path: <userId>/<recordScope>/<timestamp>-<file>
export function attachmentPath(userId: string, recordId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${recordId}/${Date.now()}-${safeName}`;
}
