-- Pending signups table for two-step signup flow
CREATE TABLE IF NOT EXISTS public.pending_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_pending_signups_token ON public.pending_signups(token);
CREATE INDEX IF NOT EXISTS idx_pending_signups_email ON public.pending_signups(email);
CREATE INDEX IF NOT EXISTS idx_pending_signups_expires ON public.pending_signups(expires_at);
