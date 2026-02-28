/**
 * Script para verificar la estructura de la base de datos en Supabase
 * Ejecutar con: npx tsx scripts/verify-db-structure.ts
 * 
 * Asegúrate de tener un archivo .env.local con:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Cargar variables de entorno desde .env.local manualmente
function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Faltan variables de entorno:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Estructura esperada según types/database.ts
const expectedStructure = {
  service_categories: {
    columns: [
      "id",
      "name",
      "slug",
      "description",
      "icon",
      "color",
      "display_order",
      "is_active",
      "created_at",
      "updated_at",
    ],
    required: ["id", "name", "slug", "is_active"],
  },
  rooms: {
    columns: [
      "id",
      "name",
      "type",
      "capacity",
      "sell_unit",
      "description",
      "amenities",
      "main_image",
      "images",
      "is_active",
      "created_at",
      "updated_at",
    ],
    required: ["id", "name", "type", "capacity", "sell_unit", "is_active"],
  },
  services: {
    columns: [
      "id",
      "name",
      "description",
      "category",
      "price",
      "duration_hours",
      "max_participants",
      "image_url",
      "is_active",
    ],
    required: ["id", "name", "category", "price", "is_active"],
  },
  surf_packages: {
    columns: [
      "id",
      "name",
      "tagline",
      "description",
      "nights",
      "surf_lessons",
      "room_type",
      "includes",
      "price",
      "original_price",
      "image_url",
      "is_popular",
      "is_for_two",
      "is_active",
      "display_order",
      "created_at",
      "updated_at",
    ],
    required: [
      "id",
      "name",
      "nights",
      "surf_lessons",
      "room_type",
      "includes",
      "price",
      "is_active",
    ],
  },
  season_pricing: {
    columns: [
      "id",
      "room_id",
      "season",
      "base_price",
      "rack_rate",
      "competitive_rate",
      "last_minute_rate",
      "valid_from",
      "valid_to",
    ],
    required: ["id", "room_id", "season", "base_price"],
  },
  bookings: {
    columns: [
      "id",
      "booking_reference",
      "user_id",
      "check_in",
      "check_out",
      "guests_count",
      "status",
      "payment_status",
      "total_amount",
      "paid_amount",
      "special_requests",
      "source",
      "created_at",
      "updated_at",
    ],
    required: ["id", "user_id", "check_in", "check_out", "status"],
  },
  booking_rooms: {
    columns: ["id", "booking_id", "room_id", "bed_id", "price_per_night"],
    required: ["id", "booking_id", "room_id", "price_per_night"],
  },
  booking_services: {
    columns: [
      "id",
      "booking_id",
      "service_id",
      "quantity",
      "scheduled_date",
      "scheduled_time",
      "price_at_booking",
      "notes",
    ],
    required: ["id", "booking_id", "service_id", "quantity", "price_at_booking"],
  },
  users: {
    columns: [
      "id",
      "email",
      "full_name",
      "phone",
      "nationality",
      "passport_number",
      "passport_expiry",
      "date_of_birth",
      "emergency_contact",
      "role",
      "loyalty_points",
      "created_at",
      "updated_at",
    ],
    required: ["id", "email", "role"],
  },
};

async function getTableColumns(tableName: string): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_table_columns", {
    table_name: tableName,
  });

  if (error) {
    // Si la función RPC no existe, intentar con una query directa
    const { data: columnsData, error: queryError } = await supabase
      .from(tableName)
      .select()
      .limit(1);

    if (queryError) {
      // Si la tabla no existe, retornar array vacío
      if (queryError.code === "42P01") {
        return [];
      }
      console.error(`Error querying ${tableName}:`, queryError.message);
      return [];
    }

    // Retornar las columnas que encontramos del registro
    return columnsData && columnsData.length > 0
      ? Object.keys(columnsData[0])
      : [];
  }

  return data?.map((row: any) => row.column_name) || [];
}

async function getTableRowCount(tableName: string): Promise<number> {
  const { count, error } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true });

  if (error) {
    return -1;
  }

  return count || 0;
}

async function verifyDatabase() {
  console.log("\n🔍 VERIFICACIÓN DE BASE DE DATOS SUPABASE");
  console.log("=".repeat(50));
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log("=".repeat(50));

  const results: {
    table: string;
    exists: boolean;
    rowCount: number;
    missingColumns: string[];
    extraColumns: string[];
    status: "✅" | "⚠️" | "❌";
  }[] = [];

  for (const [tableName, expected] of Object.entries(expectedStructure)) {
    console.log(`\n📋 Verificando tabla: ${tableName}`);

    // Obtener columnas existentes
    const existingColumns = await getTableColumns(tableName);
    const rowCount = await getTableRowCount(tableName);

    if (existingColumns.length === 0 && rowCount === -1) {
      console.log(`   ❌ Tabla NO EXISTE`);
      results.push({
        table: tableName,
        exists: false,
        rowCount: 0,
        missingColumns: expected.columns,
        extraColumns: [],
        status: "❌",
      });
      continue;
    }

    // Comparar columnas
    const missingColumns = expected.columns.filter(
      (col) => !existingColumns.includes(col)
    );
    const extraColumns = existingColumns.filter(
      (col) => !expected.columns.includes(col)
    );

    // Verificar columnas requeridas
    const missingRequired = expected.required.filter(
      (col) => !existingColumns.includes(col)
    );

    let status: "✅" | "⚠️" | "❌" = "✅";
    if (missingRequired.length > 0) {
      status = "❌";
      console.log(`   ❌ Faltan columnas REQUERIDAS: ${missingRequired.join(", ")}`);
    } else if (missingColumns.length > 0) {
      status = "⚠️";
      console.log(`   ⚠️  Faltan columnas opcionales: ${missingColumns.join(", ")}`);
    } else {
      console.log(`   ✅ Todas las columnas presentes`);
    }

    if (extraColumns.length > 0) {
      console.log(`   ℹ️  Columnas extra en DB: ${extraColumns.join(", ")}`);
    }

    console.log(`   📊 Registros: ${rowCount}`);

    results.push({
      table: tableName,
      exists: true,
      rowCount,
      missingColumns,
      extraColumns,
      status,
    });
  }

  // Resumen final
  console.log("\n\n📊 RESUMEN FINAL");
  console.log("=".repeat(50));

  const ok = results.filter((r) => r.status === "✅").length;
  const warnings = results.filter((r) => r.status === "⚠️").length;
  const errors = results.filter((r) => r.status === "❌").length;

  console.log(`✅ Tablas correctas: ${ok}`);
  console.log(`⚠️  Tablas con warnings: ${warnings}`);
  console.log(`❌ Tablas con errores: ${errors}`);

  console.log("\n📋 Detalle por tabla:");
  console.log("-".repeat(50));

  for (const result of results) {
    const statusIcon = result.status;
    const rowInfo = result.exists ? ` (${result.rowCount} registros)` : "";
    console.log(`${statusIcon} ${result.table}${rowInfo}`);
  }

  // Datos de ejemplo
  console.log("\n\n📦 DATOS ACTUALES EN LA BASE DE DATOS");
  console.log("=".repeat(50));

  // Service Categories
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, slug, icon, is_active")
    .order("display_order");
  console.log("\n🏷️ CATEGORÍAS DE SERVICIOS:");
  if (categories && categories.length > 0) {
    categories.forEach((c: any) => {
      console.log(
        `   - ${c.name} (${c.slug}, icon: ${c.icon || "none"}) ${c.is_active ? "✅" : "❌"}`
      );
    });
  } else {
    console.log("   ⚠️  No hay categorías registradas");
    console.log("   💡 Ejecuta sql/create-service-categories.sql en Supabase");
  }

  // Rooms
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, type, capacity, is_active")
    .order("name");
  console.log("\n🏨 HABITACIONES:");
  if (rooms && rooms.length > 0) {
    rooms.forEach((r: any) => {
      console.log(
        `   - ${r.name} (${r.type}, ${r.capacity} cap) ${r.is_active ? "✅" : "❌"}`
      );
    });
  } else {
    console.log("   ⚠️  No hay habitaciones registradas");
  }

  // Services
  const { data: services } = await supabase
    .from("services")
    .select("id, name, category, price, is_active")
    .order("category")
    .order("name");
  console.log("\n🏄 SERVICIOS:");
  if (services && services.length > 0) {
    services.forEach((s: any) => {
      console.log(
        `   - ${s.name} (${s.category}, $${s.price}) ${s.is_active ? "✅" : "❌"}`
      );
    });
  } else {
    console.log("   ⚠️  No hay servicios registrados");
  }

  // Packages
  const { data: packages } = await supabase
    .from("surf_packages")
    .select("id, name, nights, price, is_active, is_popular")
    .order("display_order");
  console.log("\n📦 PAQUETES:");
  if (packages && packages.length > 0) {
    packages.forEach((p: any) => {
      const badges = [];
      if (p.is_popular) badges.push("⭐");
      if (!p.is_active) badges.push("❌");
      console.log(
        `   - ${p.name} (${p.nights} nights, $${p.price}) ${badges.join(" ")}`
      );
    });
  } else {
    console.log("   ⚠️  No hay paquetes registrados");
  }

  // Season Pricing
  const { data: pricing } = await supabase
    .from("season_pricing")
    .select("id, room_id, season, base_price")
    .order("room_id");
  console.log("\n💰 PRECIOS POR TEMPORADA:");
  if (pricing && pricing.length > 0) {
    // Group by room
    const byRoom: Record<string, any[]> = {};
    pricing.forEach((p: any) => {
      if (!byRoom[p.room_id]) byRoom[p.room_id] = [];
      byRoom[p.room_id].push(p);
    });
    Object.entries(byRoom).forEach(([roomId, prices]) => {
      const pricesStr = prices
        .map((p: any) => `${p.season}: $${p.base_price}`)
        .join(", ");
      console.log(`   - Room ${roomId.slice(0, 8)}...: ${pricesStr}`);
    });
  } else {
    console.log("   ⚠️  No hay precios registrados");
  }

  console.log("\n" + "=".repeat(50));
  console.log("🏁 Verificación completada\n");

  // Exit code
  process.exit(errors > 0 ? 1 : 0);
}

verifyDatabase().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
