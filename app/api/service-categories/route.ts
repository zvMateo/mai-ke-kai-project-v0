import { NextResponse } from "next/server";
import { getServiceCategories } from "@/lib/actions/service-categories";

// GET /api/service-categories - Public endpoint for active categories
export async function GET() {
  try {
    const categories = await getServiceCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
