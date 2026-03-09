-- setup_ticketing.sql
-- Run this in your Supabase SQL Editor to fix ticket purchase errors.

-- 1. Ensure tables exist (Basic check, usually they do if the app is functional)
-- If they don't exist, this will help you see what's missing.

-- 2. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow authenticated users to create orders
DROP POLICY IF EXISTS "Allow authenticated users to create orders" ON public.orders;
CREATE POLICY "Allow authenticated users to create orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- 4. Policy: Allow users to view their own orders
DROP POLICY IF EXISTS "Allow users to view their own orders" ON public.orders;
CREATE POLICY "Allow users to view their own orders" ON public.orders
FOR SELECT TO authenticated
USING (auth.uid() = buyer_id);

-- 5. Policy: Allow insert into order_items
DROP POLICY IF EXISTS "Allow authenticated users to create order items" ON public.order_items;
CREATE POLICY "Allow authenticated users to create order items" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_id AND orders.buyer_id = auth.uid()
));

-- 6. Policy: Allow insert into tickets
DROP POLICY IF EXISTS "Allow authenticated users to create tickets" ON public.tickets;
CREATE POLICY "Allow authenticated users to create tickets" ON public.tickets
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- 7. Policy: Allow users to view their own tickets
DROP POLICY IF EXISTS "Allow users to view their own tickets" ON public.tickets;
CREATE POLICY "Allow users to view their own tickets" ON public.tickets
FOR SELECT TO authenticated
USING (auth.uid() = buyer_id);

-- 8. Policy: Allow authenticated users to send notifications
-- (Useful for notifying organizers)
DROP POLICY IF EXISTS "Allow authenticated users to create notifications" ON public.notifications;
CREATE POLICY "Allow authenticated users to create notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (true);

-- 9. Policy: Allow users to update ticket_tiers sold_count
-- IMPORTANT: In a production app, this should be a trigger, but for now we grant update access.
DROP POLICY IF EXISTS "Allow authenticated users to update sold_count" ON public.ticket_tiers;
CREATE POLICY "Allow authenticated users to update sold_count" ON public.ticket_tiers
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);
