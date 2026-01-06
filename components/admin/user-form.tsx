"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import type { User } from "@/types";

interface UserFormProps {
  user?: User;
  mode?: "create" | "edit";
}

export function UserForm({ user, mode = "create" }: UserFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    role: user?.role || "volunteer",
    phone: user?.phone || "",
    nationality: user?.nationality || "",
  });

  useEffect(() => {
    if (mode === "edit" && user) {
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        role: user.role || "volunteer",
        phone: user.phone || "",
        nationality: user.nationality || "",
      });
    }
  }, [mode, user]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const endpoint = "/api/admin/users";
    const method = mode === "create" ? "POST" : "PUT";
    const body = JSON.stringify({
      ...(mode === "edit" && { id: user?.id }),
      ...formData,
    });

    try {
      const response = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar usuario");
      }

      toast.success(mode === "create" ? "Usuario creado exitosamente" : "Usuario actualizado exitosamente");
      router.push("/admin/users");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar usuario");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!user?.id) return;
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const response = await fetch(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar");
      toast.success("Usuario eliminado");
      router.push("/admin/users");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar");
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Crear Usuario" : "Editar Usuario"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Completa los datos para crear una nueva cuenta"
            : "Actualiza los datos del usuario"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Juan Pérez"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@example.com"
                required
                disabled={loading || mode === "edit"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Huésped</SelectItem>
                  <SelectItem value="volunteer">Voluntario</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+506 8888-8888"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nacionalidad</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="Costa Rica"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : mode === "create" ? "Crear Usuario" : "Actualizar Usuario"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancelar
            </Button>
            {mode === "edit" && user?.role !== "admin" && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading} className="ml-auto">
                Eliminar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
