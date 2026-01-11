"use client";

import { useMutation } from "@tanstack/react-query";

interface UploadImageInput {
  file: File;
  folder: string;
}

interface UploadImageResult {
  url: string;
}

async function uploadImageToCloudinary({
  file,
  folder,
}: UploadImageInput): Promise<UploadImageResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary no está configurado. Contacta al administrador."
    );
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(`El archivo ${file.name} no es una imagen válida`);
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(`El archivo ${file.name} es muy grande. Máximo 5MB.`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Error al subir la imagen a Cloudinary");
  }

  const data = await response.json();
  return { url: data.secure_url };
}

export function useUploadImage() {
  return useMutation({
    mutationFn: uploadImageToCloudinary,
  });
}
