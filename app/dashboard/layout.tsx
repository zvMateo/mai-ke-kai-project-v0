import type React from "react";
import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated to access dashboard
  await requireAuth();

  return <>{children}</>;
}
