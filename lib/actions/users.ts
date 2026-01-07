"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { User, LoyaltyTransaction } from "@/types/database";

// Get current user profile
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return user as User;
}

// Update user profile
export async function updateUserProfile(data: Partial<User>) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  const { data: user, error } = await supabase
    .from("users")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", authUser.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update profile");
  }

  revalidatePath("/dashboard");
  return user as User;
}

// Get user loyalty transactions
export async function getLoyaltyTransactions() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  const { data: transactions, error } = await supabase
    .from("loyalty_transactions")
    .select("*")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching loyalty transactions:", error);
    throw new Error("Failed to fetch loyalty transactions");
  }

  return transactions as LoyaltyTransaction[];
}

// Redeem loyalty points
export async function redeemLoyaltyPoints(points: number, description: string) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  // Get current points
  const { data: user } = await supabase
    .from("users")
    .select("loyalty_points")
    .eq("id", authUser.id)
    .single();

  if (!user || user.loyalty_points < points) {
    throw new Error("Insufficient loyalty points");
  }

  // Deduct points
  const { error: updateError } = await supabase
    .from("users")
    .update({ loyalty_points: user.loyalty_points - points })
    .eq("id", authUser.id);

  if (updateError) {
    console.error("Error deducting points:", updateError);
    throw new Error("Failed to redeem points");
  }

  // Record transaction
  const { error: transactionError } = await supabase
    .from("loyalty_transactions")
    .insert({
      user_id: authUser.id,
      points: -points,
      description,
    });

  if (transactionError) {
    console.error("Error recording transaction:", transactionError);
  }

  revalidatePath("/dashboard");
  return { success: true, remainingPoints: user.loyalty_points - points };
}

// Admin: Get all users
export async function getAllUsers(filters?: {
  role?: string;
  search?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.role) {
    query = query.eq("role", filters.role);
  }

  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data: users, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }

  return users as User[];
}

// Admin: Update user role
export async function updateUserRole(userId: string, role: User["role"]) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }

  revalidatePath("/admin/guests");
  return { success: true };
}

// Admin: Add loyalty points manually
export async function addLoyaltyPoints(
  userId: string,
  points: number,
  description: string
) {
  const supabase = await createClient();

  // Get current points
  const { data: user } = await supabase
    .from("users")
    .select("loyalty_points")
    .eq("id", userId)
    .single();

  if (!user) throw new Error("User not found");

  // Add points
  const { error: updateError } = await supabase
    .from("users")
    .update({ loyalty_points: user.loyalty_points + points })
    .eq("id", userId);

  if (updateError) {
    console.error("Error adding points:", updateError);
    throw new Error("Failed to add points");
  }

  // Record transaction
  await supabase.from("loyalty_transactions").insert({
    user_id: userId,
    points,
    description,
  });

  revalidatePath("/admin/guests");
  return { success: true };
}

// ============================================
// EMAIL CONFIRMATION FUNCTIONS
// ============================================

// Generate a confirmation token for a user
export async function generateConfirmationToken(
  userId: string,
  email: string
): Promise<string> {
  const supabase = await createClient();

  // Invalidate any existing tokens for this user
  await supabase
    .from("email_confirmation_tokens")
    .delete()
    .eq("user_id", userId);

  // Generate a unique token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Save token to database
  const { error } = await supabase.from("email_confirmation_tokens").insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error("Error generating confirmation token:", error);
    throw new Error("Failed to generate confirmation token");
  }

  return token;
}

// Verify a confirmation token and confirm the user's email
export async function confirmEmail(
  token: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Find the token
  const { data: tokenData, error: tokenError } = await supabase
    .from("email_confirmation_tokens")
    .select("*, users!inner(email)")
    .eq("token", token)
    .is("used_at", null)
    .single();

  if (tokenError || !tokenData) {
    return { success: false, error: "Token inválido o ya utilizado" };
  }

  // Check if token has expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return { success: false, error: "Token expirado" };
  }

  // Mark token as used
  const { error: updateError } = await supabase
    .from("email_confirmation_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", tokenData.id);

  if (updateError) {
    console.error("Error marking token as used:", updateError);
    return { success: false, error: "Error al confirmar email" };
  }

  // Confirm user in Supabase Auth
  const { error: authError } = await supabase.auth.admin.updateUserById(
    tokenData.user_id,
    {
      email_confirm: true,
    }
  );

  if (authError) {
    console.error("Error confirming user in Auth:", authError);
    return { success: false, error: authError.message };
  }

  return { success: true };
}

// Resend confirmation email with rate limiting
export async function resendConfirmationEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Find user by email in public.users table
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, full_name")
    .eq("email", email)
    .single();

  if (userError || !user) {
    return { success: false, error: "Usuario no encontrado" };
  }

  // Check rate limiting (2 re-sends per 30 minutes)
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: recentResends } = await supabase
    .from("email_confirmation_tokens")
    .select("resend_count, last_resend_at")
    .eq("user_id", user.id)
    .gte("last_resend_at", thirtyMinAgo)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (recentResends && recentResends.resend_count >= 2) {
    return {
      success: false,
      error: "Límite de reenvíos alcanzado. Espera 30 minutos.",
    };
  }

  // Invalidate existing tokens
  await supabase
    .from("email_confirmation_tokens")
    .delete()
    .eq("user_id", user.id);

  // Generate new token
  const newToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const newCount = recentResends ? recentResends.resend_count + 1 : 1;

  // Save new token with resend count
  await supabase.from("email_confirmation_tokens").insert({
    user_id: user.id,
    token: newToken,
    expires_at: expiresAt.toISOString(),
    resend_count: newCount,
    last_resend_at: new Date().toISOString(),
  });

  // Import sendWelcomeEmail dynamically to avoid circular dependency
  const { sendWelcomeEmail } = await import("@/lib/email");

  // Send confirmation email
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const confirmationUrl = `${siteUrl}/auth/confirm?token=${newToken}`;

  await sendWelcomeEmail({
    to: user.email,
    name: user.full_name || user.email.split("@")[0],
    confirmationUrl,
  });

  return { success: true };
}
