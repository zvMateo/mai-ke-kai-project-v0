import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { UserForm } from "@/components/admin/user-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewUserPage() {
  return (
    <>
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Usuarios
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nuevo Usuario</h1>
        <p className="text-muted-foreground">
          Crea una nueva cuenta de administrador o voluntario
        </p>
      </div>

      <UserForm mode="create" />
    </>
  );
}
