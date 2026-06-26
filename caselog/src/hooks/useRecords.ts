import { useCallback, useEffect, useState } from 'react';
import { decrypt, encrypt } from '../lib/crypto';
import { supabase } from '../lib/supabase';

export type Record<T> = T & { id: string; created_at: string };

export function useRecords<T>(type: string) {
  const [records, setRecords] = useState<Record<T>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('records')
      .select('id, encrypted_data, created_at')
      .eq('user_id', user.id)
      .eq('type', type)
      .order('created_at', { ascending: false });
    if (error || !data) { setLoading(false); return; }
    const decrypted = data.map(r => ({
      id: r.id,
      created_at: r.created_at,
      ...decrypt<T>(r.encrypted_data),
    }));
    setRecords(decrypted);
    setLoading(false);
  }, [type]);

  useEffect(() => { load(); }, [load]);

  async function add(payload: T): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('records').insert({
      user_id: user.id,
      type,
      encrypted_data: encrypt(payload as object),
    }).select('id').single();
    if (error || !data) return null;
    await load();
    return data.id;
  }

  /** Insert many records of this type at once. Returns the number saved. */
  async function addMany(payloads: T[]): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || payloads.length === 0) return 0;
    const rows = payloads.map(p => ({
      user_id: user.id,
      type,
      encrypted_data: encrypt(p as object),
    }));
    const { data, error } = await supabase.from('records').insert(rows).select('id');
    if (error || !data) return 0;
    await load();
    return data.length;
  }

  async function update(id: string, payload: Partial<T>) {
    const existing = records.find(r => r.id === id);
    if (!existing) return;
    const merged = { ...existing, ...payload };
    const { id: _, created_at: __, ...rest } = merged as any;
    await supabase.from('records').update({
      encrypted_data: encrypt(rest),
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    await load();
  }

  async function remove(id: string) {
    await supabase.from('records').delete().eq('id', id);
    setRecords(prev => prev.filter(r => r.id !== id));
  }

  return { records, loading, add, addMany, update, remove, reload: load };
}
