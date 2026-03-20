import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import type { BlogPost } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Edit Blog Post</h1>
        <p className="text-muted-foreground">Update post content and settings</p>
      </div>
      <BlogPostForm post={post as BlogPost} mode="edit" />
    </div>
  );
}
