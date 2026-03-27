import { NextResponse } from "next/server";
import { migrate } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  try {
    await migrate();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
