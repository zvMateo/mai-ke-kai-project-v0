/**
 * Script para crear la tabla service_categories en Supabase
 * Ejecutar con: npx tsx scripts/create-service-categories-table.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Cargar variables de entorno desde .env.local
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

async function createTable() {
  console.log("\n🔧 Creando tabla service_categories...\n");

  // Check if table already exists
  const { data: existingTable, error: checkError } = await supabase
    .from("service_categories")
    .select("id")
    .limit(1);

  if (!checkError) {
    console.log("⚠️  La tabla service_categories ya existe.");
    
    // Show existing categories
    const { data: categories } = await supabase
      .from("service_categories")
      .select("*")
      .order("display_order");
    
    if (categories && categories.length > 0) {
      console.log("\n📋 Categorías existentes:");
      categories.forEach((cat: any) => {
        console.log(`   - ${cat.name} (${cat.slug}) ${cat.is_active ? "✅" : "❌"}`);
      });
    }
    
    return;
  }

  // Create table using RPC (requires the function to exist)
  // Since we can't run raw SQL easily, we'll create the table via the admin API
  // For now, just show instructions
  
  console.log("❌ La tabla no existe. Necesitas ejecutar el SQL manualmente.\n");
  console.log("📋 Instrucciones:");
  console.log("   1. Ve a Supabase Dashboard → SQL Editor");
  console.log("   2. Copia el contenido de: sql/create-service-categories.sql");
  console.log("   3. Ejecuta el script\n");
  console.log("   O ejecuta este comando para ver el SQL:");
  console.log("   cat sql/create-service-categories.sql\n");
}

createTable().catch(console.error);
