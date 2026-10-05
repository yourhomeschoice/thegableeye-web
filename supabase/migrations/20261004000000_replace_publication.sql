alter table public.publications
  add column if not exists superseded_at timestamptz;

create or replace function public.replace_publication(
  p_article_key text,
  p_expected_current_version integer,
  p_new_version integer,
  p_path text,
  p_article_type text,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_current_count integer := 0;
  v_current_version integer;
  v_locked_version integer;
begin
  if p_article_key is null or btrim(p_article_key) = '' then
    raise exception 'article_key must be non-empty';
  end if;
  if p_expected_current_version is null or p_expected_current_version < 1 then
    raise exception 'expected current version must be a positive integer';
  end if;
  if p_new_version is null or p_new_version < 1 or p_new_version <= p_expected_current_version then
    raise exception 'new version must be greater than expected current version';
  end if;
  if p_path is null or left(p_path, 1) <> '/' then
    raise exception 'path must be an absolute pathname';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_article_key || ':' || p_path, 0));

  for v_locked_version in
    select version
    from public.publications
    where article_key = p_article_key
      and path = p_path
      and publication_status = 'PUBLISHED'
    for update
  loop
    v_current_count := v_current_count + 1;
    v_current_version := v_locked_version;
  end loop;

  if v_current_count <> 1 then
    raise exception 'expected exactly one current published row';
  end if;
  if v_current_version <> p_expected_current_version then
    raise exception 'current published version does not match expected version';
  end if;
  if exists (
    select 1
    from public.publications
    where article_key = p_article_key
      and version = p_new_version
  ) then
    raise exception 'new article version already exists';
  end if;

  update public.publications
  set publication_status = 'SUPERSEDED', superseded_at = now()
  where article_key = p_article_key
    and version = v_current_version
    and path = p_path
    and publication_status = 'PUBLISHED';
  if not found then
    raise exception 'current published row changed during replacement';
  end if;

  insert into public.publications (
    article_key, path, article_type, version, publication_status, published_at, payload
  ) values (
    p_article_key, p_path, p_article_type, p_new_version, 'PUBLISHED', now(), p_payload
  );
end;
$$;

revoke all on function public.replace_publication(text, integer, integer, text, text, jsonb) from public;
revoke all on function public.replace_publication(text, integer, integer, text, text, jsonb) from anon;
revoke all on function public.replace_publication(text, integer, integer, text, text, jsonb) from authenticated;
grant execute on function public.replace_publication(text, integer, integer, text, text, jsonb) to service_role;
