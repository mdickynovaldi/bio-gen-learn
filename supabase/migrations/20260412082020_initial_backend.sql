create extension if not exists pgcrypto;

create schema if not exists private;

create type public.app_role as enum ('admin', 'student');
create type public.module_content_type as enum ('text', 'image', 'youtube', 'link', 'pdf');
create type public.ethics_case_content_type as enum ('text', 'pdf', 'link');

create table public.admin_invites (
  email text primary key,
  created_at timestamp with time zone not null default timezone('utc', now()),
  constraint admin_invites_email_format check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null,
  role public.app_role not null default 'student',
  avatar_url text,
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now())
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  track text not null default 'Biologi Modern',
  short_description text not null,
  opening_narrative text not null,
  learning_objectives text[] not null default '{}',
  thumbnail_path text,
  thumbnail_url text,
  estimated_duration_minutes integer not null default 60,
  level text not null default 'Pemula',
  is_featured boolean not null default false,
  is_published boolean not null default false,
  author_id uuid not null references public.users (id) on delete restrict,
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now()),
  constraint modules_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint modules_duration_positive check (estimated_duration_minutes > 0)
);

create table public.module_contents (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  sequence integer not null,
  type public.module_content_type not null,
  title text not null,
  summary text,
  content_data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now()),
  constraint module_contents_sequence_positive check (sequence > 0),
  constraint module_contents_unique_sequence unique (module_id, sequence)
);

create table public.ethics_cases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  content_type public.ethics_case_content_type not null,
  content_value text not null,
  cover_path text,
  cover_url text,
  is_published boolean not null default false,
  published_at timestamp with time zone,
  author_id uuid not null references public.users (id) on delete restrict,
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now()),
  constraint ethics_cases_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create index modules_published_idx
  on public.modules (is_published, is_featured, created_at desc);

create index module_contents_module_sequence_idx
  on public.module_contents (module_id, sequence);

create index ethics_cases_published_idx
  on public.ethics_cases (is_published, published_at desc nulls last, created_at desc);

create or replace function private.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users
    where id = user_id
      and role = 'admin'::public.app_role
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create or replace function public.sync_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_role public.app_role;
  display_name text;
begin
  next_role := case
    when exists (
      select 1
      from public.admin_invites
      where lower(email) = lower(coalesce(new.email, ''))
    ) then 'admin'::public.app_role
    else 'student'::public.app_role
  end;

  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'Pengguna'
  );

  insert into public.users (id, email, name, role)
  values (new.id, coalesce(new.email, ''), display_name, next_role)
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(nullif(excluded.name, ''), public.users.name),
    role = case
      when public.users.role = 'admin'::public.app_role
        or excluded.role = 'admin'::public.app_role
      then 'admin'::public.app_role
      else 'student'::public.app_role
    end,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.apply_admin_invite()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users
  set
    role = 'admin'::public.app_role,
    updated_at = timezone('utc', now())
  where lower(email) = lower(new.email);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.sync_auth_user();

create trigger on_auth_user_updated
  after update of email, raw_user_meta_data on auth.users
  for each row execute function public.sync_auth_user();

create trigger admin_invite_promotes_user
  after insert or update on public.admin_invites
  for each row execute function public.apply_admin_invite();

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger modules_set_updated_at
  before update on public.modules
  for each row execute function public.set_updated_at();

create trigger module_contents_set_updated_at
  before update on public.module_contents
  for each row execute function public.set_updated_at();

create trigger ethics_cases_set_updated_at
  before update on public.ethics_cases
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'learning-assets',
  'learning-assets',
  true,
  52428800,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

grant usage on schema public to anon, authenticated;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin(uuid) to anon, authenticated;

grant select on public.modules, public.module_contents, public.ethics_cases to anon, authenticated;
grant select on public.users to authenticated;
grant insert, update, delete on public.modules, public.module_contents, public.ethics_cases to authenticated;

alter table public.admin_invites enable row level security;
alter table public.users enable row level security;
alter table public.modules enable row level security;
alter table public.module_contents enable row level security;
alter table public.ethics_cases enable row level security;

revoke all on public.admin_invites from anon, authenticated;

create policy "users can view their own profile"
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "published modules are readable"
  on public.modules
  for select
  using (
    is_published
    or private.is_admin((select auth.uid()))
  );

create policy "admins can insert modules"
  on public.modules
  for insert
  to authenticated
  with check (private.is_admin((select auth.uid())));

create policy "admins can update modules"
  on public.modules
  for update
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

create policy "admins can delete modules"
  on public.modules
  for delete
  to authenticated
  using (private.is_admin((select auth.uid())));

create policy "visible module contents are readable"
  on public.module_contents
  for select
  using (
    exists (
      select 1
      from public.modules
      where public.modules.id = module_contents.module_id
        and (
          public.modules.is_published
          or private.is_admin((select auth.uid()))
        )
    )
  );

create policy "admins can insert module contents"
  on public.module_contents
  for insert
  to authenticated
  with check (private.is_admin((select auth.uid())));

create policy "admins can update module contents"
  on public.module_contents
  for update
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

create policy "admins can delete module contents"
  on public.module_contents
  for delete
  to authenticated
  using (private.is_admin((select auth.uid())));

create policy "published ethics cases are readable"
  on public.ethics_cases
  for select
  using (
    is_published
    or private.is_admin((select auth.uid()))
  );

create policy "admins can insert ethics cases"
  on public.ethics_cases
  for insert
  to authenticated
  with check (private.is_admin((select auth.uid())));

create policy "admins can update ethics cases"
  on public.ethics_cases
  for update
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

create policy "admins can delete ethics cases"
  on public.ethics_cases
  for delete
  to authenticated
  using (private.is_admin((select auth.uid())));

create policy "learning assets are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'learning-assets');

create policy "admins can upload learning assets"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'learning-assets'
    and private.is_admin((select auth.uid()))
  );

create policy "admins can update learning assets"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'learning-assets'
    and private.is_admin((select auth.uid()))
  )
  with check (
    bucket_id = 'learning-assets'
    and private.is_admin((select auth.uid()))
  );

create policy "admins can delete learning assets"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'learning-assets'
    and private.is_admin((select auth.uid()))
  );
