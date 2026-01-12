"use client";

import Link from "next/link";
import Image from "next/image";
import { useAdminDashboardStats, useDashboardGrowth } from "@/lib/queries/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarCheck,
  DollarSign,
  Bed,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OccupancyChart } from "@/components/admin/occupancy-chart";
import { RoomOccupancyGrid } from "@/components/admin/room-occupancy-grid";
import { RecentBookings } from "@/components/admin/recent-bookings";

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card key={`stats-skeleton-${idx}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-28 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminDashboardClient() {
  const { data: stats, isLoading, error } = useAdminDashboardStats();
  const { data: growth, isLoading: growthLoading } = useDashboardGrowth();

  const safeStats = stats ?? {
    totalRevenue: 0,
    activeBookings: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
  };

  const growthData = growth ?? { percentage: 0, isPositive: true };
  const isGrowthLoading = isLoading || growthLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Mai Ke Kai Admin Panel
          </p>
        </div>
        <Link
          href="/"
          className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Image
            src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
            alt="Mai Ke Kai"
            width={28}
            height={28}
          />
          Back to site
        </Link>
      </div>

      {error && (
        <Card>
          <CardContent className="py-6">
            <p className="text-destructive">
              Failed to load dashboard metrics: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${safeStats.totalRevenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {isGrowthLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <>
                    {growthData.isPositive ? (
                      <ArrowUpRight className="w-3 h-3 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        growthData.isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {growthData.isPositive ? "+" : ""}
                      {growthData.percentage}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs last month
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Bookings
              </CardTitle>
              <div className="w-10 h-10 bg-seafoam/20 rounded-lg flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-seafoam" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{safeStats.activeBookings}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Confirmed reservations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Check-ins Today
              </CardTitle>
              <div className="w-10 h-10 bg-coral/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-coral" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{safeStats.checkInsToday}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Arrivals expected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Check-outs Today
              </CardTitle>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Bed className="w-5 h-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{safeStats.checkOutsToday}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Departures today
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart />
        <RoomOccupancyGrid />
      </div>

      <RecentBookings />
    </div>
  );
}
