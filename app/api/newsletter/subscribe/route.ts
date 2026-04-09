import { NextResponse } from "next/server";
import { subscribeSchema, upsertSubscriber } from "@/lib/newsletter";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = subscribeSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid subscription data" },
        { status: 400 },
      );
    }

    const result = await upsertSubscriber(parsed.data);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Subscription updated successfully" });
  } catch {
    return NextResponse.json(
      { message: "Unable to subscribe right now" },
      { status: 500 },
    );
  }
}
