# Configuración de Emails con Resend

## Problema: Dominio no verificado

El error **403 "domain not verified"** ocurre porque intentas enviar emails desde `@maikekai.com` pero ese dominio no está verificado en Resend.

### Soluciones:

### Opción 1: Usar el dominio de prueba de Resend (RECOMENDADO para testing)

1. En Vercel, agrega la variable de entorno:
   ```
   EMAIL_FROM=Mai Ke Kai <onboarding@resend.dev>
   ```

2. Los emails se enviarán desde `onboarding@resend.dev` (dominio verificado de Resend)
3. Esto funciona perfectamente para desarrollo y pruebas
4. **Limitación**: Solo puedes enviar emails a tu propio email registrado en Resend

### Opción 2: Verificar tu dominio personalizado (para producción)

1. Ve a [Resend Dashboard](https://resend.com/domains)
2. Click en **Add Domain**
3. Ingresa tu dominio: `maikekai.com`
4. Resend te dará registros DNS para agregar:
   - **SPF**: `TXT @ v=spf1 include:resend.net ~all`
   - **DKIM**: `CNAME resend._domainkey [valor único]`
   - **MX**: `MX @ smtp.resend.com`

5. Agrega estos registros en tu proveedor de DNS (GoDaddy, Cloudflare, etc.)
6. Espera la verificación (puede tardar hasta 48 horas)
7. Una vez verificado, configura:
   ```
   EMAIL_FROM=Mai Ke Kai <reservas@maikekai.com>
   ```

---

## Variables de Entorno Necesarias

```bash
# API Key de Resend (obligatorio)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email remitente (usar dominio verificado)
EMAIL_FROM=Mai Ke Kai <onboarding@resend.dev>

# Email del staff que recibe notificaciones
STAFF_EMAIL=zavalamateo14@gmail.com

# URL base para links en emails
NEXT_PUBLIC_BASE_URL=https://v0-mai-ke-kai-project.vercel.app
```

---

## Rate Limits de Resend

**Plan Gratuito:**
- 2 emails por segundo
- 100 emails por día
- Solo puedes enviar a tu email verificado

**Solución implementada:**
- El código ya tiene un delay de 1 segundo entre emails consecutivos
- Los webhooks de Stripe/PayPal envían emails con rate limiting automático

---

## Probar la Configuración

1. Visita: `https://tu-dominio.vercel.app/api/test-email?email=tu-email@gmail.com`
2. Recibirás 2 emails:
   - **Email 1**: Confirmación de reserva (a tu email)
   - **Email 2**: Alerta de staff (al STAFF_EMAIL configurado)

3. Si usas `onboarding@resend.dev`, solo funcionará si `tu-email@gmail.com` es el email registrado en Resend

---

## Flujo de Emails en Producción

### Después de un pago exitoso (Stripe/PayPal):
1. **Email al huésped**: Confirmación con detalles de reserva y link de check-in online
2. **Email al staff**: Alerta de nueva reserva con enlace al admin dashboard

### Recordatorio de check-in:
- Se puede programar un cron job para enviar recordatorios 1 día antes del check-in
- Incluye link directo al formulario de check-in online

### Cancelaciones:
- Email al huésped confirmando la cancelación
- Incluye información sobre el reembolso si aplica

---

## Troubleshooting

**Error 403 "domain not verified":**
- Solución: Usa `onboarding@resend.dev` en `EMAIL_FROM`

**Error 429 "rate limit exceeded":**
- Solución: El código ya tiene delays, pero asegúrate de no hacer pruebas muy rápidas
- Espera 1 segundo entre cada test

**Emails no llegan:**
- Revisa la carpeta de spam
- Verifica que `RESEND_API_KEY` esté configurada correctamente
- Si usas `onboarding@resend.dev`, solo funcionará para tu email de Resend

**Error "API key not configured":**
- Agrega `RESEND_API_KEY` en Vercel Environment Variables
- Haz un redeploy después de agregar la variable
