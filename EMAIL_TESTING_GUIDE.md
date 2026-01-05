# Guía de Testing de Emails con Resend

## Variables de Entorno Requeridas

Asegúrate de tener estas variables configuradas en Vercel:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
STAFF_EMAIL=tu-email@dominio.com
EMAIL_FROM=reservas@maikekai.com  # Opcional, usa default si no está
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
```

## Cómo Obtener tu API Key de Resend

1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. Navega a **API Keys** en el dashboard
3. Haz clic en **Create API Key**
4. Dale un nombre (ej: "Mai Ke Kai Production")
5. Copia la key (empieza con `re_`)
6. Agrégala como `RESEND_API_KEY` en Vercel

## Verificar Dominio de Email (Opcional pero Recomendado)

Para enviar emails desde `reservas@maikekai.com`:

1. En Resend, ve a **Domains** → **Add Domain**
2. Ingresa `maikekai.com`
3. Resend te dará registros DNS (SPF, DKIM, DMARC)
4. Agrégalos en tu proveedor de DNS (Vercel, GoDaddy, etc.)
5. Espera la verificación (puede tomar hasta 24 horas)

**Mientras tanto**: Puedes usar el dominio de prueba de Resend que envía desde `onboarding@resend.dev`

## Endpoint de Prueba

Accede a este endpoint para enviar emails de prueba:

```
https://tu-dominio.vercel.app/api/test-email?email=tu-email@gmail.com
```

Esto enviará:
- Un email de confirmación de reserva a tu email
- Un email de alerta a staff al email configurado en `STAFF_EMAIL`

## Respuesta Esperada

Si todo funciona correctamente, verás:

```json
{
  "success": true,
  "guestEmail": { "success": true, "data": { "id": "..." } },
  "staffEmail": { "success": true, "data": { "id": "..." } },
  "message": "Test emails sent successfully",
  "sentTo": {
    "guest": "tu-email@gmail.com",
    "staff": "staff@maikekai.com"
  }
}
```

## Verificar en Resend Dashboard

1. Ve a [resend.com/emails](https://resend.com/emails)
2. Verás todos los emails enviados con su estado:
   - ✓ Delivered (entregado)
   - ⏳ Queued (en cola)
   - ✗ Failed (fallido)

## Flujo Completo de Emails

### 1. Email de Confirmación al Huésped
**Cuándo:** Después de completar el pago (Stripe o PayPal)
**A quién:** Email del cliente que hizo la reserva
**Contenido:** 
- Número de reserva
- Detalles de la estadía (check-in, check-out, habitaciones)
- Total pagado
- Link para completar check-in online
- Información de contacto

### 2. Email de Alerta al Staff
**Cuándo:** Después de completar el pago
**A quién:** `STAFF_EMAIL` (dueño del hotel)
**Contenido:**
- Nueva reserva notificación
- Datos del huésped
- Detalles de la reserva
- Link al admin dashboard

### 3. Email de Recordatorio de Check-in
**Cuándo:** 1 día antes del check-in (requiere configurar cron job)
**A quién:** Email del cliente
**Contenido:**
- Recordatorio de check-in mañana
- Link para completar check-in online

## Troubleshooting

### Error: "RESEND_API_KEY not configured"
- La API key no está configurada en Vercel
- Agrega la variable y haz redeploy

### Error: "Client Authentication failed"
- La API key es inválida
- Verifica que copiaste la key completa
- Regenera la key en Resend si es necesario

### Emails no llegan
- Revisa la carpeta de spam
- Verifica el dominio en Resend
- Usa el endpoint `/api/test-email` para debugging
- Revisa los logs en Resend dashboard

### Emails llegan pero desde onboarding@resend.dev
- Esto es normal si no has verificado tu dominio
- Para usar `reservas@maikekai.com`, verifica el dominio en Resend

## Webhooks Configurados

Los emails se envían automáticamente cuando:

### Stripe Webhook
- Evento: `checkout.session.completed`
- Acción: Envía email de confirmación + alerta a staff

### PayPal Webhook  
- Evento: `PAYMENT.CAPTURE.COMPLETED`
- Acción: Envía email de confirmación + alerta a staff

Ambos webhooks deben estar configurados en sus respectivos dashboards apuntando a:
- Stripe: `https://tu-dominio.vercel.app/api/stripe/webhook`
- PayPal: `https://tu-dominio.vercel.app/api/paypal/webhook`
