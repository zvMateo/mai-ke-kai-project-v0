import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarCheck,
  DollarSign,
  Bed,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { OccupancyChart } from "@/components/admin/occupancy-chart";
import { RecentBookings } from "@/components/admin/recent-bookings";
import { RoomOccupancyGrid } from "@/components/admin/room-occupancy-grid";

async function getDashboardStats() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });
  const { count: activeBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "confirmed");
  const { count: checkInsToday } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("check_in", today)
    .eq("status", "confirmed");
  const { count: checkOutsToday } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("check_out", today)
    .eq("status", "checked_in");
  const { data: revenueData } = await supabase
    .from("bookings")
    .select("paid_amount")
    .eq("payment_status", "paid");
  const totalRevenue =
    revenueData?.reduce((sum, b) => sum + Number(b.paid_amount), 0) || 0;
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  return {
    totalBookings: totalBookings || 0,
    activeBookings: activeBookings || 0,
    checkInsToday: checkInsToday || 0,
    checkOutsToday: checkOutsToday || 0,
    totalRevenue,
    totalUsers: totalUsers || 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Mai Ke Kai Admin Panel
        </p>
      </div>

      {/* Stats Grid */}
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
              ${stats.totalRevenue.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">+12.5%</span>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
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
            <p className="text-3xl font-bold">{stats.activeBookings}</p>
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
            <p className="text-3xl font-bold">{stats.checkInsToday}</p>
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
            <p className="text-3xl font-bold">{stats.checkOutsToday}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Departures today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Chart and Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart />
        <RoomOccupancyGrid />
      </div>

      {/* Recent Bookings */}
      <RecentBookings />
    </div>
  );
}
