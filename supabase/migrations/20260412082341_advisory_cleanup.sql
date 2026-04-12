create index modules_author_id_idx
  on public.modules (author_id);

create index ethics_cases_author_id_idx
  on public.ethics_cases (author_id);

create policy "admin invites are never exposed"
  on public.admin_invites
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);
