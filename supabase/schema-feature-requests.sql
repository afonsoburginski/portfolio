-- Feature requests dashboard
-- 1. Create a Supabase project at supabase.com and get:
--    - Project URL → NEXT_PUBLIC_SUPABASE_URL
--    - Settings → API → service_role key → SUPABASE_SERVICE_ROLE_KEY (keep secret!)
-- 2. In .env.local add:
--    NEXT_PUBLIC_SUPABASE_URL=...
--    SUPABASE_SERVICE_ROLE_KEY=...
--    DASHBOARD_ADMIN_SECRET=...  (any secret string to access /dashboard/admin)
-- 3. Run this SQL in Supabase SQL Editor.

create table if not exists public.feature_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  contact_email text not null,
  status text not null default 'submitted'
    check (status in ('submitted', 'quoted', 'approved', 'rejected')),
  budget text,
  payment_deadline date,
  delivery_deadline date,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- API uses service_role key and bypasses RLS. No client direct access.
alter table public.feature_requests enable row level security;

-- Optional: trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists feature_requests_updated_at on public.feature_requests;
create trigger feature_requests_updated_at
  before update on public.feature_requests
  for each row execute function public.set_updated_at();
