-- Quick Admin Setup
-- Este script convierte automáticamente el último usuario creado en admin
-- Solo asegúrate de haber creado un usuario en Supabase Authentication primero

-- PASO 1: Ver todos los usuarios disponibles
SELECT 
  au.id,
  au.email,
  au.created_at as "Creado en Auth",
  u.role as "Rol actual en users"
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
ORDER BY au.created_at DESC;

-- PASO 2: Convertir el último usuario en admin
-- Ejecuta esto después de verificar que el usuario correcto está primero en la lista
WITH last_user AS (
  SELECT id, email
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1
)
-- Primero eliminar el usuario si existe para evitar duplicate key
DELETE FROM public.users WHERE id IN (SELECT id FROM last_user);

-- Luego insertar con rol admin
INSERT INTO public.users (id, email, full_name, role, loyalty_points, created_at)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  0,
  NOW()
FROM last_user;

-- PASO 3: Verificar que se creó correctamente
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.created_at
FROM public.users u
WHERE u.role = 'admin';
