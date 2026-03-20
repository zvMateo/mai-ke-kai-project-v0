import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogPostBySlug } from "@/lib/actions/blog";
import { sanitizeHtml } from "@/lib/utils";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocale } from "next-intl/server";
import { Calendar, User, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

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
  const post = await getBlogPostBySlug(slug);
  const locale = await getLocale();

  if (!post) {
    notFound();
  }

  const publishedDate = post.published_at
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
        new Date(post.published_at)
      )
    : null;

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader locale={locale} />

      <main className="pt-24 pb-20">
        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="relative h-72 md:h-96 w-full mb-12 overflow-hidden">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Back link */}
            <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Blog
              </Link>
            </Button>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10 pb-10 border-b">
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
            </div>

            {/* Content */}
            <div
              className="[&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_p]:leading-relaxed [&_p]:text-foreground/90 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-1.5 [&_li]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:my-6 [&_blockquote]:text-muted-foreground [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-6 [&_strong]:font-semibold [&_hr]:border-border [&_hr]:my-8"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(post.content ?? ""),
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
