import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "@/components/admin/reports/revenue-chart";
import { OccupancyReport } from "@/components/admin/reports/occupancy-report";
import { ServicesReport } from "@/components/admin/reports/services-report";
import { ChannelReport } from "@/components/admin/reports/channel-report";
import { DateRangePicker } from "@/components/admin/reports/date-range-picker";
import { DollarSign, Bed, Waves, TrendingUp } from "lucide-react";

async function getReportStats() {
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).toISOString();

  // Revenue this month
  const { data: bookings } = await supabase
    .from("bookings")
    .select("total_amount, paid_amount, created_at")
    .gte("created_at", startOfMonth)
    .lte("created_at", endOfMonth)
    .eq("payment_status", "paid");

  const monthlyRevenue =
    bookings?.reduce((sum, b) => sum + Number(b.paid_amount), 0) || 0;

  // Services revenue - join with bookings to filter by date
  const { data: serviceBookings } = await supabase
    .from("booking_services")
    .select("price_at_booking, quantity, scheduled_date")
    .gte("scheduled_date", startOfMonth.split("T")[0])
    .lte("scheduled_date", endOfMonth.split("T")[0]);

  const servicesRevenue =
    serviceBookings?.reduce(
      (sum, s) => sum + Number(s.price_at_booking) * (s.quantity || 1),
      0
    ) || 0;

  // Get total beds dynamically from rooms table
  const { data: rooms } = await supabase
    .from("rooms")
    .select("capacity")
    .eq("is_active", true);

  const totalBeds = rooms?.reduce((sum, r) => sum + (r.capacity || 0), 0) || 0;

  // Occupancy rate (beds occupied / total beds)
  const { data: occupiedBeds } = await supabase
    .from("bookings")
    .select("guests_count")
    .eq("status", "checked_in");

  const currentOccupancy =
    occupiedBeds?.reduce((sum, b) => sum + (b.guests_count || 0), 0) || 0;
  const occupancyRate =
    totalBeds > 0 ? Math.round((currentOccupancy / totalBeds) * 100) : 0;

  // Month over month growth
  const lastMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  ).toISOString();
  const lastMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0
  ).toISOString();

  const { data: lastMonthBookings } = await supabase
    .from("bookings")
    .select("paid_amount")
    .gte("created_at", lastMonthStart)
    .lte("created_at", lastMonthEnd)
    .eq("payment_status", "paid");

  const lastMonthRevenue =
    lastMonthBookings?.reduce((sum, b) => sum + Number(b.paid_amount), 0) || 0;
  const growth =
    lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

  return {
    monthlyRevenue,
    servicesRevenue,
    accommodationRevenue: monthlyRevenue - servicesRevenue,
    occupancyRate,
    growth,
    currentOccupancy,
    totalBeds,
  };
}

export default async function ReportsPage() {
  const stats = await getReportStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            Track revenue, occupancy, and service performance
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${stats.monthlyRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.growth >= 0 ? "+" : ""}
              {stats.growth}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accommodation
            </CardTitle>
            <div className="w-10 h-10 bg-seafoam/20 rounded-lg flex items-center justify-center">
              <Bed className="w-5 h-5 text-seafoam" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${stats.accommodationRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Room & bed revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Services
            </CardTitle>
            <div className="w-10 h-10 bg-coral/20 rounded-lg flex items-center justify-center">
              <Waves className="w-5 h-5 text-coral" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${stats.servicesRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Surf, tours & transport
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.occupancyRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.currentOccupancy}/{stats.totalBeds} beds occupied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueChart />
        </TabsContent>

        <TabsContent value="occupancy">
          <OccupancyReport />
        </TabsContent>

        <TabsContent value="services">
          <ServicesReport />
        </TabsContent>

        <TabsContent value="channels">
          <ChannelReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
