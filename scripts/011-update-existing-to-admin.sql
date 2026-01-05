-- Actualizar usuario existente a admin

-- Paso 1: Ver tu usuario actual
SELECT id, email, full_name, role, loyalty_points 
FROM users 
WHERE email = 'mzavala@goodapps.com.ar';

-- Paso 2: Actualizar a admin
UPDATE users 
SET role = 'admin'
WHERE email = 'mzavala@goodapps.com.ar';

-- Paso 3: Verificar que se actualizó correctamente
SELECT id, email, full_name, role, loyalty_points 
FROM users 
WHERE email = 'mzavala@goodapps.com.ar';
