-- Add KMPDC verification to providers
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS kmpdc_license text UNIQUE,
ADD COLUMN IF NOT EXISTS verification_status text CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS hospital_affiliation text;

-- Create MamaRide tables
CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  vehicle_type text CHECK (vehicle_type IN ('car', 'ambulance', 'boda')),
  vehicle_reg text,
  is_active boolean DEFAULT true,
  current_location point,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mamaride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id uuid REFERENCES public.mothers(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.drivers(id),
  pickup_location text NOT NULL,
  destination_location text,
  ride_type text CHECK (ride_type IN ('standard', 'ambulance', 'boda')),
  status text CHECK (status IN ('requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled')) DEFAULT 'requested',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mamaride_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drivers
CREATE POLICY "Drivers can view their own data" ON public.drivers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Drivers can update their own data" ON public.drivers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Everyone can view active drivers" ON public.drivers FOR SELECT USING (is_active = true);

-- RLS Policies for MamaRide requests
CREATE POLICY "Mothers can view their own ride requests" ON public.mamaride_requests FOR SELECT USING (
  mother_id IN (SELECT id FROM public.mothers WHERE user_id = auth.uid())
);
CREATE POLICY "Mothers can create ride requests" ON public.mamaride_requests FOR INSERT WITH CHECK (
  mother_id IN (SELECT id FROM public.mothers WHERE user_id = auth.uid())
);
CREATE POLICY "Drivers can view available ride requests" ON public.mamaride_requests FOR SELECT USING (
  status = 'requested' OR driver_id = auth.uid()
);
CREATE POLICY "Drivers can accept/update ride requests" ON public.mamaride_requests FOR UPDATE USING (
  driver_id IS NULL OR driver_id = auth.uid()
);

-- Trigger for updated_at
CREATE TRIGGER update_mamaride_requests_updated_at BEFORE UPDATE ON public.mamaride_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
