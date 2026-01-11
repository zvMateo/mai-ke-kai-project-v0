"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Award,
  Gift,
  TrendingUp,
  History,
  ChevronLeft,
  Star,
  Waves,
  Coffee,
  Car,
  Ship,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/auth/logout-button";
import { LoyaltyRedeemDialog } from "@/components/loyalty/redeem-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoyaltySummary, useActiveRewards } from "@/lib/queries";

const iconMap: Record<string, typeof Waves> = {
  waves: Waves,
  star: Star,
  coffee: Coffee,
  car: Car,
  ship: Ship,
  gift: Gift,
  package: Package,
};

interface LoyaltyClientProps {
  userId: string;
}

export function LoyaltyClient({ userId }: LoyaltyClientProps) {
  const { data: loyaltySummary, isLoading: isSummaryLoading } =
    useLoyaltySummary(userId);
  const { data: rewards = [], isLoading: isRewardsLoading } =
    useActiveRewards();

  const points = loyaltySummary?.points ?? 0;
  const transactions = loyaltySummary?.transactions ?? [];

  const tier = points >= 2000 ? "Gold" : points >= 500 ? "Silver" : "Bronze";
  const tierColors = {
    Bronze: "bg-orange-100 text-orange-800",
    Silver: "bg-gray-100 text-gray-800",
    Gold: "bg-yellow-100 text-yellow-800",
  };
  const nextTierPoints =
    tier === "Bronze" ? 500 : tier === "Silver" ? 2000 : null;
  const progressToNext = nextTierPoints ? (points / nextTierPoints) * 100 : 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
                alt="Mai Ke Kai"
                width={32}
                height={32}
              />
              <span className="font-heading font-semibold text-primary hidden sm:block">
                Mai Ke Kai
              </span>
            </Link>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 overflow-hidden">
            <div className="bg-linear-to-r from-primary to-primary/80 text-white p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Tus Puntos</p>
                    {isSummaryLoading ? (
                      <Skeleton className="h-10 w-32" />
                    ) : (
                      <p className="text-4xl font-bold">
                        {points.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className={tierColors[tier as keyof typeof tierColors]}>
                  {tier} Member
                </Badge>
              </div>

              {nextTierPoints && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>
                      Progreso a {tier === "Bronze" ? "Silver" : "Gold"}
                    </span>
                    <span>
                      {points} / {nextTierPoints}
                    </span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    {isSummaryLoading ? (
                      <Skeleton className="h-2 w-full" />
                    ) : (
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${Math.min(progressToNext, 100)}%` }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">1</p>
                  <p className="text-sm text-muted-foreground">
                    Puntos por $1 gastado
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">500</p>
                  <p className="text-sm text-muted-foreground">
                    Mínimo para canjear
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-sm text-muted-foreground">
                    Meses de validez
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6 text-primary" />
              Canjear Puntos
            </h2>
            {isRewardsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton
                    key={`reward-skeleton-${idx}`}
                    className="h-40 rounded-xl"
                  />
                ))}
              </div>
            ) : rewards.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No hay recompensas disponibles en este momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward) => {
                  const canRedeem = points >= reward.points_required;
                  const Icon = iconMap[reward.icon] || Gift;
                  const categoryStyles =
                    reward.category === "surf"
                      ? { background: "bg-primary/10", color: "text-primary" }
                      : reward.category === "accommodation"
                      ? { background: "bg-coral/10", color: "text-coral" }
                      : reward.category === "food"
                      ? { background: "bg-seafoam/20", color: "text-seafoam" }
                      : {
                          background: "bg-muted",
                          color: "text-muted-foreground",
                        };

                  return (
                    <Card
                      key={reward.id}
                      className={!canRedeem ? "opacity-60" : ""}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${categoryStyles.background}`}
                          >
                            <Icon
                              className={`w-6 h-6 ${categoryStyles.color}`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{reward.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {reward.description}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <Badge variant="secondary">
                                {reward.points_required} puntos
                              </Badge>
                              <LoyaltyRedeemDialog
                                reward={{
                                  id: reward.id,
                                  name: reward.name,
                                  description: reward.description ?? "",
                                  points: reward.points_required,
                                }}
                                userPoints={points}
                                canRedeem={canRedeem}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Historial de Puntos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton
                      key={`tx-skeleton-${idx}`}
                      className="h-16 rounded-lg"
                    />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Aún no tienes transacciones
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gana puntos al completar estancias
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(tx.created_at), "d MMM yyyy")}
                        </p>
                      </div>
                      <span
                        className={`font-bold ${
                          tx.points > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.points > 0 ? "+" : ""}
                        {tx.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
