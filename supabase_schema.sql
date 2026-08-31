-- ============================================================================
-- JPCS ACADEMIC PORTAL - SUPABASE HYBRID DATABASE & STORAGE SCHEMA
-- ============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- to initialize all academic tables, indexes, and storage bucket permissions.
-- ============================================================================

-- 1. USER CREDENTIALS & PROFILES TABLE (Supabase Database Auth Store)
CREATE TABLE IF NOT EXISTS public.user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    student_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    year_level TEXT DEFAULT '1',
    role TEXT DEFAULT 'student',
    course TEXT DEFAULT 'BSIT',
    officer_position TEXT DEFAULT 'None',
    profile_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure latest columns exist if table was already created
ALTER TABLE public.user_credentials ADD COLUMN IF NOT EXISTS officer_position TEXT DEFAULT 'None';
ALTER TABLE public.user_credentials ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE public.user_credentials ADD COLUMN IF NOT EXISTS selected_semester_id TEXT;
ALTER TABLE public.user_credentials ADD COLUMN IF NOT EXISTS selected_academic_year TEXT;
ALTER TABLE public.user_credentials ADD COLUMN IF NOT EXISTS selected_semester TEXT;

CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON public.user_credentials(email);
CREATE INDEX IF NOT EXISTS idx_user_credentials_student_number ON public.user_credentials(student_number);

-- Seed Administrator Account in Supabase (Change password_hash as desired)
INSERT INTO public.user_credentials (
    email,
    password_hash,
    student_number,
    full_name,
    year_level,
    role,
    course,
    officer_position
) VALUES (
    'admin@sscrmnl.edu.ph',
    'admin123',
    'ADMIN-001',
    'System Administrator',
    '4',
    'admin',
    'BSIT',
    'None'
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name;

-- 2. SEMESTERS TABLE
CREATE TABLE IF NOT EXISTS public.semesters (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    student_number TEXT NOT NULL,
    semester TEXT NOT NULL,          -- e.g. "First Semester", "Second Semester", "Summer"
    academic_year TEXT NOT NULL,     -- e.g. "2026–2027"
    is_active BOOLEAN DEFAULT false,
    course TEXT DEFAULT 'BSIT',
    year_level TEXT DEFAULT '1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.semesters ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
ALTER TABLE public.semesters ADD COLUMN IF NOT EXISTS course TEXT DEFAULT 'BSIT';
ALTER TABLE public.semesters ADD COLUMN IF NOT EXISTS year_level TEXT DEFAULT '1';

CREATE INDEX IF NOT EXISTS idx_semesters_student_number ON public.semesters(student_number);
CREATE INDEX IF NOT EXISTS idx_semesters_user_id ON public.semesters(user_id);

-- 3. SUBJECTS & GRADES TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    semester_id TEXT NOT NULL,
    user_id TEXT,
    student_number TEXT NOT NULL,
    subject_code TEXT NOT NULL,      -- e.g. "IT 204", "CS 101"
    subject_name TEXT NOT NULL,      -- e.g. "Web Systems and Technologies"
    units NUMERIC(3, 1) DEFAULT 3.0 NOT NULL,
    grade NUMERIC(4, 2) DEFAULT 0.00 NOT NULL, -- e.g. 1.25, 1.50, 0.00 (Currently Taking)
    status TEXT DEFAULT 'Currently Taking' NOT NULL, -- 'Passed', 'Failed', 'Incomplete', 'Currently Taking'
    semester TEXT,
    block TEXT,                      -- e.g. "A", "B", "AB"
    subject_block TEXT,              -- e.g. "BSIT-2A", "BSIT-4B"
    year_level TEXT,                 -- e.g. "1", "2", "3", "4"
    schedule_day TEXT,               -- e.g. "M-TH", "T-F", "WED"
    schedule_days TEXT,
    schedule_time TEXT,
    schedule_start TEXT,             -- e.g. "7:30 AM", "1:00 PM"
    schedule_end TEXT,               -- e.g. "9:00 AM", "2:30 PM"
    room TEXT,                       -- e.g. "CLAB 1", "Smart Class"
    faculty TEXT,
    mode TEXT,
    lec_units NUMERIC(3, 1) DEFAULT 0,
    lab_units NUMERIC(3, 1) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS block TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS schedule_days TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS schedule_time TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS faculty TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS mode TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS lec_units NUMERIC(3, 1) DEFAULT 0;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS lab_units NUMERIC(3, 1) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_subjects_student_number ON public.subjects(student_number);
CREATE INDEX IF NOT EXISTS idx_subjects_semester_id ON public.subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);

-- 4. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    publish_date TEXT DEFAULT to_char(now(), 'YYYY-MM-DD'),
    start_date TEXT,
    priority TEXT DEFAULT 'normal', -- 'high', 'normal', 'low'
    status TEXT DEFAULT 'Published',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS start_date TEXT;

-- Seed default announcement if table is empty
INSERT INTO public.announcements (title, description, publish_date, start_date, priority, status)
SELECT 'Official Start of Classes', '1st Semester AY 2026–2027', '2026-08-17', '2026-08-17', 'high', 'Published'
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE title = 'Official Start of Classes');

