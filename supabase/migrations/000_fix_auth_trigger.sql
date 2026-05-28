-- =============================================================================
-- HostHive — Fix Auth Trigger and Profile Creation
-- This script fixes issues with user registration and profile creation
-- Run this in Supabase SQL Editor to fix signup issues
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. Fix the profiles table structure
-- =============================================================================

-- Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  username      TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  github_login  TEXT,
  github_token  TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

-- Fill in missing usernames so we can apply NOT NULL safely if needed
UPDATE public.profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL;

-- Now make username NOT NULL
ALTER TABLE public.profiles
  ALTER COLUMN username SET NOT NULL;

-- Add constraint for valid plan values
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'hobby', 'startup', 'pro', 'team', 'enterprise'));

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;

CREATE POLICY "users_select_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 2. Fix the auth trigger function
-- =============================================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_plan TEXT;
BEGIN
  -- Extract metadata with proper null handling
  -- Registration passes username in full_name metadata
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', v_full_name, split_part(NEW.email, '@', 1));
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  v_plan := COALESCE(NEW.raw_user_meta_data->>'plan', 'free');

  -- Validate plan value
  IF v_plan NOT IN ('free', 'hobby', 'startup', 'pro', 'team', 'enterprise') THEN
    v_plan := 'free';
  END IF;

  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    avatar_url,
    plan,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_username,
    v_full_name,
    v_avatar_url,
    v_plan,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    plan = COALESCE(EXCLUDED.plan, public.profiles.plan),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent auth user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 3. Create function to sync existing users (run this if you have users without profiles)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_username TEXT;
  v_full_name TEXT;
BEGIN
  FOR v_user IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      v_full_name := v_user.raw_user_meta_data->>'full_name';
      v_username := COALESCE(v_user.raw_user_meta_data->>'username', v_full_name, split_part(v_user.email, '@', 1));

      INSERT INTO public.profiles (
        id,
        email,
        username,
        full_name,
        avatar_url,
        plan,
        created_at,
        updated_at
      ) VALUES (
        v_user.id,
        v_user.email,
        v_username,
        v_full_name,
        v_user.raw_user_meta_data->>'avatar_url',
        COALESCE(v_user.raw_user_meta_data->>'plan', 'free'),
        NOW(),
        NOW()
      );
      RETURN QUERY SELECT v_user.id, v_user.email, 'created'::TEXT;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN QUERY SELECT v_user.id, v_user.email, ('error: ' || SQLERRM)::TEXT;
    END;
  END LOOP;
END;
$$;

-- =============================================================================
-- Usage Instructions:
-- =============================================================================
-- 1. Run this entire script in Supabase SQL Editor
-- 2. To sync existing users without profiles, run:
--    SELECT * FROM public.sync_missing_profiles();
-- =============================================================================
