"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserPlus,
  Bed,
  Waves,
  DollarSign,
  Settings,
  BarChart3,
  Menu,
  X,
  Lock,
  FileText,
  Package,
  Gift,
  Tags,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Calendar",
    href: "/admin/calendar",
    icon: Calendar,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: BarChart3,
  },
  {
    title: "Guests",
    href: "/admin/guests",
    icon: Users,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: UserPlus,
  },
  {
    title: "Rooms & Beds",
    href: "/admin/rooms",
    icon: Bed,
  },
  {
    title: "Services",
    href: "/admin/services",
    icon: Waves,
  },
  {
    title: "Service Categories",
    href: "/admin/service-categories",
    icon: Tags,
  },
  {
    title: "Surf Packages",
    href: "/admin/packages",
    icon: Package,
  },
  {
    title: "Pricing",
    href: "/admin/pricing",
    icon: DollarSign,
  },
  {
    title: "Loyalty Rewards",
    href: "/admin/loyalty",
    icon: Gift,
  },
  {
    title: "Date Blocks",
    href: "/admin/blocks",
    icon: Lock,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 border-b border-border flex items-center px-6">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
                alt="Mai Ke Kai"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div>
                <p className="font-heading font-bold text-primary text-sm">
                  Mai Ke Kai
                </p>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Website
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
