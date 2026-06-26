import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';
import { decryptToBase64, encryptBytes } from './crypto';

const BUCKET = 'attachments';

export async function uploadEncryptedFile(
  localUri: string,
  storagePath: string
): Promise<{ path: string; error: Error | null }> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: 'base64' as any,
  });
  const encrypted = encryptBytes(base64);
  const blob = new Blob([encrypted], { type: 'text/plain' });
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, blob, { upsert: true });
  return { path: data?.path ?? storagePath, error: error as Error | null };
}

export async function downloadDecryptedFile(
  storagePath: string,
  destUri: string
): Promise<{ uri: string; error: Error | null }> {
  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
  if (error || !data) return { uri: '', error: error as Error };
  const ciphertext = await data.text();
  const decryptedBase64 = decryptToBase64(ciphertext);
  await FileSystem.writeAsStringAsync(destUri, decryptedBase64, {
    encoding: 'base64' as any,
  });
  return { uri: destUri, error: null };
}

export function attachmentPath(userId: string, recordId: string, fileName: string): string {
  return `${userId}/${recordId}/${fileName}`;
}
