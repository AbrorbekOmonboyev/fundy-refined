-- =============================================================================
-- Minimal stand-in for what a real Supabase database provides, so the
-- migrations can be tested in an in-memory Postgres (PGlite) without Docker.
-- ONLY used by tests — never applied to a real Supabase project.
-- =============================================================================

-- Roles
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

-- Supabase's default: new tables in public are open to API roles
-- (our security migration deliberately undoes this).
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- auth schema
create schema auth;
grant usage on schema auth to anon, authenticated, service_role;

create table auth.users (
  instance_id             uuid,
  id                      uuid primary key,
  aud                     text,
  role                    text,
  email                   text unique,
  encrypted_password      text,
  email_confirmed_at      timestamptz,
  raw_app_meta_data       jsonb,
  raw_user_meta_data      jsonb,
  confirmation_token      text,
  recovery_token          text,
  email_change_token_new  text,
  email_change            text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- Same definition Supabase uses: the user id from the request's JWT.
create function auth.uid() returns uuid language sql stable as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claim.sub', true),
      current_setting('request.jwt.claims', true)::jsonb ->> 'sub'
    ), ''
  )::uuid
$$;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- storage schema
create schema storage;
grant usage on schema storage to anon, authenticated, service_role;

create table storage.buckets (
  id                  text primary key,
  name                text not null,
  public              boolean default false,
  file_size_limit     bigint,
  allowed_mime_types  text[]
);

create table storage.objects (
  id         uuid primary key default gen_random_uuid(),
  bucket_id  text references storage.buckets (id),
  name       text not null,
  owner      uuid,
  created_at timestamptz default now()
);
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to authenticated;

create function storage.foldername(name text) returns text[] language sql immutable as $$
  select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
$$;
grant execute on function storage.foldername(text) to anon, authenticated;
