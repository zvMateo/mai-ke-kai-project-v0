import { createClient } from "@/lib/supabase/server"
import { RewardForm } from "@/components/admin/reward-form"
import { notFound } from "next/navigation"

interface EditRewardPageProps {
  params: Promise<{ id: string }>
}

export default async function EditRewardPage({ params }: EditRewardPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: reward, error } = await supabase.from("loyalty_rewards").select("*").eq("id", id).single()

  if (error || !reward) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Edit Reward</h1>
        <p className="text-muted-foreground">Update reward details</p>
      </div>

      <RewardForm reward={reward} mode="edit" />
    </div>
  )
}
