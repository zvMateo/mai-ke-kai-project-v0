"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { createRoom, updateRoom } from "@/lib/actions/rooms";
import type { Room, RoomType, SellUnit } from "@/types/database";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RoomFormProps {
  room?: Room;
  mode: "create" | "edit";
}

export function RoomForm({ room, mode }: RoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: room?.name || "",
    type: room?.type || "dorm",
    capacity: room?.capacity || 1,
    sell_unit: room?.sell_unit || "bed",
    description: room?.description || "",
    main_image: room?.main_image || "",
    images: room?.images || [],
    amenities: room?.amenities || [],
  });

  const [newAmenity, setNewAmenity] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "create") {
        await createRoom(formData);
      } else if (room) {
        await updateRoom(room.id, formData);
      }
      router.push("/admin/rooms");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save room");
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      });
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a !== amenity),
    });
  };

  const addGalleryImage = (url: string) => {
    setFormData({
      ...formData,
      images: [...formData.images, url],
    });
  };

  const removeGalleryImage = (url: string) => {
    setFormData({
      ...formData,
      images: formData.images.filter((img) => img !== url),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Dorm Mixto 8 Beds"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Room Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as RoomType })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dorm">Dormitory</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="family">Family/Group</SelectItem>
                  <SelectItem value="female">Female Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: Number.parseInt(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sell_unit">Sell Unit *</Label>
              <Select
                value={formData.sell_unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, sell_unit: value as SellUnit })
                }
              >
                <SelectTrigger id="sell_unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bed">Per Bed</SelectItem>
                  <SelectItem value="room">Per Room</SelectItem>
                  <SelectItem value="group">Per Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the room..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Main Image</Label>
            <ImageUpload
              folder="rooms"
              value={formData.main_image}
              onChange={(url) =>
                setFormData({ ...formData, main_image: url as string })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((url) => (
                <div key={url} className="relative group">
                  <img
                    src={url || "/placeholder.svg"}
                    alt="Gallery"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeGalleryImage(url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <ImageUpload
                folder="rooms"
                value={formData.images}
                onChange={(urls) =>
                  setFormData({ ...formData, images: urls as string[] })
                }
                multiple
                maxFiles={8}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add amenity..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAmenity();
                }
              }}
            />
            <Button type="button" onClick={addAmenity} variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity) => (
              <Badge key={amenity} variant="secondary" className="gap-1">
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Create Room"
            : "Update Room"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
