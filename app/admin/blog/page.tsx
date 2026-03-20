import { requireAdmin } from "@/lib/auth";
import { BlogPostsClient } from "./blog-posts-client";
import {
  withQueryClient,
  prefetchBlogPostsList,
} from "@/lib/queries/index.server";

export default async function AdminBlogPage() {
  await requireAdmin();

  return withQueryClient({
    prefetch: (queryClient) => prefetchBlogPostsList(queryClient),
    children: <BlogPostsClient />,
  });
}
