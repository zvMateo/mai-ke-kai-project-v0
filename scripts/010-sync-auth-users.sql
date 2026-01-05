-- =====================================================
-- SINCRONIZACIÓN AUTOMÁTICA DE USUARIOS
-- =====================================================
-- Este script crea un trigger que automáticamente crea
-- un registro en public.users cuando se registra un
-- usuario en auth.users
-- =====================================================

-- PASO 1: Crear la función que sincroniza usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, loyalty_points)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'guest', -- Rol por defecto
    0 -- Puntos iniciales
  )
  ON CONFLICT (id) DO NOTHING; -- Si ya existe, no hacer nada
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 2: Crear el trigger que ejecuta la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 3: Sincronizar usuarios existentes que no están en public.users
INSERT INTO public.users (id, email, full_name, role, loyalty_points)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'guest' as role,
  0 as loyalty_points
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- PASO 4: Verificar que se sincronizaron correctamente
SELECT 
  au.email as "Email en Auth",
  pu.email as "Email en Public",
  pu.role as "Rol",
  CASE 
    WHEN pu.id IS NULL THEN '❌ No sincronizado'
    ELSE '✅ Sincronizado'
  END as "Estado"
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;

-- PASO 5 (OPCIONAL): Actualizar tu usuario a admin
-- Descomenta y ejecuta esto reemplazando el email:
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE email = 'tu-email@ejemplo.com';
