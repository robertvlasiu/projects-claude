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

/** RN Blob objects don't implement `.arrayBuffer()` — read ciphertext as Latin-1 text instead. */
async function readBlobAsAscii(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text();
  if (typeof blob.arrayBuffer === 'function') {
    return bytesToAscii(new Uint8Array(await blob.arrayBuffer()));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(bytesToAscii(new Uint8Array(reader.result as ArrayBuffer)));
    };
    reader.onerror = () => reject(new Error('Failed to read downloaded file'));
    reader.readAsArrayBuffer(blob);
  });
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
    if (data.size === 0) return { uri: '', error: new Error('Downloaded file is empty') };

    const ciphertext = await readBlobAsAscii(data);
    const decryptedBase64 = decryptToBase64(ciphertext);
    if (!decryptedBase64) {
      return { uri: '', error: new Error('Decryption failed — wrong key or corrupted file') };
    }

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

export function attachmentDisplayName(path: string): string {
  return (path.split('/').pop() ?? 'file').replace(/^\d+-/, '');
}

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|bmp)$/i;

export function isImageAttachment(path: string): boolean {
  return IMAGE_EXT.test(attachmentDisplayName(path));
}

/** Download + decrypt into cache, reusing an existing cached copy when present. */
export async function getCachedAttachmentUri(
  storagePath: string
): Promise<{ uri: string | null; error: Error | null }> {
  try {
    const fileName = storagePath.split('/').pop() ?? `file-${Date.now()}`;
    const cacheDir = `${FileSystem.cacheDirectory}caselog-attachments/`;
    await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    const destUri = `${cacheDir}${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const info = await FileSystem.getInfoAsync(destUri);
    if (info.exists && 'size' in info && info.size > 0) return { uri: destUri, error: null };
    if (info.exists) await FileSystem.deleteAsync(destUri, { idempotent: true });
    return downloadDecryptedFile(storagePath, destUri);
  } catch (e) {
    return { uri: null, error: e as Error };
  }
}
