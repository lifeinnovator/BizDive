
-- ?ая╕П DANGER: This script will DELETE ALL DATA ?ая╕П

-- 1. Reset Diagnosis Data
TRUNCATE TABLE public.diagnosis_records CASCADE;

-- 2. Reset Profiles (This will also cascade if you delete users, but good to be explicit)
TRUNCATE TABLE public.profiles CASCADE;

-- 3. Reset Questions (Optional: Only if you want to re-seed)
-- TRUNCATE TABLE public.questions CASCADE;

-- 4. Delete All Users (Auth)
-- This requires running in the Supabase Dashboard SQL Editor
-- ERROR: cannot delete from table "users" because it does not have a replica identity and triggers are enabled
-- To delete users, it's safest to use the Supabase Dashboard > Authentication > Users > Select All > Delete
-- Or if you really want to do it via SQL and know what you are doing:
-- DELETE FROM auth.users; 



