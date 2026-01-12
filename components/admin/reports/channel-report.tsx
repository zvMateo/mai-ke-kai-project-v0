"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { useChannelData } from "@/lib/queries/admin";
import { Skeleton } from "@/components/ui/skeleton";

const CHANNEL_COLORS: Record<string, string> = {
  "booking.com": "#003580",
  direct: "#7DCFB6",
  hostelworld: "#FF6B00",
  airbnb: "#FF5A5F",
  instagram: "#E4405F",
  booksurfcamps: "#0EA5E9",
};

function getChannelColor(channel: string): string {
  return CHANNEL_COLORS[channel.toLowerCase()] ?? "#6B7280";
}

export function ChannelReport() {
  const { data, isLoading, error } = useChannelData();

  const channelData = data ?? [];

  const totalBookings = channelData.reduce((sum, c) => sum + c.bookings, 0);
  const totalRevenue = channelData.reduce((sum, c) => sum + c.revenue, 0);
  const totalCommission = channelData.reduce((sum, c) => sum + c.commission, 0);
  const directRevenue = channelData
    .filter((c) => c.commission === 0)
    .reduce((sum, c) => sum + c.revenue, 0);
  const directPercentage =
    totalRevenue > 0 ? Math.round((directRevenue / totalRevenue) * 100) : 0;
  const commissionRate =
    totalRevenue > 0 ? Math.round((totalCommission / totalRevenue) * 100) : 0;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings by Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load channel data
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = channelData.map((item) => ({
    ...item,
    color: getChannelColor(item.name),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Bookings by Channel</CardTitle>
          <CardDescription>
            Distribution of reservations across platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No channel data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 80, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis type="number" className="text-xs" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    className="text-xs"
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">Bookings: {data.bookings}</p>
                            <p className="text-sm">
                              Revenue: ${data.revenue.toLocaleString()}
                            </p>
                            {data.commission > 0 && (
                              <p className="text-sm text-red-600">
                                Commission: -${data.commission.toLocaleString()}
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Direct Booking Goal</CardTitle>
            <CardDescription>Target: Increase direct bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-4 w-48" />
              </>
            ) : (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Direct Revenue</span>
                    <span className="font-medium">{directPercentage}%</span>
                  </div>
                  <Progress value={directPercentage} className="h-3" />
                </div>
                <p className="text-sm text-muted-foreground">
                  ${directRevenue.toLocaleString()} of $
                  {totalRevenue.toLocaleString()} total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Commission Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-7 w-24" />
                </div>
                <div>
                  <Skeleton className="h-4 w-44 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="pt-2 border-t">
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Commissions Paid
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    -${totalCommission.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Effective Commission Rate
                  </p>
                  <p className="text-xl font-bold">{commissionRate}%</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Net Revenue</p>
                  <p className="text-xl font-bold text-seafoam">
                    ${(totalRevenue - totalCommission).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
