import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">New Blog Post</h1>
        <p className="text-muted-foreground">
          Create a new article for the blog
        </p>
      </div>
      <BlogPostForm mode="create" />
    </div>
  );
}
