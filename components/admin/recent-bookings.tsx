"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Calendar, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useRecentBookings } from "@/lib/queries/admin";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending_payment: "bg-amber-100 text-amber-800",
  checked_in: "bg-primary/20 text-primary",
  checked_out: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  confirmed: "Confirmed",
  pending_payment: "Pending",
  checked_in: "In-House",
  checked_out: "Completed",
  cancelled: "Cancelled",
};

export function RecentBookings() {
  const { data: bookings, isLoading, error } = useRecentBookings(5);

  const recentBookings = bookings ?? [];

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load recent bookings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-lg">Recent Bookings</CardTitle>
          <p className="text-sm text-muted-foreground">Latest reservations</p>
        </div>
        <Link href="/admin/bookings">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))
          ) : recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent bookings found
            </p>
          ) : (
            recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {booking.guestName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {booking.guestName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(booking.checkIn), "MMM d")} -{" "}
                        {format(new Date(booking.checkOut), "MMM d")}
                      </span>
                      <span className="text-border">|</span>
                      <span>{booking.roomType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold">${booking.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.id.slice(0, 12)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      statusColors[booking.status as keyof typeof statusColors] ??
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {statusLabels[booking.status as keyof typeof statusLabels] ??
                      booking.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
