"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useRevenueHistory } from "@/lib/queries/admin";
import { Skeleton } from "@/components/ui/skeleton";

export function RevenueChart() {
  const { data, isLoading, error } = useRevenueHistory();

  const revenueData = data ?? [];
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.total, 0);
  const avgMonthly =
    revenueData.length > 0 ? Math.round(totalRevenue / revenueData.length) : 0;
  const totalAccommodation = revenueData.reduce(
    (sum, d) => sum + d.accommodation,
    0
  );
  const totalServices = revenueData.reduce((sum, d) => sum + d.services, 0);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load revenue data</p>
        </CardContent>
      </Card>
    );
  }

  const accommodationPercentage =
    totalRevenue > 0 ? Math.round((totalAccommodation / totalRevenue) * 100) : 0;
  const servicesPercentage =
    totalRevenue > 0 ? Math.round((totalServices / totalRevenue) * 100) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>
            Monthly breakdown of accommodation vs services revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorAccommodation"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#5B8A9A" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#5B8A9A" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient
                      id="colorServices"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#E07A5F" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium mb-2">{label}</p>
                            {payload.map((entry, index) => (
                              <p
                                key={index}
                                className="text-sm"
                                style={{ color: entry.color }}
                              >
                                {entry.name}: ${entry.value?.toLocaleString()}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="accommodation"
                    name="Accommodation"
                    stroke="#5B8A9A"
                    fillOpacity={1}
                    fill="url(#colorAccommodation)"
                    stackId="1"
                  />
                  <Area
                    type="monotone"
                    dataKey="services"
                    name="Services"
                    stroke="#E07A5F"
                    fillOpacity={1}
                    fill="url(#colorServices)"
                    stackId="1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Year Summary</CardTitle>
          <CardDescription>Total revenue breakdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-40" />
              </div>
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-7 w-32" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Annual Revenue
                </p>
                <p className="text-3xl font-bold">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Monthly</p>
                <p className="text-2xl font-bold">
                  ${avgMonthly.toLocaleString()}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accommodation</span>
                    <span className="font-medium">
                      ${totalAccommodation.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${accommodationPercentage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Services</span>
                    <span className="font-medium">
                      ${totalServices.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-coral rounded-full"
                      style={{ width: `${servicesPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
