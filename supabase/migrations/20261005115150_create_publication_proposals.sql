alter table public.publication_proposals
  drop constraint if exists publication_proposals_proposal_type_check;

alter table public.publication_proposals
  drop constraint if exists publication_proposals_expected_current_version_check;

alter table public.publication_proposals
  drop constraint if exists publication_proposals_proposed_version_check;

alter table public.publication_proposals
  add constraint publication_proposals_proposal_type_check
  check (proposal_type in ('CREATE', 'REPLACE'));

alter table public.publication_proposals
  add constraint publication_proposals_version_semantics_check
  check (
    (
      proposal_type = 'CREATE'
      and expected_current_version = 0
      and proposed_version = 1
    )
    or
    (
      proposal_type = 'REPLACE'
      and expected_current_version > 0
      and proposed_version > expected_current_version
    )
  );


create or replace function public.approve_publication_proposal(
  p_proposal_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_article_key text;
  v_path text;
  v_proposal_type text;
  v_expected_current_version integer;
  v_proposed_version integer;
  v_proposal_status text;
  v_payload jsonb;
begin
  select
    article_key,
    path,
    proposal_type,
    expected_current_version,
    proposed_version,
    proposal_status,
    payload
  into
    v_article_key,
    v_path,
    v_proposal_type,
    v_expected_current_version,
    v_proposed_version,
    v_proposal_status,
    v_payload
  from public.publication_proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'publication proposal does not exist';
  end if;

  if v_proposal_status <> 'PENDING' then
    raise exception 'publication proposal is not pending';
  end if;

  if v_article_key is null or btrim(v_article_key) = '' then
    raise exception 'article_key must be non-empty';
  end if;

  if v_path is null or left(v_path, 1) <> '/' then
    raise exception 'path must be an absolute pathname';
  end if;


  if v_proposal_type = 'CREATE' then

    if v_expected_current_version <> 0
      or v_proposed_version <> 1 then
      raise exception 'invalid CREATE publication versions';
    end if;

    /*
     * Lock article identity and route independently.
     *
     * This prevents two concurrent CREATE approvals from using:
     * - the same article_key with different paths; or
     * - different article_keys with the same path.
     */
    perform pg_advisory_xact_lock(
      hashtextextended(
        'publication-article-key:' || v_article_key,
        0
      )
    );

    perform pg_advisory_xact_lock(
      hashtextextended(
        'publication-path:' || v_path,
        0
      )
    );

    if exists (
      select 1
      from public.publications
      where article_key = v_article_key
        and publication_status = 'PUBLISHED'
    ) then
      raise exception 'article key already has a published publication';
    end if;

    if exists (
      select 1
      from public.publications
      where path = v_path
        and publication_status = 'PUBLISHED'
    ) then
      raise exception 'publication path is already published';
    end if;

    if exists (
      select 1
      from public.publications
      where article_key = v_article_key
        and version = v_proposed_version
    ) then
      raise exception 'article version already exists';
    end if;

    insert into public.publications (
      article_key,
      path,
      article_type,
      version,
      publication_status,
      published_at,
      payload
    )
    values (
      v_article_key,
      v_path,
      'recommendation_comparison',
      v_proposed_version,
      'PUBLISHED',
      now(),
      v_payload
    );


  elsif v_proposal_type = 'REPLACE' then

    if v_expected_current_version < 1
      or v_proposed_version <= v_expected_current_version then
      raise exception 'invalid REPLACE publication versions';
    end if;

    /*
     * Preserve the already-proven replacement implementation.
     */
    perform public.replace_publication(
      v_article_key,
      v_expected_current_version,
      v_proposed_version,
      v_path,
      'recommendation_comparison',
      v_payload
    );


  else
    raise exception 'unsupported publication proposal type';
  end if;


  update public.publication_proposals
  set
    proposal_status = 'PUBLISHED',
    approved_at = now()
  where id = p_proposal_id
    and proposal_status = 'PENDING';

  if not found then
    raise exception 'publication proposal changed during approval';
  end if;
end;
$$;


revoke all on function public.approve_publication_proposal(uuid)
  from public;

revoke all on function public.approve_publication_proposal(uuid)
  from anon;

revoke all on function public.approve_publication_proposal(uuid)
  from authenticated;

grant execute on function public.approve_publication_proposal(uuid)
  to service_role;