-- Create AI tables
CREATE TABLE public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  encrypted_content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'emergency')),
  model_used TEXT NOT NULL,
  response_time_ms INTEGER,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.risk_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID REFERENCES public.ai_conversations(id),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'emergency')),
  symptoms JSONB,
  recommended_action TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS policies
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI conversations"
ON public.ai_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI conversations"
ON public.ai_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own risk assessments"
ON public.risk_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own risk assessments"
ON public.risk_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);
