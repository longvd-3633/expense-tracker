-- Migration: Auto-create user settings and default categories
-- Created: 2025-12-05
-- Description: Automatically create user_settings and copy default categories when a new user signs up

-- ============================================================================
-- FUNCTION: Create user settings on signup
-- ============================================================================

-- This function will be called manually from application or via Supabase Database Webhook
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user settings with defaults
  INSERT INTO public.user_settings (user_id, currency, date_format, number_format, default_view, theme)
  VALUES (
    NEW.id,
    'VND',
    'DD/MM/YYYY',
    '1.000.000',
    'dashboard',
    'system'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Copy default categories to user's account
  -- This allows users to customize their own categories later
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default)
  SELECT 
    NEW.id,
    name,
    type,
    color,
    icon,
    false  -- User's copies are not marked as default
  FROM public.categories
  WHERE user_id IS NULL AND is_default = true
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ALTERNATIVE: RPC function for manual initialization
-- ============================================================================

-- This function can be called from the application after user signs up
CREATE OR REPLACE FUNCTION public.initialize_new_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Create user settings with defaults
  INSERT INTO public.user_settings (user_id, currency, date_format, number_format, default_view, theme)
  VALUES (
    user_uuid,
    'VND',
    'DD/MM/YYYY',
    '1.000.000',
    'dashboard',
    'system'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Copy default categories to user's account
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default)
  SELECT 
    user_uuid,
    name,
    type,
    color,
    icon,
    false
  FROM public.categories
  WHERE user_id IS NULL AND is_default = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permission on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.initialize_new_user(UUID) TO authenticated, service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
'Creates user_settings and copies default categories - used by Database Webhook';

COMMENT ON FUNCTION public.initialize_new_user(UUID) IS 
'Manually initializes user settings and categories - call from application after signup';