-- 5. AWARD CRITERIA SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.award_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    award_name TEXT NOT NULL,        -- 'Gold Medalist', 'Silver Medalist', 'Bronze Medalist'
    minimum_average NUMERIC(5, 2) NOT NULL,
    minimum_subject_grade NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default academic award settings if empty
INSERT INTO public.award_settings (award_name, minimum_average, minimum_subject_grade)
SELECT 'Gold Medalist', 95.00, 91.50
WHERE NOT EXISTS (SELECT 1 FROM public.award_settings WHERE award_name = 'Gold Medalist');

INSERT INTO public.award_settings (award_name, minimum_average, minimum_subject_grade)
SELECT 'Silver Medalist', 92.00, 88.50
WHERE NOT EXISTS (SELECT 1 FROM public.award_settings WHERE award_name = 'Silver Medalist');

INSERT INTO public.award_settings (award_name, minimum_average, minimum_subject_grade)
SELECT 'Bronze Medalist', 85.00, 84.50
WHERE NOT EXISTS (SELECT 1 FROM public.award_settings WHERE award_name = 'Bronze Medalist');

-- 6. SUPABASE STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public)
VALUES ('system-images', 'system-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies (Allow public upload & read for system-images)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public System Images Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Users Upload System Images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Users Update System Images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Users Delete System Images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Upload System Images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Read System Images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Update System Images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Delete System Images" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Public Read System Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'system-images');

CREATE POLICY "Public Upload System Images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'system-images');

CREATE POLICY "Public Update System Images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'system-images')
WITH CHECK (bucket_id = 'system-images');

CREATE POLICY "Public Delete System Images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'system-images');

-- 7. ROW LEVEL SECURITY (RLS) FOR DATABASE TABLES
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_settings ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Allow public read of user_credentials"
ON public.user_credentials FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to user_credentials"
ON public.user_credentials FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to user_credentials"
ON public.user_credentials FOR UPDATE
USING (true);

CREATE POLICY "Allow public read of published announcements"
ON public.announcements FOR SELECT
USING (true);

CREATE POLICY "Allow public read of award settings"
ON public.award_settings FOR SELECT
USING (true);

CREATE POLICY "Allow users to read semesters"
ON public.semesters FOR SELECT
USING (true);

CREATE POLICY "Allow users to read subjects"
ON public.subjects FOR SELECT
USING (true);

-- Write policies
CREATE POLICY "Allow insert to semesters"
ON public.semesters FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update to semesters"
ON public.semesters FOR UPDATE
USING (true);

CREATE POLICY "Allow delete to semesters"
ON public.semesters FOR DELETE
USING (true);

CREATE POLICY "Allow insert to subjects"
ON public.subjects FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update to subjects"
ON public.subjects FOR UPDATE
USING (true);

CREATE POLICY "Allow delete to subjects"
ON public.subjects FOR DELETE
USING (true);

-- ============================================================================
-- 8. BSIT CURRICULUM & SCHEDULE TABLE (Official 32-Record Dataset)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bsit_curriculum (
    id BIGINT PRIMARY KEY,
    year_level TEXT NOT NULL,
    revision_status TEXT NOT NULL,
    block TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_description TEXT NOT NULL,
    lec_units INTEGER NOT NULL DEFAULT 0,
    lab_units INTEGER NOT NULL DEFAULT 0,
    days TEXT NOT NULL,
    time TEXT NOT NULL,
    room TEXT NOT NULL,
    student_count INTEGER NOT NULL DEFAULT 0,
    faculty TEXT,
    mode TEXT NOT NULL,
    total_units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bsit_curriculum ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of bsit_curriculum"
ON public.bsit_curriculum FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to bsit_curriculum"
ON public.bsit_curriculum FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to bsit_curriculum"
ON public.bsit_curriculum FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete to bsit_curriculum"
ON public.bsit_curriculum FOR DELETE
USING (true);

-- Seed All 32 Official BSIT Curriculum Records
INSERT INTO public.bsit_curriculum (
    id, year_level, revision_status, block, subject_code, subject_description,
    lec_units, lab_units, days, time, room, student_count, faculty, mode, total_units
) VALUES
-- BSIT 1 (9 records · 24 units)
(1, 'BSIT 1', 'OK REVISED AS OF AUG 23', 'A', 'GEC101', 'Understanding the Self', 3, 0, 'M/T/W/TH', '7:30-9:00', 'C403', 0, 'Dr. Lenn Adolph Arre', 'FTF', 3),
(2, 'BSIT 1', 'OK REVISED AS OF AUG 23', 'A', 'RF1', 'Recoletos Formation 1', 1, 0, 'M', '10:30 - 12:30', 'Smart Class', 0, 'Ms. Ana Manzano', '-', 1),
(3, 'BSIT 1', 'OK REVISED AS OF AUG 23', 'A', 'ITE101', 'Introduction to Computing', 3, 0, 'M/T/W/TH', '1:00 - 2:30', 'C404', 0, 'Regine Anicete', 'FTF / OL', 3),
(4, 'BSIT 1', 'OK REVISED AS OF AUG 23', 'A', 'THEO 101', 'Renewal of Christian Faith', 3, 0, 'M/T/W/TH', '2:30 - 4:00', 'Smart Class', 0, 'Francis Competente', 'FTF', 3),
(5, 'BSIT 1', 'OK REVISED AS OF AUG 23', 'B', 'ITE102', 'Program Logic Formulation & Computer Prog 1', 2, 1, 'M/TH/S', '8:30 - 10:30', 'CLAB 1 / OL', 0, 'Paulo Perminola', 'FTF', 3),
(6, 'BSIT 1', 'OK REVISED AS OF AUG 23', 'B', 'ITP 111', 'Human Computer Interaction', 2, 1, 'T/W/F', '10:30 - 12:30', 'NETLAB', 0, 'Rheymard Doneza', 'FTF', 3),
(7, 'BSIT 1', 'OK REVISED AS OF AUG 23', 'B', 'GEC105', 'Mathematics in the Modern World', 3, 0, 'M/T/W/TH', '1:00-2:30', 'C401', 0, 'Mr. Al John Escobañez', 'FTF', 3),
(8, 'BSIT 1', 'OK REVISED AS OF AUG 23', 'B', 'PHE101', 'Movement Enhancement', 2, 0, 'M/T/W/TH', '2:30-3:30', 'C403', 0, 'Dr. Racquel Bayani', 'FTF', 2),
(9, 'BSIT 1', 'OK REVISED AS OF AUG 23', 'B', 'CWTS1', 'Civic Welfare Training Service 1', 3, 0, 'M/T/W/TH', '4:00-5:30', 'Smart Class', 0, 'Ms. Mary Grace Depalubos', 'FTF', 3),

-- BSIT 2 (9 records · 24 units)
(10, 'BSIT 2', 'OK REVISED AS OF AUG 11', 'A', 'GEC 102', 'Readings in Philippine History', 3, 0, 'M/T/W/TH', '7:30-9:00', 'SmartClass', 0, 'Mr. Romel Jaime', 'FTF', 3),
(11, 'BSIT 2', 'OK REVISED AS OF AUG 11', 'A', 'ITE 104', 'Data Structures & Algorithms', 2, 1, 'M/TH', '9:00 - 12:00', 'CLAB3', 0, 'John Paulo Perminola', 'FTF', 3),
(12, 'BSIT 2', 'OK REVISED AS OF AUG 11', 'A', 'ITP 121', 'Platform Technologies', 2, 1, 'M/T/W/TH', '1:00 - 2:30', 'NETLAB', 0, 'Frederick Zamora', 'FTF', 3),
(13, 'BSIT 2', 'OK REVISED AS OF AUG 11', 'A', 'PE 103', 'PATHFit 3: Dance', 2, 0, 'M/T/W/TH', '2:30-3:30', 'C402', 0, 'Dr. Racquel Bayani', 'FTF', 2),
(14, 'BSIT 2', 'OK REVISED AS OF AUG 11', 'A', 'ITE 108', 'Quantitative Methods with Modeling & Simulation', 3, 0, 'M /TH', '3:30 - 5:30', 'C407', 0, 'Gary Soriano', 'FTF', 3),
(15, 'BSIT 2', 'OK REVISED AS OF AUG 11', 'B', 'THEO 102', 'Christian Morality', 3, 0, 'M/T/W/TH', '7:30 - 9:00', 'C403', 0, NULL, 'FTF', 3),
(16, 'BSIT 2', 'OK REVISED AS OF AUG 11', 'B', 'RF 104', 'Recoletos Formation 4', 1, 0, 'T', '10:30 -12:30', 'SmartClass', 0, '-', 'FTF', 1),
(17, 'BSIT 2', 'OK REVISED AS OF AUG 11', 'B', 'IT TRACK1', 'IT Track1 (Cloud Computing)', 3, 0, 'M/T/W/TH', '1:00 - 2:30', '510', 0, 'Joselito Carpio', 'FTF', 3),
(18, 'BSIT 2', 'OK REVISED AS OF AUG 11', 'B', 'ITP 117', 'Object Oriented Programming', 2, 1, 'M/TH/S', '3:00 - 5:00', 'CLAB1', 0, 'Gary Soriano', 'FTF', 3),

-- BSIT 3 (9 records · 27 units)
(19, 'BSIT 3', 'OK REVISED AS OF AUGUST 23', 'AB', 'ITP128', 'Capstone 1', 3, 0, 'F', '2:00 - 3:00', 'online', 0, 'Agnes Bernal', 'F2F', 3),
(20, 'BSIT 3', 'OK REVISED AS OF AUGUST 23', 'AB', 'IPE3', 'Professional Elective 3 (Cyber Security)', 3, 0, 'ST', '9:00 - 12:00', 'online', 0, 'Joselito Carpio', 'online', 3),
(21, 'BSIT 3', 'OK REVISED AS OF AUGUST 23', 'AB', 'IPE 2', 'Professional Elective 2 (Data Analytics)', 3, 0, 'ST', '3:00 - 6:00', 'online', 0, 'Gary Soriano', 'online', 3),
(22, 'BSIT 3', 'OK REVISED AS OF AUGUST 23', 'A', 'GEC104', 'Ethics', 3, 0, 'M/T/W/TH', '7:30-9:00', 'C406', 0, 'Mr. Francis Competente', 'F2F', 3),
(23, 'BSIT 3', 'OK REVISED AS OF AUGUST 23', 'A', 'GEC110', 'Art Appreciation', 3, 0, 'M/T/W/TH', '9:00-10:30', 'C403', 0, 'Mr. John Wilmer Laureano', 'F2F', 3),
(24, 'BSIT 3', 'OK REVISED AS OF AUGUST 23', 'A', 'REL301', 'The Mysteries of Christian Faith', 3, 0, 'M/T/W/TH', '10:30-12:00', 'c406', 0, 'Rev Oscar Garcia', 'F2F', 3),
(25, 'BSIT 3', 'OK REVISED AS OF AUGUST 23', 'A', 'ITP113', 'Information Assurance and Security', 3, 0, 'M/T/W/TH', '1:00 - 2:30', '510', 0, 'Joselito Carpio', 'F2F', 3),
(26, 'BSIT 3', 'OK REVISED AS OF AUGUST 23', 'A', 'IT TRACK 2', 'IT TRACK 2', 2, 1, 'T/W/F', '2:30 - 4:30', 'NETLAB', 0, 'Rheymard Doneza', 'F2F', 3),
(27, 'BSIT 3', 'OK REVISED AS OF AUGUST 23', 'B', 'ITP130', 'Practicum 1', 3, 0, 'F', '1:00 - 3:00', 'consultation', 0, 'Agnes Bernal', 'online', 3),

-- BSIT 4 (5 records · 15 units)
(28, 'BSIT 4', 'OK REVISED AS OF JULY 18', 'AB', 'ITP129', 'Capstone Project 2', 3, 0, 'T/W/TH', '1:00 - 2:00 / Consultation', '510', 0, 'Agnes Bernal', 'F2F/OL', 3),
(29, 'BSIT 4', 'OK REVISED AS OF JULY 18', 'A', 'ITP131', 'Practicum 2', 3, 0, 'F', 'Consultation', 'ONLINE', 0, 'Agnes Bernal', 'OL', 3),
(30, 'BSIT 4', 'OK REVISED AS OF JULY 18', 'B', 'ITP123', 'System Administration & Maintenance', 2, 1, 'M/T/W/TH/F', '9:00 - 10:30', 'NETLAB', 0, 'Frederick Zamora', 'F2F', 3),
(31, 'BSIT 4', 'OK REVISED AS OF JULY 18', 'B', 'IT Track 4', 'IT Track 4 - (Integrative Programming & Technologies)', 2, 1, 'M/TH/S', '10:30-12:30', 'CLAB3', 0, 'Paulo Perminola', 'F2F/OL', 3),
(32, 'BSIT 4', 'OK REVISED AS OF JULY 18', 'B', 'IT Track 5', 'IT Track 5 -', 3, 0, 'M/TH/S', '1:00 - 3:00', 'C407', 0, 'Gary Soriano', 'F2F/OL', 3)
ON CONFLICT (id) DO UPDATE SET
    year_level = EXCLUDED.year_level,
    revision_status = EXCLUDED.revision_status,
    block = EXCLUDED.block,
    subject_code = EXCLUDED.subject_code,
    subject_description = EXCLUDED.subject_description,
    lec_units = EXCLUDED.lec_units,
    lab_units = EXCLUDED.lab_units,
    days = EXCLUDED.days,
    time = EXCLUDED.time,
    room = EXCLUDED.room,
    faculty = EXCLUDED.faculty,
    mode = EXCLUDED.mode,
    total_units = EXCLUDED.total_units,
    updated_at = timezone('utc'::text, now());

