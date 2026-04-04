import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/landing/blog-card";
import { getPublishedPosts } from "@/lib/queries/blog-public";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function BlogSection() {
  const posts = await getPublishedPosts(3);
  const t = await getTranslations("blog");

  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
              {t("title")}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              {t("latestPosts")}
            </h2>
          </div>
          <Button asChild variant="outline" className="gap-2 shrink-0 bg-transparent">
            <Link href="/blog">
              {t("viewAll")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
