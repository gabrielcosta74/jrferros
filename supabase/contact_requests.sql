create table if not exists public.contact_requests (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create index if not exists contact_requests_created_at_idx
  on public.contact_requests (created_at desc);
