-- Create the 'polls' table to store poll questions
CREATE TABLE IF NOT EXISTS public.polls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    ends_at timestamptz NULL,
    user_id uuid NULL
);

-- Create the 'options' table to store choices for each poll
CREATE TABLE IF NOT EXISTS public.options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    text text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create the 'votes' table to record user votes
CREATE TABLE IF NOT EXISTS public.votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    option_id uuid NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
    user_id uuid NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Add unique constraint to prevent multiple votes per user per poll
CREATE UNIQUE INDEX IF NOT EXISTS user_poll_vote_unique ON public.votes (user_id, poll_id) WHERE (user_id IS NOT NULL);

-- Enable Row Level Security
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to create polls" ON public.polls FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow all users to view polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Allow poll creators to update their polls" ON public.polls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow poll creators to delete their polls" ON public.polls FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Allow all users to view options" ON public.options FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create options for their polls" ON public.options FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.polls WHERE public.polls.id = public.options.poll_id AND public.polls.user_id = auth.uid())
);

CREATE POLICY "Allow authenticated users to vote once per poll" ON public.votes FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND user_id = auth.uid()
);
CREATE POLICY "Allow anonymous users to vote" ON public.votes FOR INSERT WITH CHECK (
    auth.role() = 'anon' AND user_id IS NULL
);
CREATE POLICY "Allow all users to view votes" ON public.votes FOR SELECT USING (true);
