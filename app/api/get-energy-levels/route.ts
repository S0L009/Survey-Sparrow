import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const k = parseInt(searchParams.get("k") ?? "10", 10);

  try {
    // Pass k to your backend API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/game2/energy-levels?k=${k}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ status: false, message: "Backend error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (err) {
    return NextResponse.json({ status: false, message: "Failed to fetch analogies" }, { status: 500 });
  }
}
