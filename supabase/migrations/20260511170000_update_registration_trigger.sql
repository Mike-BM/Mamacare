-- Update handle_new_user to populate role-specific tables
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role text;
  full_name text;
BEGIN
  user_role := new.raw_user_meta_data->>'role';
  full_name := new.raw_user_meta_data->>'full_name';

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, full_name, user_role);

  -- Role-specific insertions
  IF user_role = 'mother' THEN
    INSERT INTO public.mothers (user_id, full_name)
    VALUES (new.id, full_name);
  ELSIF user_role = 'doctor' OR user_role = 'provider' THEN
    INSERT INTO public.providers (id, full_name, role)
    VALUES (new.id, full_name, 'doctor');
  END IF;

  RETURN new;
END;
$$;
