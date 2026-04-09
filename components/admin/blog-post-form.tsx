"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/image-upload";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { useCreateBlogPost, useUpdateBlogPost } from "@/lib/queries";
import { Loader2, X } from "lucide-react";
// sanitizeHtml no longer needed in form (Tiptap outputs clean HTML)
import type { BlogPost } from "@/types/database";

interface BlogPostFormProps {
  post?: BlogPost;
  mode: "create" | "edit";
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function BlogPostForm({ post, mode }: BlogPostFormProps) {
  const router = useRouter();
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();

  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    cover_image_url: post?.cover_image_url || "",
    author_name: post?.author_name || "Mai Ke Kai Team",
    author_avatar_url: post?.author_avatar_url || "",
    tags: post?.tags || ([] as string[]),
    is_published: post?.is_published ?? false,
    published_at: post?.published_at
      ? post.published_at.slice(0, 16)
      : "",
  });

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: !slugTouched ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, "");
      if (tag && !formData.tags.includes(tag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      content: formData.content || null,
      cover_image_url: formData.cover_image_url || null,
      author_name: formData.author_name,
      author_avatar_url: formData.author_avatar_url || null,
      tags: formData.tags,
      is_published: formData.is_published,
      published_at: formData.is_published
        ? formData.published_at
          ? new Date(formData.published_at).toISOString()
          : null
        : null,
    };

    if (mode === "create") {
      createMutation.mutate(submitData);
    } else if (post) {
      updateMutation.mutate({ id: post.id, ...submitData });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
          {error.message}
        </div>
      )}

      {/* Post Content */}
      <Card>
        <CardHeader>
          <CardTitle>Post Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. 5 Reasons to Learn Surf in Tamarindo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              URL Slug *{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (auto-generated from title)
              </span>
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="e.g. 5-reasons-to-learn-surf-tamarindo"
              required
            />
            {formData.slug && (
              <p className="text-xs text-muted-foreground">
                Public URL: /blog/{formData.slug}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              placeholder="Brief summary shown in blog listing (1-2 sentences)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Body Content — Tiptap WYSIWYG Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Body Content</CardTitle>
          <p className="text-sm text-muted-foreground">
            Use the toolbar above to format your post — no HTML knowledge needed.
          </p>
        </CardHeader>
        <CardContent>
          <TiptapEditor
            value={formData.content}
            onChange={(html) =>
              setFormData((prev) => ({ ...prev, content: html }))
            }
            placeholder="Start writing your post here... Use H2 for section titles, bold for emphasis, and the image button to insert photos."
            minHeight={480}
          />
        </CardContent>
      </Card>

      {/* Cover Image */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={formData.cover_image_url}
            onChange={(url) =>
              setFormData((prev) => ({
                ...prev,
                cover_image_url: Array.isArray(url) ? url[0] ?? "" : url,
              }))
            }
            folder="blog"
          />
        </CardContent>
      </Card>

      {/* Author */}
      <Card>
        <CardHeader>
          <CardTitle>Author</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author_name">Author Name</Label>
            <Input
              id="author_name"
              value={formData.author_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, author_name: e.target.value }))
              }
              placeholder="Mai Ke Kai Team"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author_avatar_url">Author Avatar URL</Label>
            <Input
              id="author_avatar_url"
              value={formData.author_avatar_url}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  author_avatar_url: e.target.value,
                }))
              }
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type a tag and press Enter or comma"
          />
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_published: checked }))
              }
            />
            <Label htmlFor="is_published">
              {formData.is_published ? "Published" : "Draft"}
            </Label>
          </div>
          {formData.is_published && (
            <div className="space-y-2">
              <Label htmlFor="published_at">Publish Date & Time</Label>
              <Input
                id="published_at"
                type="datetime-local"
                value={formData.published_at}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    published_at: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to publish immediately.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Post" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
