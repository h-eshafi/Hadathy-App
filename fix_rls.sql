-- Fix for events and ticket tiers select policies
begin;

-- Drop existing restrictive read policies
drop policy if exists "events_public_read_active" on public.events;
drop policy if exists "tiers_read_for_visible_events" on public.ticket_tiers;

-- Allow reading events if they are active, or if it is the organizer, or an admin
create policy "events_public_read_active" on public.events
for select using (
  status = 'active'
  or organizer_id = auth.uid()
  or public.current_user_role() = 'admin'
);

-- Allow reading ticket tiers for events that are visible based on the events policy
create policy "tiers_read_for_visible_events" on public.ticket_tiers
for select using (
  exists (
    select 1 from public.events e
    where e.id = ticket_tiers.event_id
  )
);

commit;
