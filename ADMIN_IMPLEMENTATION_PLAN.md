# Admin Panel - Implementation Roadmap

## Objetivo
Sistema 100% autoadministrable donde el cliente puede gestionar todo sin intervención del desarrollador.

## Estado Actual
- ✅ Backend CRUD actions existen parcialmente
- ❌ No hay campos de imágenes en la BD
- ❌ Admin UI es read-only (botones no funcionan)
- ❌ No hay integración con Cloudinary
- ❌ Landing page usa datos hardcoded

## Fase 1: Base de Datos e Imágenes (PRIORIDAD ALTA)

### 1.1 Agregar campos de imágenes a las tablas
**Script SQL**: `006-add-image-fields.sql`

```sql
-- Rooms: multiple images
ALTER TABLE rooms ADD COLUMN images TEXT[] DEFAULT '{}';
ALTER TABLE rooms ADD COLUMN main_image TEXT;

-- Services: single image
ALTER TABLE services ADD COLUMN image_url TEXT;
```

### 1.2 Integración con Cloudinary
**Variables de entorno necesarias**:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_PRESET` (unsigned preset para uploads desde cliente)

**Archivos a crear**:
- `lib/cloudinary.ts` - Cliente y utilidades de Cloudinary
- `components/admin/image-upload.tsx` - Componente de upload reusable
- `app/api/cloudinary/sign/route.ts` - Endpoint para firmar uploads

### 1.3 Actualizar TypeScript types
- `types/database.ts` - Agregar campos de imágenes
- `types/index.ts` - Agregar tipos de Cloudinary

## Fase 2: CRUD de Habitaciones (PRIORIDAD ALTA)

### 2.1 Backend completo
**Archivo**: `lib/actions/rooms.ts`

Funciones a completar/crear:
- ✅ `getRooms()` - Ya existe
- ✅ `getRoomById()` - Ya existe  
- ❌ `createRoom()` - FALTA
- ✅ `updateRoom()` - Existe pero revisar
- ✅ `deleteRoom()` - Existe pero revisar

### 2.2 Admin UI - Habitaciones
**Archivos a crear/modificar**:
- `app/admin/rooms/page.tsx` - Lista con botones funcionales
- `app/admin/rooms/new/page.tsx` - Formulario crear
- `app/admin/rooms/[id]/edit/page.tsx` - Formulario editar
- `components/admin/room-form.tsx` - Formulario reusable
- `components/admin/room-card.tsx` - Card con acciones

**Funcionalidades**:
- Ver lista de todas las habitaciones
- Crear nueva habitación con:
  - Nombre, tipo, capacidad
  - Descripción completa
  - Upload múltiple de imágenes (Cloudinary)
  - Amenities (checkbox múltiple)
  - Precios por season (high, mid, low)
- Editar habitación existente
- Eliminar habitación (soft delete - is_active = false)
- Vista previa de cómo se verá en la landing

## Fase 3: CRUD de Servicios (PRIORIDAD ALTA)

### 3.1 Backend completo
**Archivo**: `lib/actions/services.ts`

Funciones existentes:
- ✅ `getServices()` - Ya existe
- ✅ `getServiceById()` - Ya existe
- ✅ `createService()` - Existe, revisar
- ✅ `updateService()` - Existe, revisar
- ✅ `deleteService()` - Existe, revisar

### 3.2 Admin UI - Servicios
**Archivos a crear/modificar**:
- `app/admin/services/page.tsx` - Lista con botones funcionales
- `app/admin/services/new/page.tsx` - Formulario crear
- `app/admin/services/[id]/edit/page.tsx` - Formulario editar
- `components/admin/service-form.tsx` - Formulario reusable

**Funcionalidades**:
- Ver lista de servicios por categoría
- Crear nuevo servicio con:
  - Nombre, categoría, descripción
  - Precio, duración, máx participantes
  - Upload de imagen (Cloudinary)
- Editar servicio
- Eliminar servicio (soft delete)

## Fase 4: CRUD de Paquetes Surf (PRIORIDAD MEDIA)

### 4.1 Base de datos
**Script SQL**: `007-create-surf-packages.sql`

```sql
CREATE TABLE surf_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  includes TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  main_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE package_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID REFERENCES surf_packages(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  quantity INTEGER DEFAULT 1
);
```

### 4.2 Backend
**Archivo a crear**: `lib/actions/packages.ts`
- `getPackages()`
- `getPackageById()`
- `createPackage()`
- `updatePackage()`
- `deletePackage()`

### 4.3 Admin UI
**Archivos a crear**:
- `app/admin/packages/page.tsx`
- `app/admin/packages/new/page.tsx`
- `app/admin/packages/[id]/edit/page.tsx`
- `components/admin/package-form.tsx`

## Fase 5: Conectar Frontend con Datos Reales (PRIORIDAD CRÍTICA)

### 5.1 Landing Page
**Archivo**: `app/page.tsx`

Cambios:
- ❌ Eliminar datos hardcoded
- ✅ Fetch rooms desde BD con `getRooms()`
- ✅ Fetch services desde BD con `getServices()`
- ✅ Mostrar imágenes desde Cloudinary URLs

### 5.2 Componentes Landing
**Archivos a modificar**:
- `components/landing/rooms-section.tsx` - Usar datos reales
- `components/landing/services-section.tsx` - Usar datos reales
- `components/landing/packages-section.tsx` - Usar datos reales (cuando exista)

### 5.3 Booking Flow
**Archivo**: `components/booking/room-selector.tsx`

Cambios:
- ✅ Ya usa `getRoomsWithPricing()` - Solo agregar imágenes

## Fase 6: Sistema de Puntos Visible (PRIORIDAD MEDIA)

### 6.1 UI de Puntos
**Archivos a crear**:
- `app/loyalty/page.tsx` - Página de puntos del usuario
- `components/loyalty-badge.tsx` - Badge visible en header
- `components/booking/points-info.tsx` - Info durante booking

### 6.2 Notificaciones
- Mostrar puntos ganados después de completar reserva
- Mostrar puntos actuales en perfil de usuario
- Mostrar cómo canjear puntos

## Checklist de Entrega al Cliente

### Para que el sistema sea 100% autoadministrable:

**Dashboard Admin debe permitir**:
- [ ] Crear/editar/eliminar habitaciones con imágenes
- [ ] Crear/editar/eliminar servicios con imágenes
- [ ] Crear/editar/eliminar paquetes surf con imágenes
- [ ] Ver todas las reservas y cambiar estados
- [ ] Bloquear/desbloquear habitaciones para mantenimiento
- [ ] Ver reportes de ocupación y revenue
- [ ] Gestionar precios por season
- [ ] Ver y gestionar puntos de fidelidad de usuarios

**Landing Page debe mostrar**:
- [ ] Habitaciones reales desde la BD con imágenes de Cloudinary
- [ ] Servicios reales desde la BD con imágenes
- [ ] Precios dinámicos según season
- [ ] Disponibilidad real según bookings
- [ ] Paquetes surf (cuando se implementen)

**Usuarios deben poder**:
- [ ] Reservar sin registrarse (guest checkout)
- [ ] Crear cuenta y acumular puntos
- [ ] Ver sus puntos de fidelidad
- [ ] Usar puntos para descuentos
- [ ] Recibir emails de confirmación
- [ ] Hacer check-in online

## Estimación de Tiempos

- **Fase 1** (BD + Cloudinary): 2-3 días
- **Fase 2** (CRUD Rooms): 3-4 días
- **Fase 3** (CRUD Services): 2-3 días
- **Fase 4** (CRUD Packages): 3-4 días
- **Fase 5** (Frontend Real Data): 2 días
- **Fase 6** (Loyalty UI): 1-2 días

**Total**: 13-18 días laborables (2.5-3.5 semanas)

## Próximo Paso Inmediato

Empezar con **Fase 1.1**: Agregar campos de imágenes a la BD y configurar Cloudinary.
