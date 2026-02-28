import { NextRequest, NextResponse } from "next/server";
import {
  updateServiceCategory,
  deleteServiceCategory,
} from "@/lib/actions/service-categories";

// PUT /api/admin/service-categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const category = await updateServiceCategory(id, body);
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/service-categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteServiceCategory(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
