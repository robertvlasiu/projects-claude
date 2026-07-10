import { supabase } from './supabase';

export type SupportRequest = {
  subject?: string;
  message: string;
};

export async function sendSupportMessage(
  request: SupportRequest
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await supabase.functions.invoke('contact-support', {
    body: {
      subject: request.subject?.trim() || undefined,
      message: request.message.trim(),
    },
  });

  if (error) {
    const detail = typeof data === 'object' && data && 'error' in data
      ? String((data as { error: string }).error)
      : error.message;
    return { ok: false, error: detail || 'Could not send your message.' };
  }

  if (data && typeof data === 'object' && 'error' in data) {
    return { ok: false, error: String((data as { error: string }).error) };
  }

  return { ok: true };
}
