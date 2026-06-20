import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const finaraUrl = process.env.FINARA_API_URL || "http://localhost:3001/api/finara/keuangan-wisuda";
    const secret = process.env.PANDAWA_FINARA_SECRET || "pandawa-secret-key-123";

    const response = await fetch(finaraUrl, {
      method: "GET",
      headers: {
        "x-api-key": secret,
      },
    });

    if (!response.ok) {
      throw new Error(`FINARA returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ queue: data.queue || [] });
  } catch (error) {
    console.error("Error fetching FINARA queue:", error);
    return NextResponse.json({ error: "Failed to fetch from FINARA" }, { status: 500 });
  }
}
