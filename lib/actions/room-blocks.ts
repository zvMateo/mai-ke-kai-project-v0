"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface RoomBlock {
  id: string
  room_id: string
  bed_id: string | null
  start_date: string
  end_date: string
  reason: string | null
  created_by: string | null
  created_at: string
}

// Get all room blocks
export async function getRoomBlocks(startDate?: string, endDate?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("room_blocks")
    .select(`
      *,
      rooms (name),
      beds (bed_number)
    `)
    .order("start_date")

  if (startDate) {
    query = query.gte("end_date", startDate)
  }

  if (endDate) {
    query = query.lte("start_date", endDate)
  }

  const { data: blocks, error } = await query

  if (error) {
    console.error("Error fetching room blocks:", error)
    throw new Error("Failed to fetch room blocks")
  }

  return blocks
}

// Create room block
export async function createRoomBlock(data: {
  roomId: string
  bedId?: string
  startDate: string
  endDate: string
  reason?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: block, error } = await supabase
    .from("room_blocks")
    .insert({
      room_id: data.roomId,
      bed_id: data.bedId || null,
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason || null,
      created_by: user?.id || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating room block:", error)
    throw new Error("Failed to create room block")
  }

  revalidatePath("/admin/calendar")
  revalidatePath("/admin/rooms")
  return block as RoomBlock
}

// Update room block
export async function updateRoomBlock(
  blockId: string,
  data: Partial<{
    startDate: string
    endDate: string
    reason: string
  }>,
) {
  const supabase = await createClient()

  const updateData: any = {}
  if (data.startDate) updateData.start_date = data.startDate
  if (data.endDate) updateData.end_date = data.endDate
  if (data.reason !== undefined) updateData.reason = data.reason

  const { data: block, error } = await supabase
    .from("room_blocks")
    .update(updateData)
    .eq("id", blockId)
    .select()
    .single()

  if (error) {
    console.error("Error updating room block:", error)
    throw new Error("Failed to update room block")
  }

  revalidatePath("/admin/calendar")
  revalidatePath("/admin/rooms")
  return block as RoomBlock
}

// Delete room block
export async function deleteRoomBlock(blockId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("room_blocks").delete().eq("id", blockId)

  if (error) {
    console.error("Error deleting room block:", error)
    throw new Error("Failed to delete room block")
  }

  revalidatePath("/admin/calendar")
  revalidatePath("/admin/rooms")
  return { success: true }
}
