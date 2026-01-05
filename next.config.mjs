import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Habilitar optimización en producción
    unoptimized: process.env.NODE_ENV === "development",
    // Configurar dominios permitidos para imágenes externas
    domains: [
      "res.cloudinary.com",
      "images.unsplash.com",
      "cdn.sanity.io",
      "localhost",
    ],
    // Configurar tamaños de imagen
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Formatos de imagen
    formats: ["image/webp", "image/avif"],
  },

  // Headers de seguridad y caché
  async headers() {
    return [
      {
        // Headers para todas las rutas
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Headers de caché para assets estáticos
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Headers de caché para imágenes optimizadas
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

  // Compresión y optimización
  compress: true,

  // Configuración de build
  swcMinify: true,

  // Variables de entorno específicas de producción
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Configuración experimental para mejores performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Configuración de powered by
  poweredByHeader: false,

  // Configuración de redirects (si es necesario)
  async redirects() {
    return [
      // Ejemplo: redirigir URLs antiguas
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // }
    ];
  },

  // Configuración de rewrites (si es necesario)
  async rewrites() {
    return [
      // Ejemplo: proxy a APIs externas
      // {
      //   source: '/api/external/:path*',
      //   destination: 'https://external-api.com/:path*',
      // }
    ];
  },
};

export default withNextIntl(nextConfig);
