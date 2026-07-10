import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 10000);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) {
          setSession(session);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      })
      .finally(() => clearTimeout(timeout));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
