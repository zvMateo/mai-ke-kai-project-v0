# Mai Ke Kai PMS - Guía de Deployment

## ✅ Estado Actual del Proyecto

### Integraciones Configuradas

- ✅ **Supabase**: Base de datos PostgreSQL con 12 tablas y RLS policies
- ✅ **Tilopay**: Payment gateway costarricense con webhook configurado
- ✅ **Resend**: Sistema de emails transaccionales

### Variables de Entorno Configuradas

```bash
# Supabase (Auto-configurado)
SUPABASE_URL=✅
NEXT_PUBLIC_SUPABASE_URL=✅
SUPABASE_ANON_KEY=✅
NEXT_PUBLIC_SUPABASE_ANON_KEY=✅
SUPABASE_SERVICE_ROLE_KEY=✅
POSTGRES_URL=✅

# Tilopay (Auto-configurado)
TILOPAY_API_KEY=✅
TILOPAY_API_SECRET=✅
TILOPAY_MERCHANT_ID=✅
TILOPAY_WEBHOOK_SECRET=✅
TILOPAY_SANDBOX=✅

# Resend
RESEND_API_KEY=✅

# General
NEXT_PUBLIC_BASE_URL=✅
STAFF_EMAIL=✅
EMAIL_FROM=✅
```

---

## 📋 Checklist de Deployment

### 1. Configuración de Base de Datos

- [x] Ejecutar `scripts/001-create-schema.sql`
- [x] Ejecutar `scripts/002-seed-data.sql`
- [x] Ejecutar `scripts/003-add-booking-source.sql`
- [x] Ejecutar `scripts/003-add-payment-fields.sql`

### 2. Configuración de Stripe

- [ ] Crear webhook en Stripe Dashboard:
  - URL: `https://TU-DOMINIO.vercel.app/api/stripe/webhook`
  - Eventos: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
  - Copiar Signing Secret → `STRIPE_WEBHOOK_SECRET`

### 3. Configuración de PayPal

- [ ] Crear app en PayPal Developer Dashboard
- [ ] Obtener Client ID y Secret
- [ ] Configurar webhook URL: `https://maikekaihouse.com/api/paypal/webhook`
- [ ] Cambiar `PAYPAL_MODE` a `live` cuando vayas a producción

### 4. Configuración de Resend

- [ ] Crear cuenta en resend.com
- [ ] Verificar dominio (opcional pero recomendado)
- [ ] Obtener API Key
- [ ] Configurar `EMAIL_FROM` con tu dominio verificado

### 5. Deployment en Vercel

- [ ] Hacer clic en "Publish" en v0
- [ ] Copiar URL de Vercel
- [ ] Actualizar `NEXT_PUBLIC_BASE_URL` con la URL real
- [ ] Configurar dominio personalizado (opcional)

---

## 🚀 Funcionalidades Implementadas

### Frontend (Guest/Cliente)

- ✅ Landing Page con hero, rooms, servicios, testimonials
- ✅ Booking Engine (5 pasos: búsqueda, habitaciones, extras, datos, pago)
- ✅ Check-in Online con firma digital y pasaporte
- ✅ Dashboard de usuario con próximas reservas
- ✅ Sistema de Puntos de Fidelidad (Bronze/Silver/Gold)
- ✅ Paquetes Surf + Alojamiento (4 paquetes)
- ✅ Integración Stripe Embedded Checkout
- ✅ Integración PayPal con recargo 10%

### Backend (Admin/Staff)

- ✅ Dashboard con stats (revenue, ocupación, check-ins/outs)
- ✅ Gestión de Reservas con filtros y búsqueda
- ✅ Crear Reserva Manual (walk-in, teléfono, OTAs)
- ✅ Vista detallada de reserva con acciones
- ✅ Gestión de Habitaciones y Camas
- ✅ Calendario de Ocupación interactivo
- ✅ Gestión de Huéspedes
- ✅ Gestión de Servicios (surf, tours)
- ✅ Bloqueo de Fechas (mantenimiento, OTA sync)
- ✅ Reportes Financieros:
  - Revenue Chart (Alojamiento vs Servicios)
  - Occupancy Report con target 70%
  - Services Report con top performers
  - Channel Report con análisis de comisiones

### Server Actions & APIs

- ✅ CRUD completo para Rooms, Bookings, Services, Users
- ✅ Availability checker con calendario mensual
- ✅ Pricing engine con temporadas y lead-time
- ✅ Stripe webhook handler
- ✅ PayPal webhook handler
- ✅ Sistema de emails transaccionales (Resend)
- ✅ Check-in/Check-out con loyalty points automáticos
- ✅ Sistema de reportes y analytics

---

## 🎨 Diseño del Sitio

### Colores de Marca

