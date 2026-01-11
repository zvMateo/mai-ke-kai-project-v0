import { createClient } from "@/lib/supabase/server";
import { withQueryClient, prefetchRewardsList } from "@/lib/queries/index.server";
import { LoyaltyClient } from "./loyalty-client";

async function getLoyaltyStats() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("loyalty_transactions")
    .select("points");

  const { count: rewardsCount } = await supabase
    .from("loyalty_rewards")
    .select("*", { count: "exact", head: true });

  const totalIssued =
    transactions
      ?.filter((t) => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0) || 0;
  const totalRedeemed =
    transactions
      ?.filter((t) => t.points < 0)
      .reduce((sum, t) => sum + Math.abs(t.points), 0) || 0;

  return {
    totalIssued,
    totalRedeemed,
    totalRewards: rewardsCount ?? 0,
  };
}

export default async function LoyaltyAdminPage() {
  const stats = await getLoyaltyStats();

  return withQueryClient({
    prefetch: (queryClient) => prefetchRewardsList(queryClient),
    children: <LoyaltyClient stats={stats} />,
  });
}
