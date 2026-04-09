"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  Users,
  Clock,
  FileText,
  GripVertical,
} from "lucide-react";
import type { AboutTeamMember, AboutTimelineItem } from "@/types/database";
import {
  upsertTeamMember,
  deleteTeamMember,
  upsertTimelineItem,
  deleteTimelineItem,
  updateSiteContent,
} from "@/lib/actions/about";

// ─── Team Dialog ──────────────────────────────────────────────────────────────

interface TeamDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editing: AboutTeamMember | null;
  nextOrder: number;
}

function TeamDialog({ open, onClose, onSuccess, editing, nextOrder }: TeamDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    role: editing?.role ?? "",
    bio: editing?.bio ?? "",
    avatar_url: editing?.avatar_url ?? "",
    display_order: editing?.display_order ?? nextOrder,
    is_active: editing?.is_active ?? true,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.role.trim()) {
      toast.error("Name and role are required");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      if (editing) fd.set("id", editing.id);
      fd.set("name", form.name);
      fd.set("role", form.role);
      fd.set("bio", form.bio);
      fd.set("avatar_url", form.avatar_url);
      fd.set("display_order", String(form.display_order));
      fd.set("is_active", String(form.is_active));

      const result = await upsertTeamMember(fd);
      if (result.success) {
        toast.success(editing ? "Team member updated" : "Team member added");
        onClose();
        onSuccess();
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
            <Users className="w-5 h-5 text-primary" />
            {editing ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div>
            <Label className="mb-2 block">Photo (optional)</Label>
            <ImageUpload
              value={form.avatar_url}
              onChange={(v) =>
                set("avatar_url", typeof v === "string" ? v : v[0] ?? "")
              }
              folder="mai-ke-kai/team"
            />
          </div>

          <div>
            <Label htmlFor="tm-name" className="mb-1.5 block">Name *</Label>
            <Input
              id="tm-name"
              placeholder="e.g. The Founders"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tm-role" className="mb-1.5 block">Role *</Label>
            <Input
              id="tm-role"
              placeholder="e.g. Surf & Hospitality"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tm-bio" className="mb-1.5 block">Bio</Label>
            <Textarea
              id="tm-bio"
              placeholder="Short bio..."
              rows={3}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tm-order" className="mb-1.5 block">Display Order</Label>
            <Input
              id="tm-order"
              type="number"
              min={0}
              value={form.display_order}
              onChange={(e) => set("display_order", Number(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-sm">Active</p>
              <p className="text-muted-foreground text-xs">Show on the About page</p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => set("is_active", v)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
              {isPending ? "Saving..." : editing ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Timeline Dialog ──────────────────────────────────────────────────────────

interface TimelineDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editing: AboutTimelineItem | null;
  nextOrder: number;
}

function TimelineDialog({ open, onClose, onSuccess, editing, nextOrder }: TimelineDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    year: editing?.year ?? "",
    title: editing?.title ?? "",
    description: editing?.description ?? "",
    display_order: editing?.display_order ?? nextOrder,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.year.trim() || !form.title.trim() || !form.description.trim()) {
      toast.error("Year, title, and description are required");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      if (editing) fd.set("id", editing.id);
      fd.set("year", form.year);
      fd.set("title", form.title);
      fd.set("description", form.description);
      fd.set("display_order", String(form.display_order));

      const result = await upsertTimelineItem(fd);
      if (result.success) {
        toast.success(editing ? "Timeline item updated" : "Timeline item added");
        onClose();
        onSuccess();
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {editing ? "Edit Timeline Item" : "Add Timeline Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div>
            <Label htmlFor="tl-year" className="mb-1.5 block">Year *</Label>
            <Input
              id="tl-year"
              placeholder="e.g. 2021"
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tl-title" className="mb-1.5 block">Title *</Label>
            <Input
              id="tl-title"
              placeholder="e.g. First Guests"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tl-desc" className="mb-1.5 block">Description *</Label>
            <Textarea
              id="tl-desc"
              placeholder="What happened this year?"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tl-order" className="mb-1.5 block">Display Order</Label>
            <Input
              id="tl-order"
              type="number"
              min={0}
              value={form.display_order}
              onChange={(e) => set("display_order", Number(e.target.value))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
              {isPending ? "Saving..." : editing ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Team Tab ─────────────────────────────────────────────────────────────────

function TeamTab({ initialTeam }: { initialTeam: AboutTeamMember[] }) {
  const [items, setItems] = useState<AboutTeamMember[]>(initialTeam);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<AboutTeamMember | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reload = () => window.location.reload();

  const handleDelete = (item: AboutTeamMember) => {
    if (!confirm(`Remove "${item.name}" from the team?`)) return;
    startTransition(async () => {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      const result = await deleteTeamMember(item.id);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete");
        setItems(initialTeam);
      } else {
        toast.success("Team member removed");
      }
    });
  };

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
    toast.success("Order updated — changes apply after saving individual items");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground text-sm">{items.length} team members</p>
        <Button onClick={() => { setEditing(null); setShowDialog(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No team members yet</p>
          <Button onClick={() => setShowDialog(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add your first team member
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {items.map((member) => (
          <div
            key={member.id}
            draggable
            onDragStart={() => setDraggedId(member.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(member.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border bg-card transition-all hover:border-primary/30 ${
              draggedId === member.id ? "opacity-40" : ""
            }`}
          >
            <div className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground">
              <GripVertical className="w-5 h-5" />
            </div>

            {/* Avatar */}
            {member.avatar_url ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image src={member.avatar_url} alt={member.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                {member.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{member.name}</p>
              <p className="text-sm text-primary">{member.role}</p>
              {member.bio && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{member.bio}</p>
              )}
            </div>

            {!member.is_active && (
              <Badge variant="secondary" className="text-xs">Hidden</Badge>
            )}

            <div className="flex gap-1">
              <button
                onClick={() => { setEditing(member); setShowDialog(true); }}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(member)}
                disabled={isPending}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <TeamDialog
        open={showDialog}
        onClose={() => { setShowDialog(false); setEditing(null); }}
        onSuccess={reload}
        editing={editing}
        nextOrder={items.length + 1}
      />
    </>
  );
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab({ initialTimeline }: { initialTimeline: AboutTimelineItem[] }) {
  const [items, setItems] = useState<AboutTimelineItem[]>(initialTimeline);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<AboutTimelineItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const reload = () => window.location.reload();

  const handleDelete = (item: AboutTimelineItem) => {
    if (!confirm(`Delete "${item.year} — ${item.title}"?`)) return;
    startTransition(async () => {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      const result = await deleteTimelineItem(item.id);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete");
        setItems(initialTimeline);
      } else {
        toast.success("Timeline item deleted");
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground text-sm">{items.length} timeline items</p>
        <Button onClick={() => { setEditing(null); setShowDialog(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No timeline items yet</p>
          <Button onClick={() => setShowDialog(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add your first milestone
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 p-4 rounded-2xl border bg-card hover:border-primary/30 transition-all"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="font-heading font-bold text-primary text-sm text-center leading-tight">
                {item.year}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {item.description}
              </p>
            </div>

            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => { setEditing(item); setShowDialog(true); }}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
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

      <TimelineDialog
        open={showDialog}
        onClose={() => { setShowDialog(false); setEditing(null); }}
        onSuccess={reload}
        editing={editing}
        nextOrder={items.length + 1}
      />
    </>
  );
}

// ─── Content Tab ──────────────────────────────────────────────────────────────

function ContentTab({ initialSiteContent }: { initialSiteContent: Record<string, string> }) {
  const [isPending, startTransition] = useTransition();
  const [quote, setQuote] = useState(
    initialSiteContent["about_quote"] ?? "The ocean is calling — and we must go."
  );
  const [quoteAuthor, setQuoteAuthor] = useState(
    initialSiteContent["about_quote_author"] ?? "Pura Vida, Costa Rica"
  );
  const [videoId, setVideoId] = useState(
    initialSiteContent["about_video_id"] ?? ""
  );

  const handleSave = () => {
    startTransition(async () => {
      const tasks = [
        updateSiteContent("about_quote", quote),
        updateSiteContent("about_quote_author", quoteAuthor),
        updateSiteContent("about_video_id", videoId),
      ];
      const results = await Promise.all(tasks);
      if (results.every((r) => r.success)) {
        toast.success("Content saved");
      } else {
        toast.error("Failed to save content");
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Label htmlFor="sc-video-id" className="mb-1.5 block">
          YouTube Video ID
        </Label>
        <Input
          id="sc-video-id"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value.trim())}
          placeholder="dQw4w9WgXcQ"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Solo el ID del video de YouTube (ej: dQw4w9WgXcQ). Si está vacío, la sección de video no se muestra.
        </p>
      </div>

      <div>
        <Label htmlFor="sc-quote" className="mb-1.5 block">
          Beach Photo Quote
        </Label>
        <Textarea
          id="sc-quote"
          rows={3}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Quote text shown over the beach photo divider"
        />
      </div>

      <div>
        <Label htmlFor="sc-author" className="mb-1.5 block">
          Quote Author / Attribution
        </Label>
        <Input
          id="sc-author"
          value={quoteAuthor}
          onChange={(e) => setQuoteAuthor(e.target.value)}
          placeholder="e.g. Pura Vida, Costa Rica"
        />
      </div>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving..." : "Save Content"}
      </Button>
    </div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

interface Props {
  initialTeam: AboutTeamMember[];
  initialTimeline: AboutTimelineItem[];
  initialSiteContent: Record<string, string>;
}

export function AboutManagerClient({
  initialTeam,
  initialTimeline,
  initialSiteContent,
}: Props) {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">About Us Editor</h1>
        <p className="text-muted-foreground mt-1">
          Manage team members, timeline milestones, and page content
        </p>
      </div>

      <Tabs defaultValue="team">
        <TabsList className="mb-6">
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="w-4 h-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <FileText className="w-4 h-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          <TeamTab initialTeam={initialTeam} />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab initialTimeline={initialTimeline} />
        </TabsContent>

        <TabsContent value="content">
          <ContentTab initialSiteContent={initialSiteContent} />
        </TabsContent>
      </Tabs>
    </>
  );
}
