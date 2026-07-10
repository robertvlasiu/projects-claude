import { useCallback, useEffect, useState } from 'react';
import { decrypt, encrypt } from '../lib/crypto';
import { getUserId, supabase, withTimeout } from '../lib/supabase';

export type SavedRecord<T> = T & { id: string; created_at: string };

export function useRecords<T>(type: string) {
  const [records, setRecords] = useState<SavedRecord<T>[]>([]);
  const [loading, setLoading] = useState(true);

  // loading starts true and only flips false — refreshes are silent so lists
  // and the dashboard don't flicker back to their loading state.
  // Everything is wrapped so a network/auth failure can never leave a caller
  // hanging on an unresolved promise or an uncaught exception.
  const load = useCallback(async () => {
    try {
      const userId = await getUserId();
      if (!userId) { console.warn(`[useRecords] load '${type}': no session`); setLoading(false); return; }
      const result = await withTimeout(supabase
        .from('records')
        .select('id, encrypted_data, created_at')
        .eq('user_id', userId)
        .eq('type', type)
        .order('created_at', { ascending: false }));
      if (!result || result.error || !result.data) { setLoading(false); return; }
      const decrypted = result.data.map(r => ({
        id: r.id,
        created_at: r.created_at,
        ...decrypt<T>(r.encrypted_data),
      }));
      setRecords(decrypted);
    } catch {
      // keep whatever we had — a failed refresh shouldn't wipe the list
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  async function add(payload: T): Promise<string | null> {
    try {
      const userId = await getUserId();
      if (!userId) { console.warn(`[useRecords] insert '${type}': no session`); return null; }
      const result = await withTimeout(supabase.from('records').insert({
        user_id: userId,
        type,
        encrypted_data: encrypt(payload as object),
      }).select('id').single());
      if (!result || result.error || !result.data) {
        console.warn(`[useRecords] insert '${type}' failed:`, result ? result.error?.message : 'timed out');
        return null;
      }
      await load();
      return result.data.id;
    } catch (e: any) {
      console.warn(`[useRecords] insert '${type}' threw:`, e?.message ?? e);
      return null;
    }
  }

  /** Insert many records of this type at once. Returns the number saved. */
  async function addMany(payloads: T[]): Promise<number> {
    try {
      const userId = await getUserId();
      if (!userId || payloads.length === 0) return 0;
      const rows = payloads.map(p => ({
        user_id: userId,
        type,
        encrypted_data: encrypt(p as object),
      }));
      const result = await withTimeout(supabase.from('records').insert(rows).select('id'));
      if (!result || result.error || !result.data) return 0;
      await load();
      return result.data.length;
    } catch {
      return 0;
    }
  }

  async function update(id: string, payload: Partial<T>) {
    try {
      const existing = records.find(r => r.id === id);
      if (!existing) return;
      const merged = { ...existing, ...payload };
      const { id: _, created_at: __, ...rest } = merged as any;
      await withTimeout(supabase.from('records').update({
        encrypted_data: encrypt(rest),
        updated_at: new Date().toISOString(),
      }).eq('id', id));
      await load();
    } catch {
      // swallow — the list simply keeps its previous state
    }
  }

  async function remove(id: string) {
    try {
      await supabase.from('records').delete().eq('id', id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch {
      // swallow
    }
  }

  return { records, loading, add, addMany, update, remove, reload: load };
}
