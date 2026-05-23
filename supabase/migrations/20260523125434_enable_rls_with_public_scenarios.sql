-- Enable RLS on all three public tables.
-- scenarios is public content (client-side lobby/brief reads via the publishable key),
-- so anon SELECT is allowed. No anon writes anywhere.
-- sessions and messages are user data -- no anon access at all. Server code uses the
-- service_role key which bypasses RLS, so future server-side persistence still works.

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_scenarios"
  ON public.scenarios
  FOR SELECT
  TO anon, authenticated
  USING (true);
