
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables manually from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim().replace(/^["']|["']$/g, ""); // Remove quotes
      if (!process.env[key.trim()]) {
         process.env[key.trim()] = value;
      }
    }
  });
}

async function clearDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("⚠️  WARNING: You are about to DELETE ALL DATA from the database. ⚠️");
  console.log("This action cannot be undone.");
  console.log("Starting cleanup in 5 seconds... Press Ctrl+C to cancel.");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("\n🧹 Starting database cleanup...");

  // Delete tables in dependency order (children first)
  const tables = [
    "check_in_data",
    "booking_rooms",
    "booking_services",
    "loyalty_transactions",
    "bookings",
    "room_blocks",
    "season_pricing",
    "beds",
    "rooms",
    "services",
    "surf_packages",
    "loyalty_rewards",
    "season_dates",
    "admin_invitations",
    "pending_signups",
    "email_confirmation_tokens",
    // "users" // We will handle users separately to verify if we want to keep admin
  ];

  for (const table of tables) {
    console.log(`Deleting data from ${table}...`);
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Hack to delete all rows (since delete requires a filter)
    // Actually, .neq('id', '00000000-...') assumes UUID id.
    // If table doesn't have 'id' column or is not UUID, this might fail.
    // Most tables in schema have 'id' uuid.
    // check_in_data: id uuid
    // booking_rooms: id uuid
    // booking_services: id uuid
    // ...
    // All seem to have id uuid.

    // Better way is .gte('id', '00000000-0000-0000-0000-000000000000') or similar if UUID.
    // Or just .not('id', 'is', null) if allowed? No.
    // .neq('id', '00000000-0000-0000-0000-000000000000') works for UUIDs.

    if (error) {
      console.error(`❌ Error deleting from ${table}:`, error.message);
    } else {
      console.log(`✅ Cleared ${table}`);
    }
  }

  // Handle Users
  // We want to keep the user with admin role if possible, or just delete all if requested "completely"
  // The user said "vaciar completamente".
  // However, deleting users also breaks auth links usually.
  // We will delete all users for now as requested.
  // Warning: This deletes the public profile. Auth user remains in Supabase Auth but will be "orphaned" in our app until they are re-created or re-linked.
  
  console.log("Processing users table...");
  // Check if we have an admin user we might want to warn about?
  // Let's just delete all as requested "empty completely".
  // The client can re-create the admin profile.
  const { error: usersError } = await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (usersError) {
     console.error(`❌ Error clearing users:`, usersError.message);
  } else {
     console.log(`✅ Cleared users`);
  }

  console.log("\n✨ Database cleanup complete. The system is ready for fresh data.");
}

clearDatabase().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
