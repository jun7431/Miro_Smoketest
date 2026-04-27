create extension if not exists "pgcrypto";

create table if not exists public.tracking_events (
  id text primary key,
  type text not null check (type in ('visit', 'cta_click', 'signup_submitted', 'payment_click')),
  timestamp timestamptz not null default timezone('utc', now()),
  page text not null,
  label text not null,
  normalized_name text not null,
  referrer text,
  user_agent text,
  session_id text,
  anonymous_id text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists tracking_events_timestamp_idx
  on public.tracking_events (timestamp desc);

create index if not exists tracking_events_type_timestamp_idx
  on public.tracking_events (type, timestamp desc);

create table if not exists public.signup_submissions (
  id text primary key,
  timestamp timestamptz not null default timezone('utc', now()),
  page text not null,
  name text,
  email text not null,
  phone text,
  language_or_nationality text,
  use_case text,
  area text,
  message text,
  consent boolean not null,
  source text,
  referrer text,
  user_agent text,
  session_id text,
  anonymous_id text
);

create index if not exists signup_submissions_timestamp_idx
  on public.signup_submissions (timestamp desc);

create index if not exists signup_submissions_email_timestamp_idx
  on public.signup_submissions (email, timestamp desc);
