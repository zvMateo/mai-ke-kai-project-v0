import { RewardForm } from "@/components/admin/reward-form"

export default function NewRewardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Add New Reward</h1>
        <p className="text-muted-foreground">Create a new reward for the loyalty program</p>
      </div>

      <RewardForm mode="create" />
    </div>
  )
}
