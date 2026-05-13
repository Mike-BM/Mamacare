-- Consolidate appointments system
-- Ensure appointments table has all necessary fields
DO $$ 
BEGIN
  -- Add provider_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='provider_id') THEN
    ALTER TABLE public.appointments ADD COLUMN provider_id uuid REFERENCES public.providers(id);
  END IF;

  -- Add status enum consistency
  -- Status is already there but let's make sure it has 'video' type if needed
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='video_room_url') THEN
    ALTER TABLE public.appointments ADD COLUMN video_room_url text;
  END IF;

  -- Add patient_notes if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='patient_notes') THEN
    ALTER TABLE public.appointments ADD COLUMN patient_notes text;
  END IF;
END $$;

-- Ensure RLS allows providers to see appointments
DROP POLICY IF EXISTS "Providers see own appointments" ON public.appointments;
CREATE POLICY "Providers see own appointments" ON public.appointments
FOR ALL USING (
  provider_id = auth.uid() OR 
  hospital_id IN (SELECT id FROM public.hospitals WHERE user_id = auth.uid())
);
