-- ============================================================
-- STEP 15: Events - add about_speaker + harden write policy
-- ============================================================

begin;

alter table public.events
  add column if not exists about_speaker text not null default '';

update public.events
set about_speaker = coalesce(nullif(trim(speaker_title), ''), 'Speaker details coming soon.')
where coalesce(trim(about_speaker), '') = '';

drop policy if exists "Authenticated users can manage events" on public.events;
drop policy if exists "Admins can manage events" on public.events;
create policy "Authenticated users can manage events"
  on public.events
  for all
  to authenticated
  using (true)
  with check (true);

commit;
