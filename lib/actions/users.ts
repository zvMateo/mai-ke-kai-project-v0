"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { User, LoyaltyTransaction } from "@/types/database"

// Get current user profile
export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: user, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return user as User
}

// Update user profile
export async function updateUserProfile(data: Partial<User>) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) throw new Error("Not authenticated")

  const { data: user, error } = await supabase
    .from("users")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", authUser.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating user:", error)
    throw new Error("Failed to update profile")
  }

  revalidatePath("/dashboard")
  return user as User
}

// Get user loyalty transactions
export async function getLoyaltyTransactions() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) throw new Error("Not authenticated")

  const { data: transactions, error } = await supabase
    .from("loyalty_transactions")
    .select("*")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching loyalty transactions:", error)
    throw new Error("Failed to fetch loyalty transactions")
  }

  return transactions as LoyaltyTransaction[]
}

// Redeem loyalty points
export async function redeemLoyaltyPoints(points: number, description: string) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) throw new Error("Not authenticated")

  // Get current points
  const { data: user } = await supabase.from("users").select("loyalty_points").eq("id", authUser.id).single()

  if (!user || user.loyalty_points < points) {
    throw new Error("Insufficient loyalty points")
  }

  // Deduct points
  const { error: updateError } = await supabase
    .from("users")
    .update({ loyalty_points: user.loyalty_points - points })
    .eq("id", authUser.id)

  if (updateError) {
    console.error("Error deducting points:", updateError)
    throw new Error("Failed to redeem points")
  }

  // Record transaction
  const { error: transactionError } = await supabase.from("loyalty_transactions").insert({
    user_id: authUser.id,
    points: -points,
    description,
  })

  if (transactionError) {
    console.error("Error recording transaction:", transactionError)
  }

  revalidatePath("/dashboard")
  return { success: true, remainingPoints: user.loyalty_points - points }
}

// Admin: Get all users
export async function getAllUsers(filters?: { role?: string; search?: string }) {
  const supabase = await createClient()

  let query = supabase.from("users").select("*").order("created_at", { ascending: false })

  if (filters?.role) {
    query = query.eq("role", filters.role)
  }

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  const { data: users, error } = await query

  if (error) {
    console.error("Error fetching users:", error)
    throw new Error("Failed to fetch users")
  }

  return users as User[]
}

// Admin: Update user role
export async function updateUserRole(userId: string, role: User["role"]) {
  const supabase = await createClient()

  const { error } = await supabase.from("users").update({ role, updated_at: new Date().toISOString() }).eq("id", userId)

  if (error) {
    console.error("Error updating user role:", error)
    throw new Error("Failed to update user role")
  }

  revalidatePath("/admin/guests")
  return { success: true }
}

// Admin: Add loyalty points manually
export async function addLoyaltyPoints(userId: string, points: number, description: string) {
  const supabase = await createClient()

  // Get current points
  const { data: user } = await supabase.from("users").select("loyalty_points").eq("id", userId).single()

  if (!user) throw new Error("User not found")

  // Add points
  const { error: updateError } = await supabase
    .from("users")
    .update({ loyalty_points: user.loyalty_points + points })
    .eq("id", userId)

  if (updateError) {
    console.error("Error adding points:", updateError)
    throw new Error("Failed to add points")
  }

  // Record transaction
  await supabase.from("loyalty_transactions").insert({
    user_id: userId,
    points,
    description,
  })

  revalidatePath("/admin/guests")
  return { success: true }
}
