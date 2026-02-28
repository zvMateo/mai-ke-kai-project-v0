import { getAllServiceCategories, getServicesCountByCategory } from "@/lib/actions/service-categories";
import { ServiceCategoriesClient } from "./service-categories-client";

export default async function ServiceCategoriesPage() {
  const categories = await getAllServiceCategories();
  
  // Get services count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      services_count: await getServicesCountByCategory(category.id),
    }))
  );

  return <ServiceCategoriesClient initialCategories={categoriesWithCount} />;
}
