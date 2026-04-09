"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered, Quote,
  Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Minus, Code, Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
   Toolbar button helper
────────────────────────────────────────────── */
function ToolbarBtn({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "p-1.5 rounded transition-colors text-sm",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />;
}

/* ──────────────────────────────────────────────
   Link dialog
────────────────────────────────────────────── */
function LinkDialog({
  onConfirm,
  onCancel,
  initial = "",
}: {
  onConfirm: (url: string) => void;
  onCancel: () => void;
  initial?: string;
}) {
  const [url, setUrl] = useState(initial);

  return (
    <div className="absolute top-12 left-0 z-50 bg-card border border-border rounded-xl shadow-xl p-4 w-80">
      <p className="text-sm font-medium mb-2">Insert link</p>
      <Input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onConfirm(url); }
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={() => onConfirm(url)} className="flex-1">
          Insert
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Image dialog
────────────────────────────────────────────── */
function ImageDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: (url: string, alt: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  return (
    <div className="absolute top-12 left-0 z-50 bg-card border border-border rounded-xl shadow-xl p-4 w-80">
      <p className="text-sm font-medium mb-3">Insert image</p>
      <div className="space-y-2">
        <Input
          autoFocus
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Image URL (https://...)"
        />
        <Input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Alt text (description)"
        />
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={() => onConfirm(url, alt)} disabled={!url} className="flex-1">
          Insert
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main TiptapEditor
────────────────────────────────────────────── */
interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Start writing your post...",
  minHeight = 400,
}: TiptapEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-2" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full my-4" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "outline-none",
          // Prose-like styles applied via Tailwind
          "[&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4",
          "[&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3",
          "[&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3",
          "[&_p]:mb-4 [&_p]:leading-relaxed [&_p.is-editor-empty:first-child:before]:text-muted-foreground [&_p.is-editor-empty:first-child:before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child:before]:pointer-events-none [&_p.is-editor-empty:first-child:before]:float-left [&_p.is-editor-empty:first-child:before]:h-0",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1",
          "[&_li]:leading-relaxed",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6",
          "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
          "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono",
          "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-4",
          "[&_hr]:border-border [&_hr]:my-8",
          "[&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-6",
          "[&_strong]:font-semibold",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const setLink = useCallback(
    (url: string) => {
      if (!editor) return;
      setShowLinkDialog(false);
      if (!url) return;
      editor.chain().focus().setLink({ href: url }).run();
    },
    [editor]
  );

  const insertImage = useCallback(
    (url: string, alt: string) => {
      if (!editor || !url) return;
      setShowImageDialog(false);
      editor.chain().focus().setImage({ src: url, alt }).run();
    },
    [editor]
  );

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words() ?? 0;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="relative flex flex-wrap items-center gap-0.5 px-3 py-2 bg-muted/40 border-b border-border">
        {/* History */}
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Headings */}
        <ToolbarBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Formatting */}
        <ToolbarBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn title="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Ordered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn title="Align Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Align Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Align Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <ToolbarBtn title="Insert Link" active={editor.isActive("link")} onClick={() => setShowLinkDialog((v) => !v)}>
          <LinkIcon className="w-4 h-4" />
        </ToolbarBtn>
        {editor.isActive("link") && (
          <ToolbarBtn title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Unlink className="w-4 h-4" />
          </ToolbarBtn>
        )}

        {/* Image */}
        <ToolbarBtn title="Insert Image" onClick={() => setShowImageDialog((v) => !v)}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarBtn>

        {/* Dialogs */}
        {showLinkDialog && (
          <LinkDialog
            onConfirm={setLink}
            onCancel={() => setShowLinkDialog(false)}
            initial={editor.getAttributes("link").href || ""}
          />
        )}
        {showImageDialog && (
          <ImageDialog
            onConfirm={insertImage}
            onCancel={() => setShowImageDialog(false)}
          />
        )}
      </div>

      {/* Editor area */}
      <div className="px-5 py-4" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>

      {/* Footer: word count */}
      <div className="flex justify-end px-4 py-2 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground tabular-nums">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
