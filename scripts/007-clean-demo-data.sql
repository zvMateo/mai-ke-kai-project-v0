-- Script para limpiar datos de ejemplo y preparar la base de datos
-- EJECUTAR EN SUPABASE SQL EDITOR

-- ============================================
-- 1. LIMPIAR RESERVAS DE EJEMPLO
-- ============================================
-- Eliminar reservas donde el usuario tiene email de test
DELETE FROM booking_services WHERE booking_id IN (
  SELECT b.id FROM bookings b
  INNER JOIN users u ON b.user_id = u.id
  WHERE u.email LIKE '%test%' OR u.email LIKE '%example%' OR u.email LIKE '%demo%'
);

DELETE FROM booking_rooms WHERE booking_id IN (
  SELECT b.id FROM bookings b
  INNER JOIN users u ON b.user_id = u.id
  WHERE u.email LIKE '%test%' OR u.email LIKE '%example%' OR u.email LIKE '%demo%'
);

DELETE FROM check_in_data WHERE booking_id IN (
  SELECT b.id FROM bookings b
  INNER JOIN users u ON b.user_id = u.id
  WHERE u.email LIKE '%test%' OR u.email LIKE '%example%' OR u.email LIKE '%demo%'
);

DELETE FROM loyalty_transactions WHERE booking_id IN (
  SELECT b.id FROM bookings b
  INNER JOIN users u ON b.user_id = u.id
  WHERE u.email LIKE '%test%' OR u.email LIKE '%example%' OR u.email LIKE '%demo%'
);

DELETE FROM bookings WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%demo%'
);

-- ============================================
-- 2. LIMPIAR SERVICIOS DE EJEMPLO
-- ============================================
DELETE FROM services WHERE price = 0 OR name ILIKE '%test%' OR name ILIKE '%ejemplo%' OR name ILIKE '%demo%';

-- ============================================
-- 3. LIMPIAR PAQUETES DE EJEMPLO
-- ============================================
DELETE FROM surf_packages WHERE name ILIKE '%test%' OR name ILIKE '%ejemplo%' OR name ILIKE '%demo%';

-- ============================================
-- 4. LIMPIAR USUARIOS DE EJEMPLO
-- ============================================
-- Primero eliminar reservas de estos usuarios
DELETE FROM booking_services WHERE booking_id IN (
  SELECT b.id FROM bookings b
  INNER JOIN users u ON b.user_id = u.id
  WHERE u.email LIKE '%test%' OR u.email LIKE '%example%' OR u.email LIKE '%demo%'
);

DELETE FROM booking_rooms WHERE booking_id IN (
  SELECT b.id FROM bookings b
  INNER JOIN users u ON b.user_id = u.id
  WHERE u.email LIKE '%test%' OR u.email LIKE '%example%' OR u.email LIKE '%demo%'
);

DELETE FROM check_in_data WHERE booking_id IN (
  SELECT b.id FROM bookings b
  INNER JOIN users u ON b.user_id = u.id
  WHERE u.email LIKE '%test%' OR u.email LIKE '%example%' OR u.email LIKE '%demo%'
);

DELETE FROM bookings WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%demo%'
);

-- Ahora eliminar los usuarios de ejemplo (que no tienen reservas)
DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%demo%';

-- ============================================
-- 5. VERIFICAR DATOS REALES
-- ============================================
-- Ver habitaciones reales
SELECT id, name, type, capacity, is_active FROM rooms WHERE is_active = true ORDER BY name;

-- Ver usuarios admins reales
SELECT id, email, full_name, role FROM users WHERE role IN ('admin', 'staff') ORDER BY role;

-- Contar servicios
SELECT COUNT(*) as total_services FROM services WHERE is_active = true;

-- Contar paquetes
SELECT COUNT(*) as total_packages FROM surf_packages WHERE is_active = true;

-- ============================================
-- NOTAS:
-- ============================================
-- - Los usuarios con rol 'admin' NO se eliminan
-- - Las habitaciones no se eliminan (pueden ser reales)
-- - Si hay datos que quieres eliminar, hazlo manualmente desde el admin panel

