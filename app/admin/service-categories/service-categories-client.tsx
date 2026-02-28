"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, GripVertical, Package } from "lucide-react";
import type { ServiceCategoryEntity } from "@/types/database";

// Available Lucide icons for categories
const availableIcons = [
  { value: "waves", label: "Waves (Surf)" },
  { value: "ship", label: "Ship (Tours)" },
  { value: "car", label: "Car (Transport)" },
  { value: "utensils", label: "Utensils (Food)" },
  { value: "heart", label: "Heart (Wellness)" },
  { value: "dumbbell", label: "Dumbbell (Fitness)" },
  { value: "camera", label: "Camera (Photography)" },
  { value: "package", label: "Package (Other)" },
];

// Available Tailwind colors
const availableColors = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  { value: "yellow", label: "Yellow" },
  { value: "gray", label: "Gray" },
];

interface CategoryWithCount extends ServiceCategoryEntity {
  services_count: number;
}

interface ServiceCategoriesClientProps {
  initialCategories: CategoryWithCount[];
}

export function ServiceCategoriesClient({ initialCategories }: ServiceCategoriesClientProps) {
  const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "package",
    color: "blue",
    display_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "package",
      color: "blue",
      display_order: 0,
      is_active: true,
    });
    setEditingCategory(null);
  };

  const openEditDialog = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "package",
      color: category.color || "blue",
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory
        ? prev.slug
        : name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const url = editingCategory
        ? `/api/admin/service-categories/${editingCategory.id}`
        : "/api/admin/service-categories";
      
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save category");
      }

      const savedCategory = await response.json();

      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === savedCategory.id
              ? { ...savedCategory, services_count: c.services_count }
              : c
          )
        );
      } else {
        setCategories((prev) => [
          ...prev,
          { ...savedCategory, services_count: 0 },
        ]);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/service-categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleToggleActive = async (category: CategoryWithCount) => {
    try {
      const response = await fetch(`/api/admin/service-categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !category.is_active }),
      });

      if (!response.ok) throw new Error("Failed to update category");

      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, is_active: !c.is_active } : c
        )
      );
    } catch (error) {
      alert("Failed to update category status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Service Categories</h1>
          <p className="text-muted-foreground">
            Manage service categories for full customization
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Package className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              No categories configured yet. Create your first category to organize services.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead className="text-center">Services</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {category.icon || "package"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{category.services_count}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {category.display_order}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={() => handleToggleActive(category)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(category.id)}
                          disabled={category.services_count > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Delete Confirmation */}
                      {deleteConfirm === category.id && (
                        <div className="absolute right-4 top-full mt-2 bg-card border rounded-lg shadow-lg p-4 z-10 w-64">
                          <p className="text-sm mb-3">
                            Delete "{category.name}"? This cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(category.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Surf Lessons"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, ""),
                  }))
                }
                placeholder="e.g., surf-lessons"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier. Auto-generated from name.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of this category"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, icon: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, color: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_order: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first. Categories with same order are sorted by name.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <Label htmlFor="is_active">Active (visible to guests)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving || !formData.name || !formData.slug}>
              {isSaving ? "Saving..." : editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
