-- Update handle_new_user to handle Super Admin elevation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role text;
  full_name text;
  is_super_admin boolean;
BEGIN
  -- Define the Master Super Admin Email
  IF new.email = 'superadmin@mamacare.com' THEN
    user_role := 'admin';
    is_super_admin := true;
  ELSE
    user_role := new.raw_user_meta_data->>'role';
    is_super_admin := false;
  END IF;

  full_name := new.raw_user_meta_data->>'full_name';

  -- Insert into profiles with super_admin flag if you have the column, 
  -- or just use the 'admin' role for now.
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
