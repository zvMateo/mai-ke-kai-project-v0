# Mai Ke Kai - Sistema de Gestión de Hostel y Surf Camp

**Proyecto:** Mai Ke Kai Property Management System (PMS)  
**Cliente:** Hostel & Surf Camp en Tamarindo, Costa Rica  
**Stack Tecnológico:** Next.js 16, React 19, Supabase, Stripe, PayPal, Resend, Cloudinary  
**Fecha:** Diciembre 2025

---

## 📋 TABLA DE CONTENIDOS

1. [Concepto del Proyecto](#concepto)
2. [Funcionalidades Principales](#funcionalidades)
3. [Arquitectura del Sistema](#arquitectura)
4. [Roles de Usuario](#roles)
5. [Flujos de Negocio](#flujos)
6. [Integraciones](#integraciones)
7. [Base de Datos](#base-de-datos)
8. [Características Especiales](#caracteristicas)

---

## 🏄 CONCEPTO DEL PROYECTO {#concepto}

Mai Ke Kai es un hostel y surf camp ubicado en Tamarindo, Costa Rica, que combina alojamiento con experiencias de surf y tours locales. El negocio necesita un sistema integral que permita:

- **Gestión de alojamiento** para 18 huéspedes simultáneos
- **Venta de servicios adicionales** (lecciones de surf, tours, transporte)
- **Paquetes combinados** de surf + alojamiento
- **Sistema de fidelización** con puntos canjeables
- **Reservas directas** para independizarse de plataformas (Booking, Hostelworld)
- **Check-in online** para agilizar llegadas
- **Gestión de voluntarios** que ayudan en la operación diaria

### Objetivos del Negocio

1. **Mantener ocupación >70%** durante todo el año
2. **Aumentar ventas de servicios extra** (surf, tours, transporte)
3. **Independizarse de Booking/Hostelworld** con reservas directas
4. **Automatizar procesos** que actualmente se hacen manualmente
5. **Generar confianza** con una plataforma profesional propia

---

## 🚀 FUNCIONALIDADES PRINCIPALES {#funcionalidades}

### 1. Alojamiento (18 Personas)

#### Tipos de Habitación:
- **Dormitorio Mixto Compartido** - 10 camas
- **Cuarto Privado** - 4 personas
- **Cuarto Femenino** - 4 personas
- **Habitación Familiar** - 4 personas

#### Servicios Incluidos:
- Desayuno
- Aire acondicionado (A/C)
- Baño con ducha caliente
- WiFi
- Espacios comunes

#### Sistema de Precios Dinámicos:
```
+60 días antes → Precio máximo (Rack Rate)
<60 días antes → Precio competitivo (Competitive Rate) -10%
<10 días antes → Precio last minute (Last Minute Rate) -20%
```

#### Temporadas:
- **Alta:** 27 diciembre - tercer domingo de abril
- **Media:** Resto del año (excepto baja)
- **Baja:** Septiembre y Octubre

### 2. Servicios (Tours y Transporte)

#### Transporte:
- **Aeropuerto Liberia ↔ Tamarindo:** $40 compartido / $90 privado (hasta 3 personas)
- **Tamarindo → Santa Teresa/Samara/Nosara:** $55 compartido
- **Tamarindo → La Fortuna:** $90 compartido
- **Tamarindo → Monteverde:** $90 compartido
- **Tamarindo → San Juan del Sur (Nicaragua):** $90 compartido
- **Aeropuerto San José ↔ Tamarindo:** $90 compartido

#### Tours y Actividades:
- **Lección de Surf (Popular):** $60 - 2 horas, max 4 personas/instructor, equipo incluido
- **Sunset Catamarán (Popular):** $95 - Todo incluido, barra libre, snorkel, kayaks
- **Buceo Islas Catalinas:** $135 certificado / $175 no certificado
- **Snorkel Islas Catalinas:** $90
- **Tour Manglares:** $45 - Safari en bote, 2 horas
- **Desove de Tortugas (temporada):** $60 - Tour nocturno en playa protegida
- **Rincón de la Vieja:** $160 - Tour día completo, cascada, almuerzo, termas
- **Paseo a Caballo:** $70 - 1 hora por la costa
- **Yoga en la Playa (Popular):** Precio variable
- **Paquete Fotos y Videos Surf (Popular):** Precio variable

### 3. Paquetes Surf + Alojamiento

Los paquetes combinan alojamiento con lecciones de surf, equipo y transporte:

- **3 días / 2 noches**
- **4 días / 3 noches**
- **5 días / 4 noches**
- **6 días / 5 noches**

Todos los paquetes son **personalizables** y los servicios también se venden **individualmente**.

### 4. Programa de Fidelidad (Loyalty Points)

#### Sistema de Acumulación:
- **1 punto por cada $10 gastados** en cualquier servicio
- Los puntos se acumulan automáticamente para usuarios registrados
- Sistema alcanzable y motivador

#### Recompensas Canjeables:
- Indumentaria Mai Ke Kai
- Stickers y merchandising
- Actividades y tours
- Noches de alojamiento
- Lavado de ropa
- Toalla de baño gratis
- Descuentos en servicios

#### Restricciones:
- Puntos usables principalmente en **temporada media/baja**
- Puntos transferibles entre usuarios
- Sin fecha de expiración

### 5. Sistema de Reservas

#### Canales de Reserva:
1. **Directa** (sitio web propio) - Sin comisiones
2. **Booking.com** - Mayor porcentaje
3. **Hostelworld** - Segundo en importancia
4. **Airbnb**
5. **Booksurfcamps**
6. **Redes sociales** (Instagram, WhatsApp, email)

#### Política de Reserva Directa:
- Nombre completo del titular
- Fechas de estancia
- **Depósito no reembolsable** por adelantado
- Datos completos antes de confirmar

#### Política de Cancelación:
- **Cancelación gratuita** hasta 5 días antes del check-in
- **Sin reembolso** con menos de 5 días

### 6. Métodos de Pago

- **Stripe** - Sin recargo, procesamiento instantáneo
- **PayPal** - +10% de recargo
- **Efectivo** - Colones, Dólares americanos, Euros (in-situ)
- **Transferencia Bancaria** - Sin recargo
- **Sinpe Móvil** - Método nacional de Costa Rica

### 7. Check-in Online

Sistema de check-in digital previo a la llegada:

#### Datos Requeridos:
- Nombre completo
- Número de pasaporte
- Fecha de nacimiento
- Nacionalidad
- Contacto de emergencia
- Firma digital

#### Funcionalidades:
- Formulario completable 24h antes del check-in
- Upload de foto del pasaporte (opcional)
- Firma digital del contrato
- Aceptación de términos y condiciones
- Información de acompañantes

#### Beneficios:
- Agiliza el proceso de llegada
- Reduce trabajo de voluntarios
- Mejora la experiencia del huésped

### 8. Gestión de Voluntarios

Los voluntarios son parte fundamental de la operación:

#### Responsabilidades:
- Turnos de día (3 voluntarios simultáneos)
- Limpieza de habitaciones y áreas comunes
- Recepción de huéspedes
- Preparación del desayuno
- Crear buena atmósfera en el hostel
- Responder dudas básicas de huéspedes

#### Gestión por Staff:
- **Tuti (Dueña):** Selección, horarios y supervisión de voluntarios
- **Mati (Dueño):** Lecciones de surf y turnos compartidos

---

## 🏗️ ARQUITECTURA DEL SISTEMA {#arquitectura}

### Stack Tecnológico

```
Frontend:
├── Next.js 16 (App Router)
├── React 19.2 (RSC + Client Components)
├── TypeScript
├── Tailwind CSS v4
└── shadcn/ui (Componentes)

Backend:
├── Next.js API Routes
├── Server Actions
├── Supabase (PostgreSQL)
└── Row Level Security (RLS)

Integraciones:
├── Stripe (Pagos)
├── PayPal (Pagos alternativos)
├── Resend (Emails transaccionales)
├── Cloudinary (Imágenes)
└── Supabase Auth (Autenticación)
```

### Estructura de Carpetas

```
mai-ke-kai-project/
├── app/                          # Pages y API Routes (App Router)
│   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── sign-up/
│   │   │   ├── forgot-password/
│   │   │   └── sign-up-success/
│   ├── admin/                    # Panel de administración
│   │   ├── bookings/
│   │   ├── rooms/
│   │   ├── services/
│   │   ├── packages/
│   │   ├── pricing/
│   │   ├── loyalty/
│   │   ├── guests/
│   │   ├── blocks/
│   │   ├── reports/
│   │   └── layout.tsx
│   ├── volunteer/                # Panel de voluntarios
│   │   ├── check-in/
│   │   ├── guests/
│   │   └── layout.tsx
│   ├── dashboard/                # Panel de usuario
│   │   ├── bookings/
│   │   ├── loyalty/
│   │   └── page.tsx
│   ├── booking/                  # Flujo de reserva
│   │   └── [bookingId]/
│   ├── check-in/                 # Check-in online
│   │   └── [bookingId]/
│   ├── packages/                 # Página de paquetes
│   ├── api/                      # API Routes
│   │   ├── stripe/webhook/
│   │   ├── paypal/webhook/
│   │   └── auth/welcome-email/
│   └── page.tsx                  # Landing page
│
├── components/                   # Componentes React
│   ├── admin/                    # Componentes del admin
│   ├── booking/                  # Componentes de reserva
│   ├── landing/                  # Secciones de landing
│   ├── volunteer/                # Componentes de voluntarios
│   └── ui/                       # shadcn/ui components
│
├── lib/                          # Lógica de negocio
│   ├── actions/                  # Server Actions
│   │   ├── rooms.ts
│   │   ├── services.ts
│   │   ├── packages.ts
│   │   ├── bookings.ts
│   │   ├── checkout.ts
│   │   ├── users.ts
│   │   ├── loyalty.ts
│   │   └── pricing.ts
│   ├── supabase/                 # Cliente Supabase
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── auth.ts                   # Helpers de autenticación
│   ├── email.tsx                 # Templates de email
│   ├── pricing.ts                # Lógica de precios
│   └── cloudinary.ts             # Upload de imágenes
│
├── types/                        # TypeScript types
│   └── database.ts               # Tipos de BD
│
└── scripts/                      # Scripts SQL
    ├── 001-create-schema.sql
    ├── 002-seed-data.sql
    ├── 003-fix-bookings.sql
    └── ...
```

---

## 👥 ROLES DE USUARIO {#roles}

### 1. Guest (Huésped)

**Permisos:**
- Ver landing page pública
- Realizar reservas (con o sin registro)
- Check-in online
- Ver sus propias reservas
- Acumular puntos de fidelidad
- Canjear recompensas
- Ver historial de transacciones

**Dashboard:** `/dashboard`
- Mis Reservas
- Puntos de Fidelidad
- Recompensas Disponibles
- Historial de Puntos

### 2. Volunteer (Voluntario)

**Permisos:**
- Ver dashboard de llegadas/salidas del día
- Ver lista de huéspedes actuales
- Procesar check-in de huéspedes
- Ver información básica de reservas
- **NO puede:** Editar precios, crear servicios, ver reportes financieros

**Dashboard:** `/volunteer`
- Llegadas de Hoy
- Salidas de Hoy
- Huéspedes Actuales
- Procesar Check-in

### 3. Staff (Personal)

**Permisos:**
- Todo lo de Volunteer +
- Acceso completo al admin panel
- Crear y editar habitaciones
- Crear y editar servicios
- Crear y editar paquetes
- Gestionar precios por temporada
- Gestionar recompensas de loyalty
- Ver y gestionar todas las reservas
- Gestionar bloqueos de fechas
- Ver reportes financieros
- Gestionar huéspedes
- Cambiar roles de usuarios

**Dashboard:** `/admin`

### 4. Admin (Administrador)

**Permisos:**
- Todos los permisos de Staff +
- Gestionar usuarios staff/volunteer
- Acceso a configuración del sistema
- Gestión completa de base de datos

**Dashboard:** `/admin`

---

## 🔄 FLUJOS DE NEGOCIO {#flujos}

### Flujo 1: Reserva de Usuario No Registrado

```
1. Usuario visita landing → selecciona fechas
   ↓
2. Sistema muestra habitaciones disponibles con precios dinámicos
   ↓
3. Usuario selecciona habitación
   ↓
4. Sistema muestra servicios extra disponibles
   ↓
5. Usuario agrega servicios (opcional)
   ↓
6. Usuario completa formulario de datos personales
   ↓
7. Usuario selecciona método de pago (Stripe/PayPal)
   ↓
8. Pago procesado → Webhook actualiza estado
   ↓
9. Sistema envía:
   - Email confirmación al huésped
   - Email alerta al staff
   ↓
10. Reserva confirmada
```

### Flujo 2: Reserva de Usuario Registrado

```
1. Usuario inicia sesión
   ↓
2. Selecciona fechas y habitación
   ↓
3. Agrega servicios extra
   ↓
4. **Datos pre-llenados automáticamente**
   ↓
5. Sistema muestra: "Ganarás X puntos con esta reserva"
   ↓
6. Completa pago
   ↓
7. **Sistema suma puntos automáticamente** (1 punto / $10)
   ↓
8. Emails de confirmación
   ↓
9. Reserva confirmada + Puntos acreditados
```

### Flujo 3: Check-in Online

```
1. Huésped recibe email recordatorio (24h antes)
   ↓
2. Huésped hace click en link de check-in
   ↓
3. Completa formulario:
   - Datos personales
   - Pasaporte
   - Contacto de emergencia
   - Acompañantes
   ↓
4. Firma digital del contrato
   ↓
5. Upload foto pasaporte (opcional)
   ↓
6. Sistema guarda información
   ↓
7. Email de confirmación
   ↓
8. Al llegar: Voluntario verifica y entrega llaves
```

### Flujo 4: Gestión de Admin

```
1. Admin inicia sesión → /admin
   ↓
2. Dashboard con métricas:
   - Reservas del mes
   - Ingresos
   - Ocupación actual
   - Servicios más vendidos
   ↓
3. Opciones de gestión:
   
   HABITACIONES:
   - Crear nueva habitación
   - Editar habitación existente
   - Subir imágenes (Cloudinary)
   - Configurar capacidad y camas
   - Eliminar habitación
   
   SERVICIOS:
   - Crear nuevo servicio/tour
   - Editar servicio existente
   - Subir imagen del servicio
   - Definir precio y categoría
   - Eliminar servicio
   
   PAQUETES:
   - Crear paquete surf + alojamiento
   - Definir duración (2n, 3n, 4n, 5n)
   - Configurar precio y servicios incluidos
   - Marcar como "popular" o "para parejas"
   - Editar/eliminar paquetes
   
   PRECIOS:
   - Ver tabla de precios por habitación
   - Editar precios por temporada (alta/media/baja)
   - Configurar rack rate, competitive, last minute
   - Auto-fill descuentos predefinidos
   
   LOYALTY:
   - Crear recompensas canjeables
   - Definir puntos requeridos
   - Configurar cantidad disponible
   - Activar/desactivar recompensas
   - Ver historial de canjes
   
   RESERVAS:
   - Ver todas las reservas
   - Filtrar por estado (pendiente/confirmada/cancelada)
   - Cambiar estado manualmente
   - Ver detalles completos
   - Crear reserva manual
   
   BLOQUEOS:
   - Bloquear fechas por mantenimiento
   - Bloquear habitaciones específicas
   - Ver calendario de disponibilidad
   
   HUÉSPEDES:
   - Ver listado de todos los huéspedes
   - Buscar por nombre/email
   - Ver historial de reservas
   - Cambiar rol (guest → volunteer)
   - Ver puntos de fidelidad
   
   REPORTES:
   - Ingresos por período
   - Servicios más vendidos
   - Tasa de ocupación
   - Reportes de loyalty
```

### Flujo 5: Voluntario Procesando Check-in

```
1. Voluntario inicia sesión → /volunteer
   ↓
2. Dashboard muestra:
   - Llegadas de hoy: 5 personas
   - Salidas de hoy: 3 personas
   - Huéspedes actuales: 14 personas
   ↓
3. Ve lista de llegadas con estado check-in
   ↓
4. Huésped llega y voluntario:
   - Busca la reserva
   - Verifica que completó check-in online
   - Si no completó: ayuda a llenar datos
   - Marca check-in como completado
   ↓
5. Sistema actualiza estado → "checked_in"
   ↓
6. Voluntario entrega:
   - Llaves de habitación
   - Información del hostel
   - Horarios de desayuno
   - WiFi password
```

### Flujo 6: Canje de Puntos

```
1. Usuario con puntos acumulados → /dashboard/loyalty
   ↓
2. Sistema muestra:
   - Puntos actuales: 150
   - Historial de ganancia
   - Recompensas disponibles
   ↓
3. Usuario selecciona recompensa:
   - "Noche gratis en dormitorio (100 puntos)"
   ↓
4. Sistema verifica:
   - ¿Tiene puntos suficientes? ✓
   - ¿Recompensa disponible? ✓
   - ¿Es temporada válida? ✓
   ↓
5. Usuario confirma canje
   ↓
6. Sistema:
   - Descuenta 100 puntos
   - Genera código de canje
   - Envía email con instrucciones
   - Notifica al staff
   ↓
7. Usuario presenta código al hacer nueva reserva
```

---

## 🔌 INTEGRACIONES {#integraciones}

### 1. Supabase (Base de Datos + Auth)

**Uso:**
- PostgreSQL database
- Autenticación email/password
- Row Level Security (RLS)
- Storage (futuro: archivos de check-in)

**Configuración:**
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**Triggers Automáticos:**
- `on_auth_user_created` → Sincroniza auth.users → public.users
- `update_updated_at` → Actualiza timestamps automáticamente

### 2. Stripe (Procesamiento de Pagos)

**Uso:**
- Pagos principales sin recargo
- Checkout embebido
- Webhooks para actualizar estado de reservas

**Configuración:**
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Eventos Escuchados:**
- `checkout.session.completed` → Confirma reserva
- `payment_intent.succeeded` → Marca como pagado
- `payment_intent.payment_failed` → Notifica error

### 3. PayPal (Pago Alternativo)

**Uso:**
- Opción de pago con +10% recargo
- Checkout directo
- Webhooks para confirmación

**Configuración:**
```env
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
PAYPAL_MODE=sandbox # o live
```

**Eventos Escuchados:**
- `PAYMENT.CAPTURE.COMPLETED` → Confirma reserva + suma puntos

### 4. Resend (Emails Transaccionales)

**Uso:**
- Confirmación de reserva
- Alerta a staff de nueva reserva
- Recordatorio de check-in (24h antes)
- Email de bienvenida al registrarse
- Confirmación de canje de puntos

**Configuración:**
```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@maikekai.com
STAFF_EMAIL=info@maikekai.com
```

**Templates Incluidos:**
- `BookingConfirmationEmail` - Para huésped
- `StaffBookingAlertEmail` - Para personal
- `CheckInReminderEmail` - 24h antes
- `WelcomeEmail` - Al registrarse
- `BookingCancellationEmail` - Cancelaciones

### 5. Cloudinary (Gestión de Imágenes)

**Uso:**
- Upload de imágenes de habitaciones
- Upload de imágenes de servicios
- Upload de imágenes de paquetes
- Fotos de pasaportes (check-in)
- Optimización automática

**Configuración:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mai-ke-kai-upload
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

**Preset Configurado:**
- Folder: `mai-ke-kai/`
- Signing mode: Unsigned (para uploads del navegador)
- Auto-generate public ID
- Transformaciones: Auto-optimización

---

## 🗄️ BASE DE DATOS {#base-de-datos}

### Esquema de Tablas

#### users
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- phone (TEXT)
- nationality (TEXT)
- passport_number (TEXT)
- passport_expiry (DATE)
- date_of_birth (DATE)
- emergency_contact (TEXT)
- role (ENUM: guest, volunteer, staff, admin)
- loyalty_points (INTEGER, DEFAULT 0)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### rooms
```sql
- id (UUID, PK)
- name (TEXT)
- type (ENUM: dormitory, private, family, female)
- description (TEXT)
- capacity (INTEGER)
- beds (INTEGER)
- amenities (TEXT[])
- base_price (NUMERIC)
- is_available (BOOLEAN)
- main_image (TEXT) -- Cloudinary URL
- images (TEXT[]) -- Array de URLs
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### season_pricing
```sql
- id (UUID, PK)
- room_id (UUID, FK → rooms)
- season (ENUM: high, medium, low)
- base_price (NUMERIC)
- rack_rate (NUMERIC)
- competitive_rate (NUMERIC)
- last_minute_rate (NUMERIC)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### services
```sql
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- category (ENUM: surf, transport, tour, other)
- price (NUMERIC)
- duration (TEXT)
- is_available (BOOLEAN)
- image_url (TEXT) -- Cloudinary URL
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### surf_packages
```sql
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- duration_nights (INTEGER)
- price (NUMERIC)
- includes (TEXT[])
- is_popular (BOOLEAN)
- is_couple_friendly (BOOLEAN)
- image_url (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### bookings
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- check_in (DATE)
- check_out (DATE)
- num_guests (INTEGER)
- status (ENUM: pending_payment, confirmed, checked_in, checked_out, cancelled)
- payment_status (ENUM: pending, paid, refunded)
- total_amount (NUMERIC)
- paid_amount (NUMERIC)
- payment_method (ENUM: stripe, paypal, cash, transfer)
- booking_source (ENUM: direct, booking_com, hostelworld, airbnb)
- special_requests (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### booking_rooms
```sql
- id (UUID, PK)
- booking_id (UUID, FK → bookings)
- room_id (UUID, FK → rooms)
- check_in (DATE)
- check_out (DATE)
- guests (INTEGER)
- price_per_night (NUMERIC)
- total_price (NUMERIC)
```

#### booking_services
```sql
- id (UUID, PK)
- booking_id (UUID, FK → bookings)
- service_id (UUID, FK → services)
- quantity (INTEGER)
- price_at_booking (NUMERIC)
- scheduled_date (DATE)
```

#### loyalty_rewards
```sql
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- points_required (INTEGER)
- category (ENUM: nights, activities, merchandise, discounts)
- quantity_available (INTEGER)
- is_active (BOOLEAN)
- image_url (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### loyalty_transactions
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- points (INTEGER) -- Positivo = ganó, Negativo = canjeó
- type (ENUM: earned, redeemed, expired, adjusted)
- description (TEXT)
- booking_id (UUID, FK → bookings, NULLABLE)
- reward_id (UUID, FK → loyalty_rewards, NULLABLE)
- created_at (TIMESTAMPTZ)
```

#### room_blocks
```sql
- id (UUID, PK)
- room_id (UUID, FK → rooms, NULLABLE) -- NULL = todas las habitaciones
- start_date (DATE)
- end_date (DATE)
- reason (TEXT)
- created_by (UUID, FK → users)
- created_at (TIMESTAMPTZ)
```

### Relaciones Clave

```
users (1) ──< (N) bookings
bookings (1) ──< (N) booking_rooms
bookings (1) ──< (N) booking_services
rooms (1) ──< (N) booking_rooms
services (1) ──< (N) booking_services
users (1) ──< (N) loyalty_transactions
loyalty_rewards (1) ──< (N) loyalty_transactions
```

---

## ⭐ CARACTERÍSTICAS ESPECIALES {#caracteristicas}

### 1. Pricing Inteligente

El sistema implementa una estrategia de precios dinámica basada en:

**Días hasta el check-in:**
```typescript
const daysUntilCheckIn = daysBetween(today, checkIn)

if (daysUntilCheckIn > 60) {
  price = rackRate // Precio máximo
} else if (daysUntilCheckIn > 10) {
  price = competitiveRate // -10% aprox
} else {
  price = lastMinuteRate // -20% aprox
}
```

**Temporada:**
```typescript
const season = getSeasonForDate(checkIn)
// season: 'high' | 'medium' | 'low'

const pricing = seasonPricing[room_id][season]
```

**Resultado:** Precios que maximizan ocupación y revenue.

### 2. Sistema de Puntos Automático

```typescript
// Al completar pago (webhook)
const pointsEarned = Math.floor(totalAmount / 10) // 1 punto / $10

await addLoyaltyPoints({
  userId,
  points: pointsEarned,
  type: 'earned',
  description: `Booking #${bookingId}`,
  bookingId
})
```

**Transparencia:** El usuario ve cuántos puntos ganará ANTES de pagar.

### 3. Check-in Online con Firma Digital

```typescript
// Componente de firma
<SignatureCanvas
  onEnd={(signature) => {
    saveSignature(signature)
    markCheckInComplete()
  }}
/>
```

**Beneficios:**
- Reduce tiempo de llegada a 2 minutos
- Datos completos antes de la llegada
- Firma legalmente válida

### 4. Email Templates Profesionales

Todos los emails usan React Email (JSX) con diseño responsive:

```tsx
<Email>
  <Container>
    <Heading>¡Reserva Confirmada!</Heading>
    <Text>Hola {guestName},</Text>
    <Text>Tu reserva en Mai Ke Kai está confirmada.</Text>
    
    <Section>
      <Row>
        <Column>Check-in:</Column>
        <Column>{checkIn}</Column>
      </Row>
    </Section>
    
    <Button href={checkInUrl}>
      Completar Check-in Online
    </Button>
  </Container>
</Email>
```

### 5. Admin Panel Autoadministrable

El cliente puede gestionar TODO sin necesidad de desarrollador:

- Crear/editar habitaciones con imágenes
- Crear/editar servicios y tours
- Crear/editar paquetes surf
- Modificar precios por temporada
- Configurar recompensas de loyalty
- Bloquear fechas por mantenimiento
- Ver reportes financieros en tiempo real

### 6. Row Level Security (RLS)

Toda la seguridad está en la base de datos:

```sql
-- Ejemplo: Solo el usuario puede ver sus propias reservas
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id OR 
       EXISTS (
         SELECT 1 FROM users 
         WHERE id = auth.uid() 
         AND role IN ('staff', 'admin')
       ));
```

### 7. Webhooks Resilientes

Los webhooks de Stripe/PayPal están protegidos contra duplicados:

```typescript
// Verificar firma del webhook
const signature = headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(body, signature, secret)

// Idempotencia
const existingBooking = await supabase
  .from('bookings')
  .select('payment_status')
  .eq('stripe_session_id', session.id)
  .single()

if (existingBooking.payment_status === 'paid') {
  return new Response('Already processed', { status: 200 })
}
```

### 8. Optimización de Imágenes Automática

Todas las imágenes subidas a Cloudinary se optimizan:

```typescript
const optimizedUrl = getOptimizedImageUrl(imageUrl, {
  width: 800,
  quality: 'auto',
  format: 'auto' // WebP si el navegador lo soporta
})
```

---

## 📊 MÉTRICAS Y REPORTES

### Dashboard Admin - Métricas en Tiempo Real

1. **Ocupación Actual**
   - Habitaciones ocupadas vs disponibles
   - Porcentaje de ocupación
   - Proyección próximos 30 días

2. **Ingresos del Mes**
   - Total facturado
   - Desglose por categoría (alojamiento, servicios, extras)
   - Comparación mes anterior

3. **Servicios Más Vendidos**
   - Top 5 servicios
   - Cantidad vendida
   - Ingresos generados

4. **Tasa de Reserva Directa**
   - % reservas directas vs OTAs
   - Objetivo: >50%

5. **Programa de Loyalty**
   - Usuarios activos
   - Puntos en circulación
   - Recompensas canjeadas

### Reportes Descargables

- **Reporte de Ocupación** (mensual/anual)
- **Reporte Financiero** (ingresos por categoría)
- **Reporte de Servicios** (más vendidos)
- **Reporte de Huéspedes** (países, duración promedio)
- **Reporte de Loyalty** (engagement, canjes)

---

## 🚀 ROADMAP FUTURO

### Fase 1: Optimizaciones (Completado)
- ✅ CRUD completo de habitaciones
- ✅ CRUD completo de servicios
- ✅ CRUD completo de paquetes
- ✅ CRUD completo de precios por temporada
- ✅ CRUD completo de loyalty rewards
- ✅ Sistema de puntos automático
- ✅ Emails con Resend
- ✅ Check-in online

### Fase 2: Integraciones OTA (Futuro)
- [ ] Channel Manager (conexión con Booking.com)
- [ ] Sincronización automática de disponibilidad
- [ ] Import de reservas de Hostelworld
- [ ] Webhook de Airbnb

### Fase 3: Mejoras UX (Futuro)
- [ ] App móvil nativa (React Native)
- [ ] Chat en vivo con huéspedes
- [ ] Sistema de reviews interno
- [ ] Galería de fotos de huéspedes
- [ ] Blog integrado

### Fase 4: Analytics Avanzado (Futuro)
- [ ] Dashboard de BI con gráficos avanzados
- [ ] Predicción de ocupación (ML)
- [ ] Recomendaciones de precios dinámicos
- [ ] Segmentación de clientes

### Fase 5: Marketing (Futuro)
- [ ] Email marketing automatizado
- [ ] Campañas de retargeting
- [ ] Programa de referidos
- [ ] Cupones de descuento

---

## 📞 SOPORTE Y CONTACTO

**Desarrollador:** v0 by Vercel  
**Cliente:** Mai Ke Kai Hostel & Surf Camp  
**Ubicación:** Tamarindo, Guanacaste, Costa Rica

**Tecnologías Clave:**
- Next.js 16
- React 19
- Supabase
- Stripe + PayPal
- Resend
- Cloudinary

**Licencia:** Propiedad de Mai Ke Kai

---

**Última actualización:** Diciembre 2025  
**Versión del documento:** 1.0
