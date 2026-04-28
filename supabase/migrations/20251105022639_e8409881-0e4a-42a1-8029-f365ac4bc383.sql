-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  full_name text,
  role text CHECK (role IN ('mother', 'hospital', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mothers table
CREATE TABLE IF NOT EXISTS public.mothers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  pregnancy_stage int CHECK (pregnancy_stage >= 1 AND pregnancy_stage <= 40),
  due_date date,
  health_data jsonb DEFAULT '{}',
  sos_status boolean DEFAULT false,
  last_checkup timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text,
  contact_phone text,
  contact_email text,
  available_slots int DEFAULT 0,
  specialists jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id uuid REFERENCES public.mothers(id) ON DELETE CASCADE,
  hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  status text CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  appointment_type text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create emergency alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id uuid REFERENCES public.mothers(id) ON DELETE CASCADE,
  hospital_id uuid REFERENCES public.hospitals(id),
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  message text,
  status text CHECK (status IN ('active', 'responded', 'resolved')) DEFAULT 'active',
  response_time timestamptz,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create chat messages table for AI assistant
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text CHECK (role IN ('user', 'assistant')) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create community posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  likes int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mothers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for mothers
CREATE POLICY "Mothers can view their own data" ON public.mothers FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id));
CREATE POLICY "Mothers can update their own data" ON public.mothers FOR UPDATE USING (user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id));
CREATE POLICY "Mothers can insert their own data" ON public.mothers FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id));
CREATE POLICY "Hospitals can view mothers" ON public.mothers FOR SELECT USING (true);

-- RLS Policies for hospitals
CREATE POLICY "Hospitals can view their own data" ON public.hospitals FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id));
CREATE POLICY "Hospitals can update their own data" ON public.hospitals FOR UPDATE USING (user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id));
CREATE POLICY "Hospitals can insert their own data" ON public.hospitals FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id));
CREATE POLICY "Everyone can view hospitals" ON public.hospitals FOR SELECT USING (true);

-- RLS Policies for appointments
CREATE POLICY "Users can view their appointments" ON public.appointments FOR SELECT USING (
  mother_id IN (SELECT id FROM public.mothers WHERE user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id))
  OR hospital_id IN (SELECT id FROM public.hospitals WHERE user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id))
);
CREATE POLICY "Mothers can create appointments" ON public.appointments FOR INSERT WITH CHECK (
  mother_id IN (SELECT id FROM public.mothers WHERE user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id))
);
CREATE POLICY "Hospitals can update appointments" ON public.appointments FOR UPDATE USING (
  hospital_id IN (SELECT id FROM public.hospitals WHERE user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id))
);

-- RLS Policies for alerts
CREATE POLICY "Users can view their alerts" ON public.alerts FOR SELECT USING (
  mother_id IN (SELECT id FROM public.mothers WHERE user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id))
  OR hospital_id IN (SELECT id FROM public.hospitals WHERE user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id))
);
CREATE POLICY "Mothers can create alerts" ON public.alerts FOR INSERT WITH CHECK (
  mother_id IN (SELECT id FROM public.mothers WHERE user_id IN (SELECT id FROM public.profiles WHERE auth.uid() = id))
);

-- RLS Policies for chat messages
CREATE POLICY "Users can view their messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for community posts
CREATE POLICY "Everyone can view posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their posts" ON public.community_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their posts" ON public.community_posts FOR DELETE USING (auth.uid() = author_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mothers_updated_at BEFORE UPDATE ON public.mothers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();