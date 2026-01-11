"use client"

import { useRef } from "react"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUploadImage } from "@/lib/queries"

interface ImageUploadProps {
  value?: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  maxFiles?: number
  folder?: string
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  folder = "mai-ke-kai",
  disabled = false,
  className,
}: ImageUploadProps) {
  const uploadMutation = useUploadImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const images = Array.isArray(value) ? value : value ? [value] : []
  const uploading = uploadMutation.isPending
  const error = uploadMutation.error?.message || null

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        const result = await uploadMutation.mutateAsync({ file, folder })
        uploadedUrls.push(result.url)
      } catch {
        // Error is already captured in mutation state
        break
      }
    }

    if (uploadedUrls.length > 0) {
      // Update value
      if (multiple) {
        const newImages = [...images, ...uploadedUrls].slice(0, maxFiles)
        onChange(newImages)
      } else {
        onChange(uploadedUrls[0])
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemove = (imageUrl: string) => {
    if (multiple) {
      const newImages = images.filter((img) => img !== imageUrl)
      onChange(newImages)
    } else {
      onChange("")
    }
  }

  const canUploadMore = multiple ? images.length < maxFiles : images.length === 0

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload button */}
      {canUploadMore && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => handleUpload(e.target.files)}
            disabled={disabled || uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {multiple ? "Subir imágenes" : "Subir imagen"}
              </>
            )}
          </Button>
          {multiple && (
            <p className="mt-1 text-xs text-muted-foreground">
              Máximo {maxFiles} imágenes. JPG, PNG o WebP hasta 5MB cada una.
            </p>
          )}
        </div>
      )}

      {/* Error message */}
      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((imageUrl, index) => (
            <div key={imageUrl} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={`Upload ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => handleRemove(imageUrl)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
                {index === 0 && multiple && (
                  <span className="absolute bottom-2 left-2 rounded bg-primary px-2 py-1 text-xs text-primary-foreground">
                    Principal
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
          <div className="text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">{multiple ? "No hay imágenes" : "No hay imagen"}</p>
          </div>
        </div>
      )}
    </div>
  )
}
