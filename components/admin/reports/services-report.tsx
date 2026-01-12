"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useServicesSales } from "@/lib/queries/admin";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_COLORS: Record<string, string> = {
  surf: "#5B8A9A",
  tour: "#E07A5F",
  transport: "#7DCFB6",
  yoga: "#F4A261",
  other: "#0E3244",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] ?? CATEGORY_COLORS.other;
}

export function ServicesReport() {
  const { data, isLoading, error } = useServicesSales();

  const servicesData = data ?? { categories: [], topServices: [] };
  const { categories, topServices } = servicesData;

  const totalRevenue = categories.reduce((sum, c) => sum + c.value, 0);
  const totalSold = categories.reduce((sum, c) => sum + c.count, 0);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load services data
          </p>
        </CardContent>
      </Card>
    );
  }

  const pieData = categories.map((cat) => ({
    ...cat,
    color: getCategoryColor(cat.name),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Category</CardTitle>
          <CardDescription>Service sales distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : pieData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No services data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">
                              ${data.value.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {data.count} sold
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            {isLoading ? (
              <>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold">
                    ${totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Services Sold</p>
                  <p className="text-xl font-bold">{totalSold}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Performing Services</CardTitle>
          <CardDescription>Most popular services this period</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="flex justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No service sales data available
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topServices.map((service) => (
                  <TableRow key={service.name}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{service.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{service.sold}</TableCell>
                    <TableCell className="text-right">
                      ${service.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {service.trend === "up" && (
                        <span className="text-green-600">+</span>
                      )}
                      {service.trend === "down" && (
                        <span className="text-red-600">-</span>
                      )}
                      {service.trend === "stable" && (
                        <span className="text-muted-foreground">=</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
