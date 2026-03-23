-- Add optimisations column to simulations table for storing optimization results
-- This column stores the computed optimization items, totals, notes, and flags

ALTER TABLE public.simulations
ADD COLUMN optimisations JSONB;

-- Create index for efficient querying of simulations by optimization status
CREATE INDEX IF NOT EXISTS idx_simulations_optimisations ON public.simulations USING GIN(optimisations);
