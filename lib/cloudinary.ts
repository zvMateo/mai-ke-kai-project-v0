"use server";

import { httpClient } from "@/lib/http-client";

/**
 * Cloudinary Integration for Mai Ke Kai
 *
 * Configuration:
 * - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: Your cloud name
 * - CLOUDINARY_API_KEY: API key for server-side operations
 * - CLOUDINARY_API_SECRET: API secret for signing uploads
 * - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: Unsigned upload preset name
 *
 * Setup Instructions:
 * 1. Create account at cloudinary.com
 * 2. Get cloud name from dashboard
 * 3. Create unsigned upload preset: Settings > Upload > Add upload preset
 *    - Set to "Unsigned" mode
 *    - Configure folder: "mai-ke-kai"
 *    - Set transformation: Limit to 2048px width
 * 4. Add env vars to Vercel
 */

// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
  uploadPreset:
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "mai-ke-kai",
};

export async function getCloudinaryConfig() {
  return cloudinaryConfig;
}

export async function validateCloudinaryConfig(): Promise<{
  isValid: boolean;
  missing: string[];
}> {
  const missing: string[] = [];

  if (!cloudinaryConfig.cloudName)
    missing.push("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  if (!cloudinaryConfig.apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!cloudinaryConfig.apiSecret) missing.push("CLOUDINARY_API_SECRET");

  return {
    isValid: missing.length === 0,
    missing,
  };
}

// Generate Cloudinary upload signature for secure uploads
export async function generateUploadSignature(folder = "mai-ke-kai") {
  const validation = await validateCloudinaryConfig();
  if (!validation.isValid) {
    throw new Error(
      `Cloudinary not configured. Missing: ${validation.missing.join(", ")}`
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp: timestamp.toString(),
    folder,
    upload_preset: cloudinaryConfig.uploadPreset,
  };

  // Create signature string
  const crypto = await import("crypto");
  const paramsString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const signature = crypto
    .createHash("sha256")
    .update(paramsString + cloudinaryConfig.apiSecret)
    .digest("hex");

  return {
    signature,
    timestamp,
    cloudName: cloudinaryConfig.cloudName,
    apiKey: cloudinaryConfig.apiKey,
    folder,
    uploadPreset: cloudinaryConfig.uploadPreset,
  };
}

export async function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "jpg" | "png" | "webp";
    crop?: "fill" | "fit" | "scale" | "limit";
  } = {}
): Promise<string> {
  const {
    width = 800,
    height,
    quality = "auto",
    format = "auto",
    crop = "fill",
  } = options;

  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;

  const transformations = [
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    format !== "auto" && `f_${format}`,
  ]
    .filter(Boolean)
    .join(",");

  return `${baseUrl}/${transformations}/${publicId}`;
}

export async function extractPublicId(
  cloudinaryUrl: string
): Promise<string | null> {
  try {
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split("/");
    const uploadIndex = pathParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    // Get everything after transformations
    const publicIdParts = pathParts.slice(uploadIndex + 2); // Skip 'upload' and transformations
    const publicIdWithExtension = publicIdParts.join("/");

    // Remove extension
    return publicIdWithExtension.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

// Delete image from Cloudinary
export async function deleteCloudinaryImage(
  publicId: string
): Promise<boolean> {
  const validation = await validateCloudinaryConfig();
  if (!validation.isValid) {
    console.error("Cloudinary not configured properly");
    return false;
  }

  try {
    const crypto = await import("crypto");
    const timestamp = Math.round(Date.now() / 1000);

    const signature = crypto
      .createHash("sha256")
      .update(
        `public_id=${publicId}&timestamp=${timestamp}${cloudinaryConfig.apiSecret}`
      )
      .digest("hex");

    const response = await httpClient.post(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`,
      {
        public_id: publicId,
        timestamp,
        api_key: cloudinaryConfig.apiKey,
        signature,
      }
    );

    return response.data.result === "ok";
  } catch (error) {
    console.error("Error deleting Cloudinary image:", error);
    return false;
  }
}
