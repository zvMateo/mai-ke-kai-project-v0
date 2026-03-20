"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPostsList } from "@/lib/queries";
import { BlogPostDeleteButton } from "@/components/admin/blog-post-delete-button";
import { Plus, Pencil, FileText } from "lucide-react";
import type { BlogPost } from "@/types/database";

function BlogPostsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <Card key={`blog-skeleton-${idx}`}>
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center space-y-4">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">
          No blog posts yet. Create your first post to get started.
        </p>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="w-4 h-4 mr-2" />
            Create First Post
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function BlogPostRow({ post }: { post: BlogPost }) {
  const publishedDate = post.published_at
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(post.published_at)
      )
    : null;

  return (
    <Card>
      <CardContent className="py-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{post.title}</span>
            {post.is_published ? (
              <Badge className="bg-green-100 text-green-800 shrink-0">
                Published
              </Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0">
                Draft
              </Badge>
            )}
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs shrink-0">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            By {post.author_name}
            {publishedDate && ` · ${publishedDate}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button asChild variant="outline" size="sm" className="bg-transparent">
            <Link href={`/admin/blog/${post.id}/edit`}>
              <Pencil className="w-4 h-4" />
            </Link>
          </Button>
          <BlogPostDeleteButton postId={post.id} postTitle={post.title} />
        </div>
      </CardContent>
    </Card>
  );
}

export function BlogPostsClient() {
  const { data: posts = [], isLoading, isFetching, error } = useBlogPostsList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage articles and content for the blog
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/blog/new">
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="py-8">
            <p className="text-destructive">
              Failed to load blog posts: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <BlogPostsSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {isFetching && !isLoading && (
            <p className="text-sm text-muted-foreground">Updating...</p>
          )}
          <div className="space-y-3">
            {posts.map((post) => (
              <BlogPostRow key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
