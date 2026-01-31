#!/usr/bin/env node
/**
 * Script to fix the users table role column CHECK constraint
 * Run: node scripts/019-fix-users-role-constraint.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;

      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
    console.log("Loaded environment from .env.local\n");
  } catch (err) {
    console.warn("Could not load .env.local:", err.message);
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function fixUsersRoleConstraint() {
  console.log("Fixing users table role CHECK constraint...\n");

  try {
    // Execute the SQL to fix the constraint
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: `
        -- First, drop the incorrect CHECK constraint (if it exists)
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

        -- Add the correct CHECK constraint
        ALTER TABLE public.users ADD CONSTRAINT users_role_check 
          CHECK (role IN ('guest', 'volunteer', 'staff', 'admin'));

        -- Update default value if needed
        ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'guest';

        -- Grant necessary permissions
        GRANT ALL ON public.users TO authenticated;
        GRANT ALL ON public.users TO anon;
      `,
    });

    if (error) {
      console.error("Error executing SQL via rpc:", error);
      console.log("\nTrying alternative method using direct SQL execution...\n");

      // Alternative: Try using raw SQL through a different approach
      const sql = `
        -- First, drop the incorrect CHECK constraint (if it exists)
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

        -- Add the correct CHECK constraint
        ALTER TABLE public.users ADD CONSTRAINT users_role_check 
          CHECK (role IN ('guest', 'volunteer', 'staff', 'admin'));

        -- Update default value if needed
        ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'guest';

        -- Grant necessary permissions
        GRANT ALL ON public.users TO authenticated;
        GRANT ALL ON public.users TO anon;
      `;

      console.log("SQL to execute manually in Supabase SQL Editor:");
      console.log("=".repeat(60));
      console.log(sql);
      console.log("=".repeat(60));
      console.log("\nPlease go to https://supabase.com/dashboard and run this SQL manually.");
      return;
    }

    console.log("✓ Users table role CHECK constraint fixed successfully!");
    console.log("\nThe admin invitation should now work correctly.");
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

fixUsersRoleConstraint().catch(console.error);
