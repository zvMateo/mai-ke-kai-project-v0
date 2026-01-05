"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const images = Array.isArray(value) ? value : value ? [value] : []

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      // Check Cloudinary config
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary no está configurado. Contacta al administrador.")
      }

      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`El archivo ${file.name} no es una imagen válida`)
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`El archivo ${file.name} es muy grande. Máximo 5MB.`)
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", uploadPreset)
        formData.append("folder", folder)

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Error al subir la imagen a Cloudinary")
        }

        const data = await response.json()
        uploadedUrls.push(data.secure_url)
      }

      // Update value
      if (multiple) {
        const newImages = [...images, ...uploadedUrls].slice(0, maxFiles)
        onChange(newImages)
      } else {
        onChange(uploadedUrls[0])
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Error al subir imagen")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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
