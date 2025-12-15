-- Backfill missing profiles for existing users
INSERT INTO public.profiles (id, full_name, role)
SELECT 
  u.id, 
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'), 
  COALESCE(u.raw_user_meta_data->>'role', 'student')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Backfill missing user_roles for existing users
INSERT INTO public.user_roles (user_id, role)
SELECT 
  u.id,
  COALESCE((u.raw_user_meta_data->>'role')::app_role, 'student')
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;