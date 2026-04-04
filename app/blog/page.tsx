export const runtime = "edge";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/queries/blog-public";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { Calendar, Clock, ArrowRight, Waves, User } from "lucide-react";

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

function readingTime(html: string | null): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPage() {
  const locale = await getLocale();
  const t = await getTranslations("blog");

  // getPublishedPosts never throws — returns [] on any error
  const posts = await getPublishedPosts();

  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader locale={locale} />

      <main>
        {/* ── HERO ── */}
        <section className="relative pt-36 pb-24 overflow-hidden bg-deep text-white">
          {/* Decorative wave bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-14 bg-background"
            style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
          />

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-flex items-center gap-2 text-seafoam text-sm font-semibold uppercase tracking-widest mb-4">
              <Waves className="w-4 h-4" />
              {t("heroTagline")}
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-5 text-balance">
              {t("heroTitle")}
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              {t("heroSubtitle")}
            </p>
          </div>
        </section>

        {/* ── FEATURED POST ── */}
        {featured && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4 max-w-5xl">
              <p className="text-primary font-semibold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <span className="w-6 h-px bg-primary inline-block" />
                {t("featuredPost")}
              </p>
              <Link
                href={`/blog/${featured.slug}`}
                className="group block rounded-3xl overflow-hidden border border-border shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Image */}
                  <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] overflow-hidden bg-muted">
                    {featured.cover_image_url ? (
                      <Image
                        src={featured.cover_image_url}
                        alt={featured.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-seafoam/20 flex items-center justify-center">
                        <span className="text-7xl">🌊</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center p-8 md:p-10 bg-card">
                    {(featured.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(featured.tags ?? []).slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <h2 className="font-heading text-2xl md:text-3xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>

                    {featured.excerpt && (
                      <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                        {featured.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-5 text-sm text-muted-foreground mb-8">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {featured.author_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {readingTime(featured.content)} {t("minRead")}
                      </span>
                      {featured.published_at && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                            new Date(featured.published_at)
                          )}
                        </span>
                      )}
                    </div>

                    <Button className="self-start gap-2 rounded-full">
                      {t("readMore")}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* ── ALL POSTS GRID ── */}
        <section className="pb-24 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            {rest.length > 0 && (
              <>
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-2">
                  <span className="w-6 h-px bg-border inline-block" />
                  {t("allPosts")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group block rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                        {post.cover_image_url ? (
                          <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-seafoam/20 flex items-center justify-center">
                            <span className="text-5xl">🌊</span>
                          </div>
                        )}
                        {/* Reading time overlay */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {readingTime(post.content)} {t("minRead")}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5">
                        {(post.tags ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {(post.tags ?? []).slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <h3 className="font-heading font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author_name}
                          </span>
                          {post.published_at && (
                            <span>
                              {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                new Date(post.published_at)
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Empty state */}
            {posts.length === 0 && (
              <div className="text-center py-24">
                <Waves className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">{t("noPostsYet")}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
