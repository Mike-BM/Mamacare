-- 1. Create Access Logs Table for Audit Trails
CREATE TABLE IF NOT EXISTS access_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  table_name text NOT NULL,
  action text NOT NULL,
  record_id uuid,
  ip_address inet,
  user_agent text,
  accessed_at timestamptz DEFAULT now()
);

-- 2. Create the Logging Function
CREATE OR REPLACE FUNCTION log_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO access_logs (user_id, table_name, action, record_id)
  VALUES (auth.uid(), TG_TABLE_NAME, TG_OP, COALESCE(NEW.id, OLD.id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. Attach Audit Triggers to Critical Tables
-- Monitor Appointments
DROP TRIGGER IF EXISTS appointments_audit ON appointments;
CREATE TRIGGER appointments_audit
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW EXECUTE FUNCTION log_access();

-- Monitor Medical Records (mothers table)
DROP TRIGGER IF EXISTS mothers_audit ON mothers;
CREATE TRIGGER mothers_audit
AFTER UPDATE OR DELETE ON mothers
FOR EACH ROW EXECUTE FUNCTION log_access();

-- 4. Secure Column-Level Encryption (pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Implementation Hint for Admin:
-- To encrypt: pgp_sym_encrypt(phone, 'your-secret-key')
-- To decrypt: pgp_sym_decrypt(encrypted_data, 'your-secret-key')
