-- Script alternativo: Actualizar usuario existente a admin
-- Usa este si el script 008 sigue dando error

-- PASO 1: Ver todos los usuarios
SELECT 
  au.id,
  au.email,
  au.created_at,
  u.role as "Rol actual"
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
ORDER BY au.created_at DESC;

-- PASO 2: Actualizar el último usuario a admin (o crear si no existe)
WITH last_user AS (
  SELECT id, email
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1
)
UPDATE public.users 
SET role = 'admin',
    updated_at = NOW()
WHERE id IN (SELECT id FROM last_user);

-- PASO 3: Si el UPDATE no afectó ninguna fila, significa que el usuario no existe en la tabla users
-- En ese caso, ejecuta este INSERT:
WITH last_user AS (
  SELECT id, email
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1
)
INSERT INTO public.users (id, email, full_name, role, loyalty_points, created_at)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  0,
  NOW()
FROM last_user
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE id = last_user.id
);

-- PASO 4: Verificar
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role
FROM public.users u
WHERE u.role = 'admin';
