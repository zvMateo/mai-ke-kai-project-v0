# Análisis de Flujos de Usuario - Mai Ke Kai

## Estado Actual de Flujos

---

## 1. FLUJO DE REGISTRO (Sign Up)

### Estado: PARCIALMENTE FUNCIONAL (70%)

**Lo que funciona:**
- Formulario de registro con email/password
- Validación de contraseña (min 6 caracteres)
- Confirmación de contraseña
- Redirección a página de éxito

**Lo que FALTA:**
- [ ] **Email de bienvenida/confirmación con Resend** - Actualmente usa el email nativo de Supabase que puede ir a spam
- [ ] Sincronización automática de usuarios auth → public.users (el trigger existe pero debe verificarse)

### Flujo Actual:
1. Usuario llena formulario → 2. Supabase Auth crea usuario → 3. Supabase envía email de confirmación (NO Resend) → 4. Usuario hace clic en enlace → 5. Usuario confirmado

### Flujo Deseado:
1. Usuario llena formulario → 2. Supabase Auth crea usuario → 3. **Resend envía email bonito de bienvenida** → 4. Usuario hace clic en enlace → 5. Usuario confirmado + registro en tabla users

---

## 2. FLUJO DE RESERVA

### Estado: FUNCIONAL (85%)

**Lo que funciona:**
- Selección de fechas y huéspedes
- Selección de habitaciones con precios dinámicos de Supabase
- Selección de servicios extra
- Formulario de datos del huésped
- Pago con Stripe y PayPal
- Creación de booking en base de datos

**Lo que FALTA:**
- [ ] Usuarios logueados deberían ver sus datos pre-llenados
- [ ] **Sistema de puntos para usuarios logueados** - La lógica existe pero no se activa
- [ ] Email de confirmación post-pago (depende del webhook)

### Flujo para Usuario NO Logueado:
1. Selecciona fechas → 2. Elige habitación → 3. Agrega extras → 4. Llena datos → 5. Paga → 6. Recibe confirmación

### Flujo para Usuario Logueado (DEBERÍA SER):
1. Selecciona fechas → 2. Elige habitación → 3. Agrega extras → 4. **Datos pre-llenados** → 5. Paga → 6. Recibe confirmación + **SUMA PUNTOS**

---

## 3. FLUJO DEL ROL ADMIN

### Estado: PARCIALMENTE FUNCIONAL (75%)

**Lo que funciona:**
- Login y autenticación
- Dashboard con estadísticas (necesita datos reales)
- CRUD de Habitaciones ✓
- CRUD de Servicios ✓
- CRUD de Paquetes Surf ✓
- CRUD de Precios por Temporada ✓
- CRUD de Loyalty Rewards ✓
- Gestión de Reservas (ver, cambiar estado)
- Gestión de Bloqueos de fechas

**Lo que FALTA:**
- [ ] **Menú de navegación NO incluye Packages, Pricing, ni Loyalty** en el sidebar
- [ ] Dashboard con datos reales (actualmente muestra stats mock)
- [ ] Reportes financieros detallados

---

## 4. FLUJO DEL ROL VOLUNTARIO

### Estado: NO IMPLEMENTADO (0%)

Según el concepto del proyecto:
> "Voluntarios (3 a la vez): Cubren turnos de día. Realizan limpieza, recepción, preparan el desayuno, crean una buena 'vibra' en el hostal y responden dudas de los huéspedes."

**Lo que FALTA implementar:**
- [ ] Rol "volunteer" en la base de datos
- [ ] Panel de voluntario con funciones limitadas:
  - Ver reservas del día
  - Hacer check-in de huéspedes
  - Ver información de huéspedes
  - NO puede editar precios, habitaciones, etc.
- [ ] Gestión de voluntarios desde el admin

---

## 5. FLUJO DE EMAILS

### Estado: PARCIALMENTE FUNCIONAL (60%)

**Lo que funciona:**
- Template de confirmación de reserva
- Template de alerta a staff
- Template de cancelación
- Template de recordatorio de check-in
- Envío vía Resend (probado con dominio de prueba)

**Lo que FALTA:**
- [ ] **Email de bienvenida al registrarse** (usa email nativo de Supabase, no Resend)
- [ ] Webhook de Stripe/PayPal NO envía emails correctamente (el código existe pero no se ejecuta en producción)
- [ ] Configurar dominio personalizado en Resend para producción

---

## RESUMEN DE TAREAS PRIORITARIAS

### Alta Prioridad (Bloqueantes):
1. Agregar links faltantes en sidebar del admin (Packages, Pricing, Loyalty)
2. Implementar email de bienvenida con Resend al registrarse
3. Verificar/arreglar envío de emails post-pago (webhooks)
4. Sistema de puntos para usuarios logueados

### Media Prioridad:
5. Pre-llenar datos del usuario logueado en booking
6. Dashboard admin con datos reales
7. Implementar rol de voluntario con permisos limitados

### Baja Prioridad:
8. Reportes financieros detallados
9. Gestión de voluntarios
10. Verificar dominio personalizado en Resend

---

## ROLES ACTUALES vs REQUERIDOS

| Rol | Estado | Permisos |
|-----|--------|----------|
| guest | ✓ Existe | Ver reservas propias, acumular puntos |
| staff | ✓ Existe | Acceso al admin panel completo |
| admin | ✓ Existe | Igual que staff (mismo nivel) |
| volunteer | ❌ FALTA | Ver reservas del día, hacer check-in, ver huéspedes |
