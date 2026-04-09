import { NextResponse } from "next/server";
import { z } from "zod";
import { unsubscribeByToken } from "@/lib/newsletter";

const tokenSchema = z.string().uuid();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";
  const parsedToken = tokenSchema.safeParse(token);

  if (!parsedToken.success) {
    return NextResponse.json(
      { message: "Invalid unsubscribe token" },
      { status: 400 },
    );
  }

  const result = await unsubscribeByToken(parsedToken.data);
  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 404 });
  }

  return NextResponse.json({ message: "You have been unsubscribed" });
}
