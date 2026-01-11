import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Create admin invitations table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.admin_invitations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          token TEXT NOT NULL UNIQUE,
          invited_by TEXT,
          expires_at TIMESTAMPTZ NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON public.admin_invitations(token);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON public.admin_invitations(email);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_expires ON public.admin_invitations(expires_at);
      `
    })

    if (createTableError) {
      console.error("Error creating table:", createTableError)
      // Try alternative method if RPC fails
      return NextResponse.json({
        message: "Por favor ejecuta el SQL manualmente en Supabase SQL Editor",
        sql: `
          CREATE TABLE IF NOT EXISTS public.admin_invitations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL UNIQUE,
            token TEXT NOT NULL UNIQUE,
            invited_by TEXT,
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON public.admin_invitations(token);
          CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON public.admin_invitations(email);
          CREATE INDEX IF NOT EXISTS idx_admin_invitations_expires ON public.admin_invitations(expires_at);
        `
      }, { status: 500 })
    }

    return NextResponse.json({
      message: "Tabla creada exitosamente",
      nextStep: "Ahora puedes enviar la invitación"
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({
      message: "Error ejecutando SQL. Copia el SQL de abajo y pégalo en Supabase SQL Editor:",
      sql: `
        CREATE TABLE IF NOT EXISTS public.admin_invitations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          token TEXT NOT NULL UNIQUE,
          invited_by TEXT,
          expires_at TIMESTAMPTZ NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON public.admin_invitations(token);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON public.admin_invitations(email);
        CREATE INDEX IF NOT EXISTS idx_admin_invitations_expires ON public.admin_invitations(expires_at);
      `
    }, { status: 500 })
  }
}