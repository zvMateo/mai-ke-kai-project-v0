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
import { useCreatePackage, useUpdatePackage } from "@/lib/queries"
import type { SurfPackage, RoomType } from "@/types/database"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PackageFormProps {
  pkg?: SurfPackage
  mode: "create" | "edit"
}

export function PackageForm({ pkg, mode }: PackageFormProps) {
  const router = useRouter()

  // React Query mutations with automatic cache invalidation and navigation
  const createMutation = useCreatePackage()
  const updateMutation = useUpdatePackage()

  const [formData, setFormData] = useState<{
    name: string
    tagline: string
    description: string
    nights: number
    surf_lessons: number
    room_type: RoomType
    includes: string[]
    price: number
    original_price: number
    image_url: string
    is_popular: boolean
    is_for_two: boolean
    is_active: boolean
    display_order: number
  }>({
    name: pkg?.name || "",
    tagline: pkg?.tagline || "",
    description: pkg?.description || "",
    nights: pkg?.nights || 1,
    surf_lessons: pkg?.surf_lessons || 0,
    room_type: (pkg?.room_type as RoomType) || "dorm",
    includes: pkg?.includes || [],
    price: pkg?.price || 0,
    original_price: pkg?.original_price || 0,
    image_url: pkg?.image_url || "",
    is_popular: pkg?.is_popular ?? false,
    is_for_two: pkg?.is_for_two ?? false,
    is_active: pkg?.is_active ?? true,
    display_order: pkg?.display_order || 0,
  })

  const [newInclude, setNewInclude] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      name: formData.name,
      tagline: formData.tagline || null,
      description: formData.description || null,
      nights: formData.nights,
      surf_lessons: formData.surf_lessons,
      room_type: formData.room_type,
      includes: formData.includes,
      price: formData.price,
      original_price: formData.original_price || null,
      image_url: formData.image_url || null,
      is_popular: formData.is_popular,
      is_for_two: formData.is_for_two,
      is_active: formData.is_active,
      display_order: formData.display_order,
    }

    if (mode === "create") {
      createMutation.mutate(submitData)
    } else if (pkg) {
      updateMutation.mutate({ id: pkg.id, ...submitData })
    }
  }

  const addInclude = () => {
    if (newInclude.trim() && !formData.includes.includes(newInclude.trim())) {
      setFormData({
        ...formData,
        includes: [...formData.includes, newInclude.trim()],
      })
      setNewInclude("")
    }
  }

  const removeInclude = (item: string) => {
    setFormData({
      ...formData,
      includes: formData.includes.filter((i) => i !== item),
    })
  }

  // Combine loading states from both mutations
  const isLoading = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error || updateMutation.error

  const savings = formData.original_price ? formData.original_price - formData.price : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Surf Explorer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g., El más popular"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nights">Nights *</Label>
              <Input
                id="nights"
                type="number"
                min="1"
                value={formData.nights}
                onChange={(e) => setFormData({ ...formData, nights: Number.parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surf_lessons">Surf Lessons Included</Label>
              <Input
                id="surf_lessons"
                type="number"
                min="0"
                value={formData.surf_lessons}
                onChange={(e) => setFormData({ ...formData, surf_lessons: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room_type">Room Type *</Label>
              <Select
                value={formData.room_type}
                onValueChange={(value) => setFormData({ ...formData, room_type: value as RoomType })}
              >
                <SelectTrigger id="room_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dorm">Dormitory</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="family">Family/Group</SelectItem>
                </SelectContent>
              </Select>
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
              placeholder="Describe the package..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Sale Price (USD) *</Label>
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
              <Label htmlFor="original_price">Original Price (USD)</Label>
              <Input
                id="original_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.original_price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    original_price: e.target.value ? Number.parseFloat(e.target.value) : 0,
                  })
                }
                placeholder="For showing discount"
              />
            </div>

            <div className="space-y-2">
              <Label>Savings</Label>
              <div className="h-10 flex items-center">
                {savings > 0 ? (
                  <Badge className="bg-green-100 text-green-800">Ahorras ${savings}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Set original price to show savings</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newInclude}
              onChange={(e) => setNewInclude(e.target.value)}
              placeholder="Add item (e.g., Desayuno diario)"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addInclude()
                }
              }}
            />
            <Button type="button" onClick={addInclude} variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <ul className="space-y-2">
            {formData.includes.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="text-sm">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInclude(item)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>

          {formData.includes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items added yet. Add what's included in this package.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            folder="packages"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url as string })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-muted-foreground">Package is visible to guests</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_popular">Mark as Popular</Label>
              <p className="text-sm text-muted-foreground">Shows "Más Popular" badge</p>
            </div>
            <Switch
              id="is_popular"
              checked={formData.is_popular}
              onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_for_two">For Two People</Label>
              <p className="text-sm text-muted-foreground">Shows "Para 2" badge and pricing per couple</p>
            </div>
            <Switch
              id="is_for_two"
              checked={formData.is_for_two}
              onCheckedChange={(checked) => setFormData({ ...formData, is_for_two: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error.message}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : mode === "create" ? "Create Package" : "Update Package"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
