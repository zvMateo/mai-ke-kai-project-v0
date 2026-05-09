"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Newspaper,
  Mail,
  Images,
  MessageSquare,
  Info,
  Settings as SettingsIcon,
  UserPlus,
} from "lucide-react";

// Placeholder dashboard — Phase 6.9 of the cleanup plan will replace this
// with content-focused stats (blog, newsletter, gallery, testimonials).
// All booking/PMS metrics were removed because Tab.Travel handles bookings.
const sections = [
  { title: "Blog", href: "/admin/blog", icon: Newspaper, description: "Manage posts and articles" },
  { title: "Newsletter", href: "/admin/newsletter", icon: Mail, description: "Subscribers and campaigns" },
  { title: "Gallery", href: "/admin/gallery", icon: Images, description: "Site images and media" },
  { title: "Testimonials", href: "/admin/testimonials", icon: MessageSquare, description: "Guest reviews" },
  { title: "About", href: "/admin/about", icon: Info, description: "Team, story, timeline" },
  { title: "Settings", href: "/admin/settings", icon: SettingsIcon, description: "Hostel configuration" },
  { title: "Users", href: "/admin/users", icon: UserPlus, description: "Admin accounts" },
] as const;

export function AdminDashboardClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage content, communications, and site configuration. Bookings are
          handled by the Tab.Travel widget.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(({ title, href, icon: Icon, description }) => (
          <Card key={href} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
              <Button asChild size="sm" variant="outline">
                <Link href={href}>Manage {title.toLowerCase()}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
