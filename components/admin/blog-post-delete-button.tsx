"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDeleteBlogPost } from "@/lib/queries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BlogPostDeleteButtonProps {
  postId: string;
  postTitle: string;
}

export function BlogPostDeleteButton({ postId, postTitle }: BlogPostDeleteButtonProps) {
  const deletePost = useDeleteBlogPost();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive bg-transparent"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{postTitle}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePost.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deletePost.mutate(postId)}
            disabled={deletePost.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deletePost.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
