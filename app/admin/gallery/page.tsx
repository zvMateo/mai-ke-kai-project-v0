export const runtime = "edge";

import { getAllGalleryItems } from "@/lib/actions/gallery";
import { GalleryManagerClient } from "./gallery-manager-client";

export default async function AdminGalleryPage() {
  const items = await getAllGalleryItems();

  return <GalleryManagerClient initialItems={items} />;
}
