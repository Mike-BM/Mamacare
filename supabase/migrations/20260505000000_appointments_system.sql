-- Providers (extends Supabase auth.users)
create table if not exists providers (
  id uuid references auth.users(id) primary key,
  full_name text not null,
  role text check (role in ('doctor', 'nurse', 'midwife')) not null,
  specialty text, -- e.g., 'obstetrics', 'general'
  license_number text unique,
  phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Patients
create table if not exists patients (
  id uuid references auth.users(id) primary key,
  full_name text not null,
  phone text not null,
  due_date date, -- estimated delivery date
  pregnancy_week int generated always as (
    extract(day from (now() - (due_date - interval '280 days'))) / 7
  ) stored,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz default now()
);

-- Availability slots (providers set these)
create table if not exists availability (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references providers(id) not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  is_booked boolean default false,
  created_at timestamptz default now()
);

-- Appointments
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id) not null,
  provider_id uuid references providers(id) not null,
  availability_id uuid references availability(id) unique not null,
  status text check (status in (
    'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
  )) default 'pending',
  type text check (type in ('in_person', 'video', 'follow_up')) default 'in_person',
  reason text, -- chief complaint
  notes text, -- provider writes this post-visit
  patient_notes text, -- symptoms, concerns shared before visit
  video_room_url text, -- Daily.co room URL
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on all tables
alter table providers enable row level security;
alter table patients enable row level security;
alter table availability enable row level security;
alter table appointments enable row level security;

-- RLS Policies

-- Providers: can only see their own data
create policy "Providers see own profile"
  on providers for select
  using (auth.uid() = id);

create policy "Providers manage own availability"
  on availability for all
  using (auth.uid() = provider_id);

-- Appointments: providers see theirs, patients see theirs
create policy "Providers see own appointments"
  on appointments for select
  using (auth.uid() = provider_id);

create policy "Patients see own appointments"
  on appointments for select
  using (auth.uid() = patient_id);

-- Availability: patients can see open slots
create policy "Patients see available slots"
  on availability for select
  using (is_booked = false);
