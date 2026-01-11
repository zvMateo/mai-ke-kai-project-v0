import type { ReactNode } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { makeQueryClient } from "./client";

type WithQueryClientChildren =
  | ReactNode
  | ((context: { queryClient: QueryClient }) => ReactNode | Promise<ReactNode>);

interface WithQueryClientOptions {
  children: WithQueryClientChildren;
  prefetch?: (queryClient: QueryClient) => Promise<void> | void;
}

export async function withQueryClient({
  children,
  prefetch,
}: WithQueryClientOptions) {
  const queryClient = makeQueryClient();

  if (prefetch) {
    await prefetch(queryClient);
  }

  const content =
    typeof children === "function" ? await children({ queryClient }) : children;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {content}
    </HydrationBoundary>
  );
}
