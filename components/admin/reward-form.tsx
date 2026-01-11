"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useCreateReward, useUpdateReward } from "@/lib/queries"
import type { LoyaltyReward } from "@/lib/actions/loyalty"

interface RewardFormProps {
  reward?: LoyaltyReward
  mode: "create" | "edit"
}

export function RewardForm({ reward, mode }: RewardFormProps) {
  const router = useRouter()
  const createMutation = useCreateReward()
  const updateMutation = useUpdateReward()

  const [formData, setFormData] = useState<{
    name: string
    description: string
    points_required: number
    category: LoyaltyReward["category"]
    icon: string
    is_active: boolean
    quantity_available: number | null
    display_order: number
  }>({
    name: reward?.name || "",
    description: reward?.description || "",
    points_required: reward?.points_required || 100,
    category: reward?.category || "other",
    icon: reward?.icon || "gift",
    is_active: reward?.is_active ?? true,
    quantity_available: reward?.quantity_available ?? null,
    display_order: reward?.display_order || 0,
  })

  const mutation = mode === "create" ? createMutation : updateMutation
  const loading = mutation.isPending
  const error = mutation.error?.message || null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      name: formData.name,
      description: formData.description || null,
      points_required: formData.points_required,
      category: formData.category,
      icon: formData.icon,
      is_active: formData.is_active,
      quantity_available: formData.quantity_available,
      display_order: formData.display_order,
    }

    if (mode === "create") {
      createMutation.mutate(submitData)
    } else if (reward) {
      updateMutation.mutate({ id: reward.id, ...submitData })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reward Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Reward Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Free Surf Lesson"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points_required">Points Required *</Label>
              <Input
                id="points_required"
                type="number"
                min="1"
                value={formData.points_required}
                onChange={(e) => setFormData({ ...formData, points_required: Number.parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as LoyaltyReward["category"] })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surf">Surf</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="food">Food & Drink</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="tour">Tour</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger id="icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waves">Waves (Surf)</SelectItem>
                  <SelectItem value="star">Star (Accommodation)</SelectItem>
                  <SelectItem value="coffee">Coffee (Food)</SelectItem>
                  <SelectItem value="car">Car (Transport)</SelectItem>
                  <SelectItem value="ship">Ship (Tour)</SelectItem>
                  <SelectItem value="gift">Gift (Other)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Available</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity_available ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity_available: e.target.value ? Number.parseInt(e.target.value) : null,
                  })
                }
                placeholder="Leave empty for unlimited"
              />
              <p className="text-xs text-muted-foreground">Leave empty for unlimited redemptions</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what the guest receives..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-muted-foreground">Reward is visible to guests</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "create" ? "Create Reward" : "Update Reward"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
