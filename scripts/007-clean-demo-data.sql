-- Script para limpiar datos de ejemplo y preparar la base de datos
-- EJECUTAR EN SUPABASE SQL EDITOR

-- ============================================
-- 1. LIMPIAR RESERVAS DE EJEMPLO
-- ============================================
-- Solo elimina reservas de prueba (con emails de test)
DELETE FROM booking_services WHERE booking_id IN (
  SELECT id FROM bookings WHERE email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%demo%'
);
DELETE FROM booking_rooms WHERE booking_id IN (
  SELECT id FROM bookings WHERE email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%demo%'
);
DELETE FROM check_in_data WHERE booking_id IN (
  SELECT id FROM bookings WHERE email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%demo%'
);
DELETE FROM bookings WHERE email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%demo%';

-- ============================================
-- 2. LIMPIAR SERVICIOS DE EJEMPLO
-- ============================================
-- Eliminar servicios que no son reales (los que tienen precio 0 o nombres de test)
DELETE FROM services WHERE price = 0 OR name ILIKE '%test%' OR name ILIKE '%ejemplo%' OR name ILIKE '%demo%';

-- ============================================
-- 3. LIMPIAR PAQUETES DE EJEMPLO
-- ============================================
DELETE FROM surf_packages WHERE name ILIKE '%test%' OR name ILIKE '%ejemplo%' OR name ILIKE '%demo%';

-- ============================================
-- 4. LIMPIAR RECOMPENSAS DE FIDELIDAD
-- ============================================
-- Eliminar recompensas de ejemplo
DELETE FROM loyalty_transactions WHERE description ILIKE '%test%' OR description ILIKE '%ejemplo%';

-- ============================================
-- 5. VERIFICAR HABITACIONES
-- ============================================
-- Ver cuántas habitaciones hay
SELECT id, name, type, capacity, is_active FROM rooms ORDER BY name;

-- ============================================
-- 6. VERIFICAR USUARIOS ADMIN
-- ============================================
-- Ver usuarios con rol admin
SELECT id, email, full_name, role, created_at FROM users WHERE role = 'admin';

-- ============================================
-- NOTAS:
-- ============================================
-- - NO eliminar usuarios reales (especialmente admins)
-- - NO eliminar la tabla users completamente
-- - Los datos de habitaciones pueden quedarse si son真实的 (reales)
-- - Si hay datos de prueba, el admin puede borrarlos desde el panel
