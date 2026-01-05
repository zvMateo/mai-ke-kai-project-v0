import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Award, Gift, Waves, Star, Coffee, Car, Ship, Package, Pencil } from "lucide-react"
import Link from "next/link"
import { RewardDeleteButton } from "@/components/admin/reward-delete-button"

async function getLoyaltyData() {
  const supabase = await createClient()

  const { data: rewards } = await supabase.from("loyalty_rewards").select("*").order("display_order")

  // Get total points issued and redeemed
  const { data: transactions } = await supabase.from("loyalty_transactions").select("points")

  const totalIssued = transactions?.filter((t) => t.points > 0).reduce((sum, t) => sum + t.points, 0) || 0
  const totalRedeemed = transactions?.filter((t) => t.points < 0).reduce((sum, t) => sum + Math.abs(t.points), 0) || 0

  return {
    rewards: rewards || [],
    stats: {
      totalIssued,
      totalRedeemed,
      totalRewards: rewards?.length || 0,
    },
  }
}

const categoryIcons: Record<string, typeof Waves> = {
  surf: Waves,
  accommodation: Star,
  food: Coffee,
  transport: Car,
  tour: Ship,
  other: Package,
}

const categoryColors: Record<string, string> = {
  surf: "bg-blue-100 text-blue-800",
  accommodation: "bg-purple-100 text-purple-800",
  food: "bg-green-100 text-green-800",
  transport: "bg-yellow-100 text-yellow-800",
  tour: "bg-cyan-100 text-cyan-800",
  other: "bg-gray-100 text-gray-800",
}

export default async function LoyaltyAdminPage() {
  const { rewards, stats } = await getLoyaltyData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Loyalty Program</h1>
          <p className="text-muted-foreground">Manage rewards and track points</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/loyalty/new">
            <Plus className="w-4 h-4" />
            Add Reward
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points Issued</p>
                <p className="text-2xl font-bold">{stats.totalIssued.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points Redeemed</p>
                <p className="text-2xl font-bold">{stats.totalRedeemed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Rewards</p>
                <p className="text-2xl font-bold">{stats.totalRewards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Catalog</CardTitle>
          <CardDescription>Configure rewards that guests can redeem with their points</CardDescription>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No rewards configured yet</p>
              <Button asChild>
                <Link href="/admin/loyalty/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Reward
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reward</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Points</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-center">Redeemed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward) => {
                  const Icon = categoryIcons[reward.category] || Package

                  return (
                    <TableRow key={reward.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[reward.category]}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{reward.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{reward.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {reward.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold">{reward.points_required}</TableCell>
                      <TableCell className="text-center">
                        {reward.quantity_available === null ? (
                          <span className="text-muted-foreground">Unlimited</span>
                        ) : (
                          reward.quantity_available
                        )}
                      </TableCell>
                      <TableCell className="text-center">{reward.times_redeemed}</TableCell>
                      <TableCell>
                        {reward.is_active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm" className="bg-transparent">
                            <Link href={`/admin/loyalty/${reward.id}/edit`}>
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                          <RewardDeleteButton rewardId={reward.id} rewardName={reward.name} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tier Info */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Tiers</CardTitle>
          <CardDescription>Points thresholds for each tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <h3 className="font-semibold text-orange-800">Bronze</h3>
              <p className="text-sm text-orange-600">0 - 499 points</p>
              <p className="text-xs text-muted-foreground mt-2">Starting tier for all members</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-semibold text-gray-800">Silver</h3>
              <p className="text-sm text-gray-600">500 - 1,999 points</p>
              <p className="text-xs text-muted-foreground mt-2">Unlocks basic rewards</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <h3 className="font-semibold text-yellow-800">Gold</h3>
              <p className="text-sm text-yellow-600">2,000+ points</p>
              <p className="text-xs text-muted-foreground mt-2">Premium benefits & priority booking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
