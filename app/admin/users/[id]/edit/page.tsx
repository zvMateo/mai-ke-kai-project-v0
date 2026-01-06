import { createAdminDbClient } from "@/lib/supabase/admin";
import { UserForm } from "@/components/admin/user-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

async function getUser(id: string) {
  const supabaseAdminDb = createAdminDbClient();
  const { data } = await supabaseAdminDb.from("users").select("*").eq("id", id).single();
  return data;
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Usuarios
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Usuario</h1>
        <p className="text-muted-foreground">
          Actualiza los datos del usuario
        </p>
      </div>

      <UserForm user={user} mode="edit" />
    </div>
  );
}
