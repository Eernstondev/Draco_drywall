create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 1 and 100),
  last_name text not null check (char_length(last_name) between 1 and 100),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) between 7 and 40),
  project_type text not null,
  property_type text not null,
  project_address text not null,
  description text not null check (char_length(description) >= 20),
  contact_method text not null check (contact_method in ('email', 'phone', 'text')),
  photo_paths text[] not null default '{}',
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

revoke all on public.quote_requests from anon, authenticated;
grant insert (
  first_name,
  last_name,
  email,
  phone,
  project_type,
  property_type,
  project_address,
  description,
  contact_method,
  photo_paths
) on public.quote_requests to anon;

drop policy if exists public_quote_requests_insert on public.quote_requests;
create policy public_quote_requests_insert
  on public.quote_requests
  for insert
  to anon
  with check (true);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-photos',
  'quote-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists public_quote_photos_insert on storage.objects;
create policy public_quote_photos_insert
  on storage.objects
  for insert
  to anon
  with check (
    bucket_id = 'quote-photos'
    and (storage.foldername(name))[1] = 'quote-requests'
  );