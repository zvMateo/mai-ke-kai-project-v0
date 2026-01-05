"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export interface LoyaltyReward {
  id: string
  name: string
  description: string | null
  points_required: number
  category: "surf" | "accommodation" | "food" | "transport" | "tour" | "other"
  icon: string
  is_active: boolean
  quantity_available: number | null
  times_redeemed: number
  display_order: number
  created_at: string
  updated_at: string
}

// Get all active rewards (for users)
export async function getActiveRewards() {
  const supabase = await createClient()

  const { data: rewards, error } = await supabase
    .from("loyalty_rewards")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  if (error) {
    console.error("Error fetching rewards:", error)
    return []
  }

  return rewards as LoyaltyReward[]
}

// Get all rewards (for admin)
export async function getAllRewards() {
  const supabase = await createClient()

  const { data: rewards, error } = await supabase.from("loyalty_rewards").select("*").order("display_order")

  if (error) {
    console.error("Error fetching all rewards:", error)
    return []
  }

  return rewards as LoyaltyReward[]
}

// Admin: Create reward
export async function createReward(data: Omit<LoyaltyReward, "id" | "times_redeemed" | "created_at" | "updated_at">) {
  const supabase = createAdminClient()

  const { data: reward, error } = await supabase.from("loyalty_rewards").insert(data).select().single()

  if (error) {
    console.error("Error creating reward:", error)
    throw new Error("Failed to create reward")
  }

  revalidatePath("/admin/loyalty")
  revalidatePath("/dashboard/loyalty")
  return reward as LoyaltyReward
}

// Admin: Update reward
export async function updateReward(id: string, data: Partial<LoyaltyReward>) {
  const supabase = createAdminClient()

  const { data: reward, error } = await supabase
    .from("loyalty_rewards")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating reward:", error)
    throw new Error("Failed to update reward")
  }

  revalidatePath("/admin/loyalty")
  revalidatePath("/dashboard/loyalty")
  return reward as LoyaltyReward
}

// Admin: Delete reward
export async function deleteReward(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("loyalty_rewards").delete().eq("id", id)

  if (error) {
    console.error("Error deleting reward:", error)
    throw new Error("Failed to delete reward")
  }

  revalidatePath("/admin/loyalty")
  revalidatePath("/dashboard/loyalty")
  return { success: true }
}

// User: Redeem reward
export async function redeemReward(userId: string, rewardId: string) {
  const supabase = createAdminClient()

  // Get reward details
  const { data: reward, error: rewardError } = await supabase
    .from("loyalty_rewards")
    .select("*")
    .eq("id", rewardId)
    .single()

  if (rewardError || !reward) {
    throw new Error("Reward not found")
  }

  // Get user points
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("loyalty_points")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    throw new Error("User not found")
  }

  // Check if user has enough points
  if (user.loyalty_points < reward.points_required) {
    throw new Error("Not enough points")
  }

  // Check availability
  if (reward.quantity_available !== null && reward.quantity_available <= 0) {
    throw new Error("Reward no longer available")
  }

  // Deduct points and record transaction
  const { error: updateError } = await supabase
    .from("users")
    .update({ loyalty_points: user.loyalty_points - reward.points_required })
    .eq("id", userId)

  if (updateError) {
    throw new Error("Failed to update points")
  }

  // Record transaction
  await supabase.from("loyalty_transactions").insert({
    user_id: userId,
    points: -reward.points_required,
    description: `Canjeado: ${reward.name}`,
  })

  // Update reward stats
  await supabase
    .from("loyalty_rewards")
    .update({
      times_redeemed: reward.times_redeemed + 1,
      quantity_available: reward.quantity_available !== null ? reward.quantity_available - 1 : null,
    })
    .eq("id", rewardId)

  revalidatePath("/dashboard/loyalty")
  return { success: true }
}
