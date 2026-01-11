"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useUsersList } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Shield, UserCheck } from "lucide-react";
import type { User } from "@/types/database";

function UsersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={`stats-skeleton-${idx}`}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={`row-skeleton-${idx}`} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No hay usuarios</h3>
      <p className="text-muted-foreground mb-4">
        Comienza creando un nuevo usuario
      </p>
      <Link href="/admin/users/new">
        <Button>Crear Usuario</Button>
      </Link>
    </div>
  );
}

export function UsersClient() {
  const { data: users = [], isLoading, isFetching, error } = useUsersList();

  const stats = useMemo(() => {
    const admins = users.filter((u: User) => u.role === "admin").length;
    const volunteers = users.filter((u: User) => u.role === "volunteer").length;
    return {
      total: users.length,
      admins,
      volunteers,
    };
  }, [users]);

  if (isLoading) {
    return <UsersSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona voluntarios y administradores
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      {error && (
        <Card>
          <CardContent className="py-8">
            <p className="text-destructive">
              Failed to load users: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administradores
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voluntarios</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.volunteers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching && !isLoading && (
            <p className="text-sm text-muted-foreground mb-3">
              Actualizando últimos datos…
            </p>
          )}
          {users.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nombre</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Rol</th>
                    <th className="text-left py-3 px-4">Creado</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 px-4">
                        {user.full_name || "Sin nombre"}
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "default"
                              : user.role === "volunteer"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {user.role === "admin"
                            ? "Administrador"
                            : user.role === "volunteer"
                            ? "Voluntario"
                            : "Usuario"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(
                          user.created_at ?? Date.now()
                        ).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
