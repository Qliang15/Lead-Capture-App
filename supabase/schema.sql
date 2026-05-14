create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  full_name   text         not null,
  email       text         not null,
  company     text,
  source      text         not null check (source in ('Google', 'Referral', 'Social', 'Other')),
  message     text,
  created_at  timestamptz  not null default now()
);

create unique index if not exists leads_email_unique on public.leads (email);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;
