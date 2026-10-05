create or replace function public.reject_publication_proposal(
  p_proposal_id uuid,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_status text;
begin
  if p_note is not null and char_length(btrim(p_note)) > 500 then
    raise exception 'rejection note must be 500 characters or fewer';
  end if;

  select proposal_status
  into v_status
  from public.publication_proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'publication proposal does not exist';
  end if;
  if v_status <> 'PENDING' then
    raise exception 'publication proposal is not pending';
  end if;

  update public.publication_proposals
  set proposal_status = 'REJECTED',
      rejected_at = now(),
      approval_note = nullif(btrim(p_note), '')
  where id = p_proposal_id and proposal_status = 'PENDING';
  if not found then
    raise exception 'publication proposal changed during rejection';
  end if;
end;
$$;

revoke all on function public.reject_publication_proposal(uuid, text) from public;
revoke all on function public.reject_publication_proposal(uuid, text) from anon;
revoke all on function public.reject_publication_proposal(uuid, text) from authenticated;
grant execute on function public.reject_publication_proposal(uuid, text) to service_role;

create or replace function public.verify_stale_publication_proposal_rejection(
  p_article_key text,
  p_path text,
  p_stale_expected_version integer,
  p_synthetic_version integer
)
returns text
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_current_count integer := 0;
  v_current_version integer;
  v_payload jsonb;
  v_failure text;
begin
  if p_stale_expected_version < 1 or p_synthetic_version <= p_stale_expected_version then
    raise exception 'invalid stale proposal test versions';
  end if;
  if exists (select 1 from public.publications where article_key = p_article_key and version = p_synthetic_version)
    or exists (select 1 from public.publication_proposals where article_key = p_article_key and proposed_version = p_synthetic_version) then
    raise exception 'synthetic version already exists';
  end if;

  for v_current_version, v_payload in
    select version, payload
    from public.publications
    where article_key = p_article_key and path = p_path and publication_status = 'PUBLISHED'
    for share
  loop
    v_current_count := v_current_count + 1;
  end loop;
  if v_current_count <> 1 then
    raise exception 'expected exactly one current published row';
  end if;
  if v_current_version = p_stale_expected_version then
    raise exception 'stale expected version matches current version';
  end if;

  begin
    insert into public.publication_proposals (
      article_key, path, proposal_type, expected_current_version, proposed_version, proposal_status, payload
    ) values (
      p_article_key, p_path, 'REPLACE', p_stale_expected_version, p_synthetic_version, 'PENDING', v_payload
    );
    perform public.approve_publication_proposal(
      (select id from public.publication_proposals where article_key = p_article_key and proposed_version = p_synthetic_version)
    );
    raise exception 'stale proposal approval unexpectedly succeeded';
  exception when others then
    v_failure := sqlerrm;
  end;

  if v_failure <> 'current published version does not match expected version' then
    raise exception 'unexpected stale proposal approval result: %', v_failure;
  end if;
  if exists (select 1 from public.publications where article_key = p_article_key and version = p_synthetic_version)
    or exists (select 1 from public.publication_proposals where article_key = p_article_key and proposed_version = p_synthetic_version) then
    raise exception 'synthetic stale proposal test residue exists';
  end if;
  return v_failure;
end;
$$;

revoke all on function public.verify_stale_publication_proposal_rejection(text, text, integer, integer) from public;
revoke all on function public.verify_stale_publication_proposal_rejection(text, text, integer, integer) from anon;
revoke all on function public.verify_stale_publication_proposal_rejection(text, text, integer, integer) from authenticated;
grant execute on function public.verify_stale_publication_proposal_rejection(text, text, integer, integer) to service_role;
