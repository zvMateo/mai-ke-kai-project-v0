import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import type { BlogPost } from "@/types/database";

interface BlogCardProps {
  post: BlogPost;
}

function readingTime(html: string | null): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return Math.max(1, Math.ceil(text.split(" ").filter(Boolean).length / 200));
}

export function BlogCard({ post }: BlogCardProps) {
  const mins = readingTime(post.content);
  const publishedDate = post.published_at
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(post.published_at)
      )
    : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover Image */}
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
        {/* Reading time chip */}
        <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
          <Clock className="w-3 h-3" />
          {mins} min
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-heading font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Meta footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {post.author_name}
          </span>
          {publishedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {publishedDate}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
