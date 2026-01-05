# Guía de Configuración de PayPal para Mai Ke Kai

## Paso 1: Crear Cuenta de PayPal Developer

1. Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Inicia sesión con tu cuenta de PayPal (o crea una nueva)
3. Acepta los términos de uso de PayPal Developer

---

## Paso 2: Crear App en Sandbox (Pruebas)

1. En el Dashboard, ve a **Apps & Credentials**
2. Asegúrate de estar en la pestaña **Sandbox**
3. Clic en **Create App**
4. Configura:
   - **App Name**: `Mai Ke Kai Surf House Sandbox`
   - **App Type**: `Merchant`
5. Clic en **Create App**

### Obtener Credenciales de Sandbox

1. Una vez creada la app, verás:
   - **Client ID** → Copia este valor
   - **Secret** → Clic en "Show" y copia el valor
2. Guárdalas como:
   ```
   PAYPAL_CLIENT_ID=tu_sandbox_client_id
   PAYPAL_CLIENT_SECRET=tu_sandbox_secret
   PAYPAL_MODE=sandbox
   ```

---

## Paso 3: Configurar Webhooks en Sandbox

1. En la página de tu app, ve a la sección **Webhooks**
2. Clic en **Add Webhook**
3. Configura:
   - **Webhook URL**: `https://tu-dominio.vercel.app/api/paypal/webhook`
   - **Event types**: Selecciona estos eventos:
     - ✅ `CHECKOUT.ORDER.APPROVED`
     - ✅ `PAYMENT.CAPTURE.COMPLETED`
     - ✅ `PAYMENT.CAPTURE.REFUNDED`
4. Clic en **Save**

---

## Paso 4: Probar con Cuentas Sandbox

PayPal Developer te proporciona cuentas de prueba automáticamente:

### Ver Cuentas de Prueba
1. En el Dashboard, ve a **Sandbox → Accounts**
2. Verás 2 cuentas:
   - **Business Account** (tu tienda)
   - **Personal Account** (cliente de prueba)

### Credenciales de Prueba
1. Haz clic en **"..."** junto a la Personal Account
2. Clic en **View/Edit Account**
3. En la pestaña **Account details** verás:
   - **Email**: usa este email para hacer login en PayPal durante pruebas
   - **Password**: haz clic en "Show" para ver la contraseña

### Realizar Pago de Prueba
1. Ve a tu booking engine: `https://tu-dominio.vercel.app/booking`
2. Completa el flujo de reserva hasta el paso de pago
3. Selecciona **PayPal** como método de pago
4. Cuando se abra PayPal, usa las credenciales de la Personal Account (sandbox)
5. Completa el pago
6. Verifica que el webhook se recibió en **Webhooks → Webhook Events**

---

## Paso 5: Configurar Producción (Live)

**⚠️ SOLO CUANDO ESTÉS LISTO PARA PRODUCCIÓN**

1. En PayPal Developer Dashboard, ve a **Apps & Credentials**
2. Cambia a la pestaña **Live**
3. Clic en **Create App**
4. Configura:
   - **App Name**: `Mai Ke Kai Surf House`
   - **App Type**: `Merchant`
5. Obtén las credenciales Live:
   - **Client ID** → Copia
   - **Secret** → Copia

### Actualizar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Actualiza:
   ```
   PAYPAL_CLIENT_ID=tu_live_client_id
   PAYPAL_CLIENT_SECRET=tu_live_secret
   PAYPAL_MODE=live
   ```
4. Redeploy tu aplicación

### Configurar Webhook Live

1. En tu app Live, ve a **Webhooks**
2. Agrega el mismo webhook URL: `https://tu-dominio.vercel.app/api/paypal/webhook`
3. Selecciona los mismos eventos

---

## Paso 6: Verificar Configuración

### Variables de Entorno Necesarias
Asegúrate de tener todas estas variables en Vercel:

```bash
# PayPal
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
PAYPAL_MODE=sandbox  # o 'live' en producción

# Otras (ya configuradas)
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
STRIPE_SECRET_KEY=sk_xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### Probar la Integración

1. **Crear Orden**: 
   - Ve a `/booking` y selecciona habitaciones
   - En el paso de pago, verifica que aparece la opción "PayPal"
   - El total debe mostrar el recargo del 10%

2. **Completar Pago**:
   - Clic en "Pagar con PayPal"
   - Serás redirigido a PayPal (usa cuentas sandbox)
   - Completa el pago
   - Deberías regresar a la página de confirmación

3. **Verificar en Admin**:
   - Ve a `/admin/bookings`
   - La reserva debe aparecer con estado "confirmed"
   - Payment status debe ser "paid"

---

## Recargos de PayPal

Según los requisitos, PayPal tiene un recargo del 10% automático:

- **Precio base**: $100
- **Recargo PayPal (10%)**: +$10
- **Total con PayPal**: $110

Este recargo se aplica automáticamente en el código cuando el cliente selecciona PayPal.

---

## Troubleshooting

### Error: "PayPal credentials not configured"
- Verifica que las variables `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET` estén en Vercel
- Redeploy la aplicación después de agregar las variables

### Webhook no se recibe
- Verifica que la URL del webhook sea correcta
- Revisa los logs en Vercel: `vercel logs`
- Verifica en PayPal Dashboard → Webhooks → Webhook Events

### Pago completado pero booking no se actualiza
- Revisa los logs del webhook en Vercel
- Verifica que el `paypal_order_id` se guardó en la tabla `bookings`
- Verifica las políticas RLS de Supabase

---

## Recursos

- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal REST API Reference](https://developer.paypal.com/docs/api/overview/)
- [PayPal Sandbox Testing Guide](https://developer.paypal.com/tools/sandbox/)
- [PayPal Webhook Events](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)
