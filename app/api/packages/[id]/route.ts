import { fetchPackageDetails } from "@/lib/actions/packages"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packageId } = await params

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      )
    }

    const pkg = await fetchPackageDetails(packageId)

    return NextResponse.json(pkg, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching package:", error)
    return NextResponse.json(
      { error: "Failed to fetch package" },
      { status: 404 }
    )
  }
}
