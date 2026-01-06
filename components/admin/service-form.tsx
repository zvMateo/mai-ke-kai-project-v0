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
import { ImageUpload } from "@/components/admin/image-upload"
import { createService, updateService } from "@/lib/actions/services"
import type { Service, ServiceCategory } from "@/types/database"

interface ServiceFormProps {
  service?: Service
  mode: "create" | "edit"
}

export function ServiceForm({ service, mode }: ServiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<{
    name: string
    description: string
    category: ServiceCategory
    price: number
    duration_hours: number | null
    max_participants: number | null
    image_url: string
    is_active: boolean
  }>({
    name: service?.name || "",
    description: service?.description || "",
    category: (service?.category as ServiceCategory) || "surf",
    price: service?.price || 0,
    duration_hours: service?.duration_hours || null,
    max_participants: service?.max_participants || null,
    image_url: service?.image_url || "",
    is_active: service?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        duration_hours: formData.duration_hours,
        max_participants: formData.max_participants,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
      }

      if (mode === "create") {
        await createService(submitData)
      } else if (service) {
        await updateService(service.id, submitData)
      }
      router.push("/admin/services")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Surf Lesson Beginner"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as ServiceCategory })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surf">Surf</SelectItem>
                  <SelectItem value="tour">Tour</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                step="0.5"
                value={formData.duration_hours || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_hours: e.target.value ? Number.parseFloat(e.target.value) : null,
                  })
                }
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                min="1"
                value={formData.max_participants || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_participants: e.target.value ? Number.parseInt(e.target.value) : null,
                  })
                }
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2 flex items-center gap-4 pt-6">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active (visible to guests)</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the service..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            folder="services"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url as string })}
          />
        </CardContent>
      </Card>

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "create" ? "Create Service" : "Update Service"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
