import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import type { BlogPost } from "@/types/database";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const publishedDate = post.published_at
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(post.published_at)
      )
    : null;

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
              <span className="text-4xl">🌊</span>
            </div>
          )}
        </div>

        <CardContent className="p-5 flex flex-col gap-3">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="font-heading font-semibold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2 border-t">
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
        </CardContent>
      </Card>
    </Link>
  );
}
