"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Star,
  Plus,
  Trash2,
  Pencil,
  GripVertical,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Testimonial } from "@/types/database";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  toggleTestimonialActive,
} from "@/lib/actions/testimonials";

// ─── Star Rating Picker ───────────────────────────────────────────────────────

function StarRatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 focus:outline-none"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Form Dialog ──────────────────────────────────────────────────────────────

interface TestimonialFormData {
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar_url: string;
  is_active: boolean;
  display_order: number;
}

const EMPTY_FORM: TestimonialFormData = {
  name: "",
  location: "",
  rating: 5,
  text: "",
  avatar_url: "",
  is_active: true,
  display_order: 0,
};

interface TestimonialDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (updated: Testimonial[]) => void;
  editing: Testimonial | null;
  nextOrder: number;
}

function TestimonialDialog({
  open,
  onClose,
  onSuccess,
  editing,
  nextOrder,
}: TestimonialDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<TestimonialFormData>(
    editing
      ? {
          name: editing.name,
          location: editing.location ?? "",
          rating: editing.rating,
          text: editing.text,
          avatar_url: editing.avatar_url ?? "",
          is_active: editing.is_active,
          display_order: editing.display_order,
        }
      : { ...EMPTY_FORM, display_order: nextOrder }
  );

  const set = <K extends keyof TestimonialFormData>(
    key: K,
    value: TestimonialFormData[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const buildFormData = () => {
    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("location", form.location);
    fd.set("rating", String(form.rating));
    fd.set("text", form.text);
    fd.set("avatar_url", form.avatar_url);
    fd.set("is_active", String(form.is_active));
    fd.set("display_order", String(form.display_order));
    return fd;
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Name and review text are required");
      return;
    }

    startTransition(async () => {
      const result = editing
        ? await updateTestimonial(editing.id, buildFormData())
        : await createTestimonial(buildFormData());

      if (result.success) {
        toast.success(editing ? "Testimonial updated" : "Testimonial added");
        onClose();
        // Trigger parent reload
        onSuccess([]);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            {editing ? "Edit Testimonial" : "Add Testimonial"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Avatar */}
          <div>
            <Label className="mb-2 block">Avatar (optional)</Label>
            <ImageUpload
              value={form.avatar_url}
              onChange={(v) =>
                set("avatar_url", typeof v === "string" ? v : v[0] ?? "")
              }
              folder="mai-ke-kai/testimonials"
            />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="t-name" className="mb-1.5 block">
              Guest Name *
            </Label>
            <Input
              id="t-name"
              placeholder="e.g. Sarah M."
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="t-location" className="mb-1.5 block">
              Location
            </Label>
            <Input
              id="t-location"
              placeholder="e.g. Australia"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>

          {/* Rating */}
          <div>
            <Label className="mb-1.5 block">Rating</Label>
            <StarRatingPicker
              value={form.rating}
              onChange={(v) => set("rating", v)}
            />
          </div>

          {/* Review text */}
          <div>
            <Label htmlFor="t-text" className="mb-1.5 block">
              Review Text *
            </Label>
            <Textarea
              id="t-text"
              placeholder="What did the guest say about their experience?"
              rows={4}
              value={form.text}
              onChange={(e) => set("text", e.target.value)}
            />
          </div>

          {/* Display order */}
          <div>
            <Label htmlFor="t-order" className="mb-1.5 block">
              Display Order
            </Label>
            <Input
              id="t-order"
              type="number"
              min={0}
              value={form.display_order}
              onChange={(e) => set("display_order", Number(e.target.value))}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-sm">Show on website</p>
              <p className="text-muted-foreground text-xs">
                Active testimonials appear on the landing and packages pages
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => set("is_active", v)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? "Saving..." : editing ? "Save Changes" : "Add Testimonial"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Manager ─────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TestimonialsManagerClient({
  initialTestimonials,
}: {
  initialTestimonials: Testimonial[];
}) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reload = () => window.location.reload();

  const handleToggleActive = (item: Testimonial) => {
    const newVal = !item.is_active;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_active: newVal } : i))
    );
    startTransition(async () => {
      const result = await toggleTestimonialActive(item.id, newVal);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update");
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_active: !newVal } : i))
        );
      } else {
        toast.success(newVal ? "Testimonial visible on website" : "Testimonial hidden");
      }
    });
  };

  const handleDelete = (item: Testimonial) => {
    if (
      !confirm(
        `Hide "${item.name}"'s testimonial? It won't appear on the website.`
      )
    )
      return;
    startTransition(async () => {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      const result = await deleteTestimonial(item.id);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete");
        setItems(initialTestimonials);
      } else {
        toast.success("Testimonial removed");
      }
    });
  };

  // Drag-to-reorder
  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const newItems = [...items];
    const fromIdx = newItems.findIndex((i) => i.id === draggedId);
    const toIdx = newItems.findIndex((i) => i.id === targetId);
    const [moved] = newItems.splice(fromIdx, 1);
    newItems.splice(toIdx, 0, moved);
    setItems(newItems);
    setDraggedId(null);

    startTransition(async () => {
      const result = await reorderTestimonials(newItems.map((i) => i.id));
      if (!result.success) {
        toast.error("Failed to save order");
        setItems(initialTestimonials);
      } else {
        toast.success("Order saved");
      }
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">
            Testimonials Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            {items.length} total ·{" "}
            {items.filter((i) => i.is_active).length} visible on website
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setShowDialog(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </Button>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium mb-4">
            No testimonials yet
          </p>
          <Button
            onClick={() => setShowDialog(true)}
            variant="outline"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add your first testimonial
          </Button>
        </div>
      )}

      {/* List */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(item.id)}
              className={`flex items-start gap-4 p-5 rounded-2xl border-2 bg-card transition-all ${
                item.is_active
                  ? "border-border hover:border-primary/30"
                  : "border-dashed border-border opacity-60"
              } ${draggedId === item.id ? "opacity-40 scale-[0.98]" : ""}`}
            >
              {/* Drag handle */}
              <div className="mt-1 cursor-grab text-muted-foreground/40 hover:text-muted-foreground">
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                {item.avatar_url ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={item.avatar_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {getInitials(item.name)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  {item.location && (
                    <Badge variant="outline" className="text-xs">
                      {item.location}
                    </Badge>
                  )}
                  {!item.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Hidden
                    </Badge>
                  )}
                </div>
                {/* Stars */}
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < item.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  title={item.is_active ? "Hide from website" : "Show on website"}
                  onClick={() => handleToggleActive(item)}
                  disabled={isPending}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {item.is_active ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  title="Edit testimonial"
                  onClick={() => {
                    setEditing(item);
                    setShowDialog(true);
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  title="Delete testimonial"
                  onClick={() => handleDelete(item)}
                  disabled={isPending}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drag tip */}
      {items.length > 1 && (
        <p className="text-xs text-muted-foreground text-center mt-6">
          Drag the handle to reorder testimonials
        </p>
      )}

      {/* Dialog */}
      <TestimonialDialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
          setEditing(null);
        }}
        onSuccess={reload}
        editing={editing}
        nextOrder={items.length + 1}
      />
    </>
  );
}
