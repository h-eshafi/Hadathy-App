-- Add buyer_name column to orders table to store the name entered during checkout
-- Run this in your Supabase SQL Editor

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS buyer_name TEXT;

-- Optionally backfill existing orders from profile full_name
UPDATE public.orders o
SET buyer_name = p.full_name
FROM public.profiles p
WHERE o.buyer_id = p.id
  AND o.buyer_name IS NULL
  AND p.full_name IS NOT NULL;

-- Fix is_featured default: new events should NOT be featured by default
ALTER TABLE public.events
ALTER COLUMN is_featured SET DEFAULT false;

-- Reset any events that were accidentally set to featured=true at creation
-- (Only run this if you want to un-feature all events and re-feature manually)
-- UPDATE public.events SET is_featured = false WHERE is_featured IS NULL;
