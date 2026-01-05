-- ============================================
-- SCRIPT: Limpiar usuario huérfano
-- Problema: Usuario eliminado de auth.users pero existe en public.users
-- con relaciones en bookings que impiden borrarlo
-- ============================================

-- PASO 1: Ver el usuario problemático
SELECT id, email, role FROM users WHERE email = 'mzavala@goodapps.com.ar';

-- PASO 2: Ver las reservas asociadas a este usuario
SELECT b.id, b.status, b.check_in, b.check_out, b.total_amount, b.created_at 
FROM bookings b
JOIN users u ON b.user_id = u.id
WHERE u.email = 'mzavala@goodapps.com.ar';

-- PASO 3: Eliminar transacciones de lealtad del usuario (si existen)
DELETE FROM loyalty_transactions 
WHERE user_id = (SELECT id FROM users WHERE email = 'mzavala@goodapps.com.ar');

-- Como user_id es NOT NULL en bookings, debemos ELIMINAR las reservas en lugar de desasociarlas
-- PASO 4: Eliminar las reservas asociadas (son de prueba, no importa perderlas)
DELETE FROM bookings 
WHERE user_id = (SELECT id FROM users WHERE email = 'mzavala@goodapps.com.ar');

-- PASO 5: Ahora sí puedes borrar el usuario
DELETE FROM users WHERE email = 'mzavala@goodapps.com.ar';

-- PASO 6: Verificar que se borró
SELECT * FROM users WHERE email = 'mzavala@goodapps.com.ar';
-- Debería devolver 0 filas

-- ============================================
-- DESPUÉS DE LIMPIAR:
-- 1. Crea el usuario en Supabase Authentication
-- 2. El trigger lo sincronizará automáticamente a public.users
-- 3. Ejecuta el script 011 para darle rol admin
-- ============================================
