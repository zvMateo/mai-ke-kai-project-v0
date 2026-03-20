import type { Metadata } from "next";
import { getPublishedBlogPosts } from "@/lib/actions/blog";
import { BlogCard } from "@/components/landing/blog-card";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getLocale } from "next-intl/server";
import { Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Mai Ke Kai Surf House",
  description:
    "Stories, surf tips, travel guides, and news from Mai Ke Kai Surf House in Tamarindo, Costa Rica.",
  openGraph: {
    type: "website",
    title: "Blog | Mai Ke Kai Surf House",
    description:
      "Stories, surf tips, travel guides, and news from Mai Ke Kai Surf House in Tamarindo, Costa Rica.",
  },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader locale={locale} />

      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 bg-deep text-white">
          <div className="container mx-auto px-4 text-center">
            <Waves className="w-10 h-10 mx-auto mb-4 text-seafoam opacity-80" />
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Our Blog
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Stories, surf tips, and guides from Tamarindo, Costa Rica
            </p>
          </div>
        </section>

        {/* Posts grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  No posts yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
