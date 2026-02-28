import { NextRequest, NextResponse } from "next/server";
import {
  getAllServiceCategories,
  createServiceCategory,
} from "@/lib/actions/service-categories";

// GET /api/admin/service-categories
export async function GET() {
  try {
    const categories = await getAllServiceCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/admin/service-categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = await createServiceCategory(body);
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
