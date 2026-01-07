# Variables de Entorno - Mai Ke Kai

## Archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# ===========================================
# Mai Ke Kai - Environment Variables (Development)
# ===========================================

# ============ SUPABASE ============
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============ AUTHENTICATION ============
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-change-in-production

# ============ EMAIL (RESEND) ============
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Mai Ke Kai <noreply@maikekai.com>
REPLY_TO=maikekaisurfhouse@gmail.com
STAFF_EMAIL=staff@maikekai.com
RESEND_TEST_EMAIL=tu-email@ejemplo.com

# ============ PAYMENTS ============
# Tilopay (Costa Rican Payment Gateway)
NEXT_PUBLIC_TILOPAY_MERCHANT_ID=your-merchant-id
NEXT_PUBLIC_TILOPAY_API_KEY=your-api-key
TILOPAY_SECRET_KEY=your-secret-key
TILOPAY_SANDBOX=true  # Set to false for production

# ============ IMAGES (CLOUDINARY) ============
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mai-ke-kai

# ============ BASE URL ============
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ============ DEVELOPMENT ============
NODE_ENV=development

# ============ OPTIONAL ============
# Analytics
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID

# Sentry (Error Monitoring)
SENTRY_DSN=your-sentry-dsn

# Custom Keys
CUSTOM_KEY=development-key
```

## Configuración de Producción

Para producción (Vercel/Netlify), configura estas variables en el dashboard de tu proveedor de hosting.

## Servicios Externos Requeridos

1. **Supabase**: Base de datos y autenticación
2. **Resend**: Envío de emails
3. **Tilopay**: Procesamiento de pagos (Costa Rica)
4. **Cloudinary**: Gestión y optimización de imágenes

## Instrucciones de Configuración

### 1. Supabase

- Crea un proyecto en supabase.com
- Copia la URL y las keys desde Settings > API

### 2. Resend

- Regístrate en resend.com
- Crea una API key desde API Keys
- Para producción, verifica tu dominio

### 3. Tilopay

- Crea una cuenta en tilopay.com
- Obtén API Key, API Secret, Merchant ID desde el dashboard
- Configura webhooks para eventos de pago
- Para producción, configura el webhook URL: `https://tu-dominio.com/api/tilopay/webhook`

### 5. Cloudinary

- Regístrate en cloudinary.com
- Crea un upload preset sin firma
- Obtén cloud name, API key y secret
