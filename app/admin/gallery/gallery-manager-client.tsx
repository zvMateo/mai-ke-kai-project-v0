"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Star,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  ImageIcon,
} from "lucide-react";
import type { GalleryItem, GalleryCategory } from "@/types/database";
import {
  createGalleryItem,
  deleteGalleryItem,
  toggleGalleryItemActive,
  toggleGalleryItemFeatured,
  updateGalleryItem,
} from "@/lib/actions/gallery";

const CATEGORIES: { value: GalleryCategory; label: string }[] = [
  { value: "surf", label: "🏄 Surf" },
  { value: "rooms", label: "🛏️ Rooms" },
  { value: "community", label: "👥 Community" },
  { value: "nature", label: "🌿 Nature" },
  { value: "lifestyle", label: "✨ Lifestyle" },
  { value: "general", label: "📷 General" },
];

interface AddPhotoDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function AddPhotoDialog({ open, onClose, onSuccess }: AddPhotoDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "surf" as GalleryCategory,
    is_featured: false,
  });

  const handleSubmit = () => {
    if (!imageUrl) {
      toast.error("Please upload an image first");
      return;
    }
    startTransition(async () => {
      const result = await createGalleryItem({
        image_url: imageUrl,
        title: form.title || undefined,
        description: form.description || undefined,
        category: form.category,
        is_featured: form.is_featured,
      });
      if (result.success) {
        toast.success("Photo added to gallery!");
        setImageUrl("");
        setForm({ title: "", description: "", category: "surf", is_featured: false });
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Failed to add photo");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Add Photo to Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Image upload */}
          <div>
            <Label className="mb-2 block">Photo *</Label>
            <ImageUpload
              value={imageUrl}
              onChange={(v) => setImageUrl(typeof v === "string" ? v : v[0] || "")}
              folder="mai-ke-kai/gallery"
            />
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="mb-1.5 block">Title (optional)</Label>
            <Input
              id="title"
              placeholder="e.g. Surf lesson at sunrise"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="desc" className="mb-1.5 block">Description (optional)</Label>
            <Textarea
              id="desc"
              placeholder="Short caption..."
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Category */}
          <div>
            <Label className="mb-1.5 block">Category *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v as GalleryCategory }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Featured toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-sm">Featured Photo</p>
              <p className="text-muted-foreground text-xs">
                Featured photos appear first and larger on the gallery
              </p>
            </div>
            <Switch
              checked={form.is_featured}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !imageUrl} className="flex-1">
              {isPending ? "Saving..." : "Add Photo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────────────────────────────
   Main Gallery Manager
────────────────────────────────────────────── */
export function GalleryManagerClient({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = activeFilter === "all"
    ? items
    : items.filter((i) => i.category === activeFilter);

  const refreshItems = () => {
    // Re-fetch optimistically — server revalidates path, Next will refresh
    window.location.reload();
  };

  const handleToggleActive = (item: GalleryItem) => {
    startTransition(async () => {
      const newVal = !item.is_active;
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: newVal } : i))
      );
      const result = await toggleGalleryItemActive(item.id, newVal);
      if (!result.success) {
        toast.error(result.error || "Failed to update");
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_active: !newVal } : i))
        );
      } else {
        toast.success(newVal ? "Photo shown on website" : "Photo hidden from website");
      }
    });
  };

  const handleToggleFeatured = (item: GalleryItem) => {
    startTransition(async () => {
      const newVal = !item.is_featured;
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_featured: newVal } : i))
      );
      const result = await toggleGalleryItemFeatured(item.id, newVal);
      if (!result.success) {
        toast.error(result.error || "Failed to update");
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_featured: !newVal } : i))
        );
      } else {
        toast.success(newVal ? "Marked as featured ⭐" : "Removed from featured");
      }
    });
  };

  const handleDelete = (item: GalleryItem) => {
    if (!confirm(`Delete "${item.title || "this photo"}"? This cannot be undone.`)) return;
    startTransition(async () => {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      const result = await deleteGalleryItem(item.id);
      if (!result.success) {
        toast.error(result.error || "Failed to delete");
        setItems(initialItems); // rollback
      } else {
        toast.success("Photo deleted");
      }
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gallery Manager</h1>
          <p className="text-muted-foreground mt-1">
            {items.length} photos · {items.filter((i) => i.is_featured).length} featured · {items.filter((i) => i.is_active).length} visible
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Photo
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["all", "surf", "rooms", "community", "nature", "lifestyle", "general"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              activeFilter === cat
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <ImageIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium mb-4">No photos yet</p>
          <Button onClick={() => setShowAddDialog(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add your first photo
          </Button>
        </div>
      )}

      {/* Photo grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all ${
                item.is_featured
                  ? "border-amber-400 shadow-lg shadow-amber-100"
                  : item.is_active
                  ? "border-transparent hover:border-border"
                  : "border-dashed border-border opacity-60"
              }`}
            >
              {/* Image */}
              <div className="relative aspect-square">
                <Image
                  src={item.image_url}
                  alt={item.title || "Gallery"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Status badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {item.is_featured && (
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      ★ Featured
                    </span>
                  )}
                  {!item.is_active && (
                    <span className="bg-zinc-800/80 text-zinc-200 text-xs px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>

                {/* Action overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* Toggle featured */}
                  <button
                    title={item.is_featured ? "Remove featured" : "Mark as featured"}
                    onClick={() => handleToggleFeatured(item)}
                    className={`p-2 rounded-full transition-colors ${
                      item.is_featured
                        ? "bg-amber-400 text-amber-900"
                        : "bg-white/20 text-white hover:bg-amber-400 hover:text-amber-900"
                    }`}
                    disabled={isPending}
                  >
                    <Star className="w-4 h-4" />
                  </button>

                  {/* Toggle visible */}
                  <button
                    title={item.is_active ? "Hide from website" : "Show on website"}
                    onClick={() => handleToggleActive(item)}
                    className="bg-white/20 text-white hover:bg-white/40 p-2 rounded-full transition-colors"
                    disabled={isPending}
                  >
                    {item.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    title="Delete photo"
                    onClick={() => handleDelete(item)}
                    className="bg-red-500/80 text-white hover:bg-red-600 p-2 rounded-full transition-colors"
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Footer info */}
              <div className="p-3 bg-card">
                <p className="text-sm font-medium truncate text-foreground">
                  {item.title || <span className="text-muted-foreground italic">No title</span>}
                </p>
                <Badge variant="outline" className="text-xs mt-1 capitalize">
                  {item.category}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <AddPhotoDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={refreshItems}
      />
    </>
  );
}
