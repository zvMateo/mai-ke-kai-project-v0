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
import { useMonthlyOccupancy, useCurrentRoomOccupancy } from "@/lib/queries/admin";
import { Skeleton } from "@/components/ui/skeleton";

const TARGET_OCCUPANCY = 70;

export function OccupancyReport() {
  const { data: occupancyData, isLoading: occupancyLoading, error: occupancyError } =
    useMonthlyOccupancy();
  const { data: roomOccupancy, isLoading: roomLoading } = useCurrentRoomOccupancy();

  const isLoading = occupancyLoading || roomLoading;
  const monthlyData = occupancyData ?? [];
  const roomData = roomOccupancy ?? [];

  const avgOccupancy =
    monthlyData.length > 0
      ? Math.round(
          monthlyData.reduce((sum, d) => sum + d.rate, 0) / monthlyData.length
        )
      : 0;
  const aboveTarget = monthlyData.filter((d) => d.rate >= TARGET_OCCUPANCY).length;

  if (occupancyError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Occupancy Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load occupancy data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Occupancy Rate</CardTitle>
          <CardDescription>
            Target: {TARGET_OCCUPANCY}% occupancy throughout the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No occupancy data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    vertical={false}
                  />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const rate = payload[0].value as number;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm">
                              Occupancy:{" "}
                              <span className="font-medium">{rate}%</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {rate >= TARGET_OCCUPANCY
                                ? "Above target"
                                : "Below target"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rate >= TARGET_OCCUPANCY ? "#7DCFB6" : "#E07A5F"}
                      />
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
            <CardTitle className="text-base">Year Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Average Occupancy
                  </p>
                  <p className="text-3xl font-bold">{avgOccupancy}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Months Above Target
                  </p>
                  <p className="text-2xl font-bold text-seafoam">
                    {aboveTarget} / {monthlyData.length}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Room Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={`skeleton-${idx}`}>
                  <div className="flex justify-between text-sm mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : roomData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                No room data available
              </p>
            ) : (
              roomData.map((room) => {
                const occupancy =
                  room.totalBeds > 0
                    ? Math.round((room.occupiedBeds / room.totalBeds) * 100)
                    : 0;
                return (
                  <div key={room.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate pr-2">
                        {room.name} ({room.totalBeds})
                      </span>
                      <span className="font-medium">{occupancy}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${occupancy}%`,
                          backgroundColor:
                            occupancy >= TARGET_OCCUPANCY ? "#7DCFB6" : "#E07A5F",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
