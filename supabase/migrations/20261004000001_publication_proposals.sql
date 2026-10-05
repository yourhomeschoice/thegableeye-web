create table public.publication_proposals (
  id uuid primary key default gen_random_uuid(),
  article_key text not null,
  path text not null,
  proposal_type text not null check (proposal_type = 'REPLACE'),
  expected_current_version integer not null check (expected_current_version > 0),
  proposed_version integer not null check (proposed_version > expected_current_version),
  proposal_status text not null check (proposal_status in ('PENDING', 'PUBLISHED', 'REJECTED')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  approval_note text,
  check (
    (proposal_status = 'PENDING' and approved_at is null and rejected_at is null)
    or (proposal_status = 'PUBLISHED' and approved_at is not null and rejected_at is null)
    or (proposal_status = 'REJECTED' and approved_at is null and rejected_at is not null)
  )
);

create unique index publication_proposals_one_pending_version
  on public.publication_proposals (article_key, proposed_version)
  where proposal_status = 'PENDING';

alter table public.publication_proposals enable row level security;

revoke all on table public.publication_proposals from public;
revoke all on table public.publication_proposals from anon;
revoke all on table public.publication_proposals from authenticated;
grant select, insert, update on table public.publication_proposals to service_role;

create or replace function public.guard_publication_proposal_update()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if old.article_key is distinct from new.article_key
    or old.path is distinct from new.path
    or old.proposal_type is distinct from new.proposal_type
    or old.expected_current_version is distinct from new.expected_current_version
    or old.proposed_version is distinct from new.proposed_version
    or old.payload is distinct from new.payload
    or old.created_at is distinct from new.created_at then
    raise exception 'publication proposal content is immutable';
  end if;
  if old.proposal_status <> 'PENDING'
    or new.proposal_status not in ('PUBLISHED', 'REJECTED') then
    raise exception 'invalid publication proposal status transition';
  end if;
  return new;
end;
$$;

create trigger publication_proposals_immutable_content
before update on public.publication_proposals
for each row execute function public.guard_publication_proposal_update();

create or replace function public.approve_publication_proposal(p_proposal_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog
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
  select article_key, path, proposal_type, expected_current_version, proposed_version, proposal_status, payload
  into v_article_key, v_path, v_proposal_type, v_expected_current_version, v_proposed_version, v_proposal_status, v_payload
  from public.publication_proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'publication proposal does not exist';
  end if;
  if v_proposal_status <> 'PENDING' then
    raise exception 'publication proposal is not pending';
  end if;
  if v_proposal_type <> 'REPLACE' then
    raise exception 'unsupported publication proposal type';
  end if;

  perform public.replace_publication(
    v_article_key,
    v_expected_current_version,
    v_proposed_version,
    v_path,
    'recommendation_comparison',
    v_payload
  );

  update public.publication_proposals
  set proposal_status = 'PUBLISHED', approved_at = now()
  where id = p_proposal_id and proposal_status = 'PENDING';
  if not found then
    raise exception 'publication proposal changed during approval';
  end if;
end;
$$;

revoke all on function public.approve_publication_proposal(uuid) from public;
revoke all on function public.approve_publication_proposal(uuid) from anon;
revoke all on function public.approve_publication_proposal(uuid) from authenticated;
grant execute on function public.approve_publication_proposal(uuid) to service_role;
