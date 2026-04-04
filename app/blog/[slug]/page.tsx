export const runtime = "edge";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/actions/blog";
import { sanitizeHtml } from "@/lib/utils";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Waves } from "lucide-react";
import { TAB_TRAVEL_CHECKOUT_URL } from "@/lib/booking-utils";
import { ShareButton } from "@/components/blog/share-button";

interface Props {
  params: Promise<{ slug: string }>;
}

function readingTime(html: string | null): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Mai Ke Kai Blog`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
      type: "article",
      publishedTime: post.published_at ?? undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(slug),
    getPublishedBlogPosts(4),
  ]);
  const locale = await getLocale();
  const t = await getTranslations("blog");

  if (!post) notFound();

  const minutes = readingTime(post.content);

  const publishedDate = post.published_at
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
        new Date(post.published_at)
      )
    : null;

  // Related posts: up to 3 posts that are not the current one
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader locale={locale} />

      <main>
        {/* ── COVER IMAGE ── */}
        {post.cover_image_url ? (
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
        ) : (
          <div className="h-32 bg-deep" />
        )}

        <div className="container mx-auto px-4 max-w-3xl">
          {/* ── ARTICLE META ── */}
          <div className={post.cover_image_url ? "-mt-16 relative z-10" : "pt-28"}>
            {/* Back */}
            <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 hover:bg-muted">
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                {t("backToBlog")}
              </Link>
            </Button>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-balance">
              {post.title}
            </h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-8 mb-10 border-b border-border">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author_name}
              </span>
              {publishedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {publishedDate}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {minutes} {t("minRead")}
              </span>
              <ShareButton
                label={t("sharePost")}
                copyLabel={t("copyLink")}
                copiedLabel={t("copied")}
              />
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div
            className="
              [&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-10 [&_h1]:mb-5
              [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-4
              [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3
              [&_p]:mb-6 [&_p]:leading-[1.85] [&_p]:text-foreground/90 [&_p]:text-[1.05rem]
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2
              [&_li]:leading-relaxed [&_li]:text-foreground/90
              [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium
              [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:my-8 [&_blockquote]:text-muted-foreground [&_blockquote]:text-lg
              [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:my-8 [&_img]:shadow-md
              [&_strong]:font-semibold [&_strong]:text-foreground
              [&_hr]:border-border [&_hr]:my-10
              [&_pre]:bg-muted [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:overflow-x-auto [&_pre]:my-6 [&_pre]:text-sm
              [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-6
              [&_th]:border [&_th]:border-border [&_th]:p-3 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold
              [&_td]:border [&_td]:border-border [&_td]:p-3
            "
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(post.content ?? ""),
            }}
          />

          {/* ── INLINE CTA BANNER ── */}
          <div className="my-14 rounded-2xl bg-gradient-to-br from-primary to-ocean-dark text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <Waves className="w-7 h-7 text-seafoam mb-2" />
              <h3 className="font-heading text-xl font-bold mb-1">
                {t("ctaBannerTitle")}
              </h3>
              <p className="text-white/75 text-sm">{t("ctaBannerSubtitle")}</p>
            </div>
            <Link
              href={TAB_TRAVEL_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button className="bg-white text-primary hover:bg-white/90 font-bold rounded-full px-6 shadow-lg hover:scale-105 transition-transform">
                {t("ctaBannerButton")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* ── AUTHOR CARD ── */}
          <div className="border border-border rounded-2xl p-6 mb-16 flex items-start gap-4 bg-muted/30">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-ocean-dark flex items-center justify-center flex-shrink-0">
              {post.author_avatar_url ? (
                <Image
                  src={post.author_avatar_url}
                  alt={post.author_name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {post.author_name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{post.author_name}</p>
              <p className="text-muted-foreground text-sm">
                Surf instructor & writer at Mai Ke Kai · Tamarindo, Costa Rica 🌊
              </p>
            </div>
          </div>
        </div>

        {/* ── RELATED POSTS ── */}
        {related.length > 0 && (
          <section className="py-16 bg-muted/20 border-t border-border">
            <div className="container mx-auto px-4 max-w-5xl">
              <h2 className="font-heading text-2xl font-bold mb-10 text-center">
                {t("relatedPosts")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rPost) => (
                  <Link
                    key={rPost.id}
                    href={`/blog/${rPost.slug}`}
                    className="group block rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all bg-card"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      {rPost.cover_image_url ? (
                        <Image
                          src={rPost.cover_image_url}
                          alt={rPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-seafoam/20 flex items-center justify-center">
                          <span className="text-4xl">🌊</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-semibold line-clamp-2 group-hover:text-primary transition-colors text-sm leading-snug mb-2">
                        {rPost.title}
                      </h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {readingTime(rPost.content)} {t("minRead")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
