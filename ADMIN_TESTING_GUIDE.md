# Guía de Testing del Admin Panel

## Paso 1: Crear Usuario Admin

### Opción A: Crear desde Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en **Authentication** en el menú lateral
3. Click en **Users** 
4. Click en **Add user** (botón verde)
5. Completa:
   - **Email**: `admin@maikekai.com` (o el que prefieras)
   - **Password**: Crea una contraseña segura
   - **Auto Confirm User**: ✅ Activado (importante para evitar confirmación por email)
6. Click en **Create user**
7. **Copia el UUID** del usuario creado (aparece en la columna ID)
8. Ve a **SQL Editor** en Supabase
9. Ejecuta este SQL (reemplaza el UUID):

```sql
INSERT INTO users (id, email, full_name, role, created_at)
VALUES (
  'TU-UUID-AQUI', -- UUID copiado del paso 7
  'admin@maikekai.com', -- Tu email
  'Admin User',
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';
```

### Opción B: Usar el script SQL

1. Abre `scripts/007-create-admin-user.sql`
2. Sigue las instrucciones en el archivo
3. Ejecuta el script en Supabase SQL Editor

---

## Paso 2: Iniciar Sesión en Admin

1. Ve a: `https://v0-mai-ke-kai-project.vercel.app/admin`
2. Inicia sesión con el email y contraseña que creaste
3. Deberías ver el dashboard de admin

---

## Paso 3: Probar CRUD de Habitaciones

### Crear una habitación nueva:

1. En el admin, ve a **Rooms** en el menú lateral
2. Click en **Add Room** (botón azul)
3. Completa el formulario:
   - **Name**: Ej. "Ocean View Dorm"
   - **Type**: Selecciona "Dorm"
   - **Capacity**: Ej. 8
   - **Description**: Escribe una descripción
   - **Amenities**: Ej. "WiFi, Air Conditioning, Lockers"
   - **Main Image**: Click en el área de upload y sube una imagen
   - **Gallery**: Opcionalmente agrega más imágenes
4. Click en **Create Room**
5. Verifica que la habitación aparece en la lista

### Editar una habitación:

1. En la lista de habitaciones, click en **Edit** en alguna habitación
2. Modifica los datos que quieras
3. Cambia la imagen si quieres probar el upload
4. Click en **Update Room**
5. Verifica que los cambios se guardaron

### Eliminar una habitación:

1. En la lista de habitaciones, click en **Delete** 
2. Confirma la eliminación
3. Verifica que la habitación desapareció de la lista

---

## Paso 4: Verificar Cloudinary

1. Después de subir imágenes, ve a tu [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Ve a **Media Library**
3. Busca la carpeta `mai-ke-kai`
4. Deberías ver las imágenes que subiste
5. Las URLs de estas imágenes están guardadas en la base de datos

---

## Paso 5: Verificar en la Base de Datos

1. Ve a Supabase Dashboard → **Table Editor**
2. Abre la tabla `rooms`
3. Verifica que las nuevas habitaciones tienen:
   - Datos completos
   - `image_url` con la URL de Cloudinary
   - `gallery_images` con array de URLs (si agregaste galería)

---

## Troubleshooting

### No puedo iniciar sesión en /admin
- Verifica que el usuario tiene `role = 'admin'` o `role = 'staff'` en la tabla `users`
- Verifica que el email y contraseña son correctos
- Revisa la consola del navegador para ver errores

### No puedo subir imágenes
- Verifica que las 4 variables de Cloudinary están en Vercel
- Verifica que hiciste redeploy después de agregar las variables
- Abre la consola del navegador y busca errores
- Verifica que el preset de Cloudinary es "Unsigned"

### Las imágenes no se muestran después de subir
- Verifica que ejecutaste el script `006-add-image-fields.sql`
- Verifica que las columnas `image_url` y `gallery_images` existen en la tabla `rooms`
- Revisa los logs de Vercel para ver si hay errores

### Error "Cannot read property 'id' of null"
- Esto significa que no estás autenticado o tu sesión expiró
- Cierra sesión y vuelve a iniciar sesión
- Verifica que tu usuario existe en la tabla `users`

---

## Checklist Final

Antes de marcar esto como completo, verifica:

- ✅ Usuario admin creado en Supabase Auth
- ✅ Usuario tiene rol 'admin' en tabla users
- ✅ Puedo iniciar sesión en /admin
- ✅ Script SQL 006-add-image-fields ejecutado
- ✅ Variables de Cloudinary configuradas en Vercel
- ✅ Redeploy realizado después de agregar variables
- ✅ Puedo crear una habitación nueva con imagen
- ✅ Puedo editar una habitación existente
- ✅ Puedo eliminar una habitación
- ✅ Las imágenes se suben a Cloudinary correctamente
- ✅ Las URLs se guardan en la base de datos

Una vez completado este checklist, el sistema está listo para que tu cliente gestione habitaciones de forma autónoma.