- **Ocean Blue**: `#5B8A9A` - Color principal
- **Deep Blue**: `#0E3244` - Texto y headers
- **Sand/Pale Blue**: `#EEF4FF` - Backgrounds
- **Coral**: `#E07A5F` - Acentos
- **Seafoam**: `#7DCFB6` - Highlights

### Tipografía

- **Headings**: Montserrat (bold, surfero)
- **Body**: Inter (clean, profesional)

---

## 📊 Estructura de Base de Datos

### Tablas Principales

1. **users**: Perfiles, loyalty points, roles
2. **rooms**: 4 tipos (Dorm 10, Private 4, Family 4, Female 4)
3. **beds**: 18 camas totales
4. **bookings**: Reservas con source tracking
5. **booking_rooms**: Join table para habitaciones/camas reservadas
6. **booking_services**: Servicios adicionales por reserva
7. **services**: 10 servicios (surf, tours, transport)
8. **season_pricing**: Pricing dinámico por temporada
9. **season_dates**: 5 temporadas (High, Green, Shoulder, etc.)
10. **check_in_data**: Datos de pasaporte y firma digital
11. **loyalty_transactions**: Historial de puntos
12. **room_blocks**: Bloqueos de fechas

### Row Level Security (RLS)

- ✅ Políticas para guest, staff, admin
- ✅ Users solo ven sus propias reservas
- ✅ Staff puede ver/editar todas las reservas
- ✅ Admin tiene acceso completo

---

## 🔐 Roles de Usuario

### guest (Default)

- Ver disponibilidad
- Crear reservas
- Ver propias reservas
- Check-in online
- Ver puntos de fidelidad

### staff

- Todo lo de guest +
- Ver todas las reservas
- Editar reservas
- Check-in/Check-out manual
- Crear reservas manuales
- Ver reportes básicos

### admin

- Todo lo de staff +
- Gestionar habitaciones
- Gestionar servicios
- Bloquear fechas
- Ver reportes financieros completos
- Acceso a todos los endpoints

---

## 📧 Emails Transaccionales

### Templates Implementados

1. **Confirmación de Reserva**
   - Trigger: Pago completado
   - Incluye: Detalles, link check-in, QR code
2. **Alerta a Staff**

   - Trigger: Nueva reserva creada
   - Incluye: Detalles para preparar habitación

3. **Recordatorio Check-in**

   - Trigger: 24h antes del check-in
   - Incluye: Link check-in, instrucciones llegada

4. **Confirmación de Cancelación**
   - Trigger: Reserva cancelada
   - Incluye: Detalles de reembolso

---

## 🧪 Testing Checklist

### Flujo de Reserva

- [ ] Buscar disponibilidad
- [ ] Seleccionar habitación
- [ ] Agregar extras (surf lesson)
- [ ] Completar datos de huésped
- [ ] Pagar con Stripe test card: `4242 4242 4242 4242`
- [ ] Verificar email de confirmación
- [ ] Verificar que aparece en Admin Dashboard

### Check-in Online

- [ ] Acceder al link desde email
- [ ] Subir foto de pasaporte
- [ ] Firmar digitalmente
- [ ] Verificar que se otorgan puntos de fidelidad

### Admin Panel

- [ ] Ver reservas en calendario
- [ ] Crear reserva manual
- [ ] Check-in manual
- [ ] Check-out y verificar puntos
- [ ] Ver reportes financieros

---

## 🐛 Troubleshooting

### Webhook no recibe eventos

1. Verificar URL del webhook en Stripe/PayPal
2. Verificar que `STRIPE_WEBHOOK_SECRET` es correcto
3. Ver logs en Vercel Dashboard

### Emails no se envían

1. Verificar `RESEND_API_KEY` es válido
2. Verificar dominio está verificado en Resend
3. Verificar `EMAIL_FROM` usa dominio verificado

### Errores de Base de Datos

1. Verificar que todos los scripts SQL se ejecutaron
2. Verificar RLS policies están habilitadas
3. Verificar user tiene rol correcto en `users.role`

---

## 🎯 Próximos Pasos Opcionales

### Mejoras Futuras

- [ ] Integración con Channel Manager (Cloudbeds, etc.)
- [ ] Sistema de Housekeeping
- [ ] Chat en vivo con huéspedes
- [ ] Multi-idioma (EN/ES)
- [ ] App móvil (React Native)
- [ ] Sistema de Reviews
- [ ] Programa de Referidos
- [ ] Analytics avanzado (Mixpanel, PostHog)

---

## 📱 Contacto y Soporte

Para soporte técnico o preguntas:

- Email: ${process.env.STAFF_EMAIL}
- Dashboard: `https://maikekaihouse.com/admin`

---

## Proyecto desarrollado con v0 by Vercel
