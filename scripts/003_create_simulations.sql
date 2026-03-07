-- Create simulations table for storing tax calculation snapshots
-- Each simulation captures wizard answers and computed results

CREATE TABLE IF NOT EXISTS public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Required tax year field (2020-2030 range for validation)
  tax_year INTEGER NOT NULL CHECK (tax_year >= 2020 AND tax_year <= 2030),
  
  -- Simulation metadata
  name TEXT NOT NULL DEFAULT 'Ma simulation',
  description TEXT,
  
  -- Snapshot data stored as JSONB for flexibility
  wizard_answers JSONB NOT NULL,
  tax_result JSONB NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own simulations
CREATE POLICY "simulations_select_own" ON public.simulations 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "simulations_insert_own" ON public.simulations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "simulations_update_own" ON public.simulations 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "simulations_delete_own" ON public.simulations 
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON public.simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_tax_year ON public.simulations(tax_year);
CREATE INDEX IF NOT EXISTS idx_simulations_user_year ON public.simulations(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_simulations_created_at ON public.simulations(created_at DESC);
