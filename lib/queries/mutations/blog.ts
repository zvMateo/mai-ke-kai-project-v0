"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/queries/keys";
import { createBlogPost, updateBlogPost, deleteBlogPost } from "@/lib/actions/blog";
import type { BlogPost } from "@/types/database";

interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_name: string;
  author_avatar_url: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
}

interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  id: string;
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateBlogPostInput) => createBlogPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts.all });
      router.push("/admin/blog");
      router.refresh();
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateBlogPostInput) => updateBlogPost(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.blogPosts.detail(variables.id),
      });
      router.push("/admin/blog");
      router.refresh();
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deleteBlogPost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.blogPosts.lists(),
      });

      const previousLists =
        queryClient.getQueriesData<BlogPost[]>({
          queryKey: queryKeys.blogPosts.lists(),
        }) || [];

      previousLists.forEach(([key, posts]) => {
        if (!posts) return;
        queryClient.setQueryData(
          key,
          posts.filter((post) => post.id !== postId)
        );
      });

      return { previousLists };
    },
    onError: (_err, _postId, context) => {
      context?.previousLists?.forEach(([key, posts]) => {
        queryClient.setQueryData(key, posts);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts.all });
    },
  });
}
