-- Run this in your Supabase SQL Editor

-- Records table: stores all encrypted feature data
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  -- type values: incident | expense | document | communication | custody_event
  --              court_date | attorney_note | asset | mood | contact | reminder
  encrypted_data TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-user per-type queries
CREATE INDEX IF NOT EXISTS records_user_type_idx ON records(user_id, type);
CREATE INDEX IF NOT EXISTS records_created_idx ON records(user_id, created_at DESC);

-- Row Level Security: users can only see and modify their own records
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own" ON records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own" ON records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own" ON records
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER records_updated_at
  BEFORE UPDATE ON records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- Storage bucket for encrypted file attachments
-- Run in Supabase Dashboard > Storage > New Bucket:
--   Name: attachments
--   Public: false (private)

-- Storage RLS policies (run after creating the bucket):
CREATE POLICY "users_upload_own_files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users_read_own_files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users_delete_own_files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Self-service account deletion (required by App Store review for apps with
-- sign-up). Deletes the caller's auth user; records cascade via FK.
-- Attachment files are removed by the app via the Storage API before this
-- call — Supabase blocks direct SQL deletes on storage tables.
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_user() from public;
revoke all on function public.delete_user() from anon;
grant execute on function public.delete_user() to authenticated;
