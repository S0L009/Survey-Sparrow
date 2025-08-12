import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse JSON body
    const { data } = await req.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "'data' must be an array" },
        { status: 400 }
      );
    }

    // Forward the data to your backend API
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/game1/get-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json(
        { error: "Backend error", details: text },
        { status: backendRes.status }
      );
    }

    const backendJson = await backendRes.json();

    // Log message if status is false
    if (backendJson.status === false) {
      console.error("Backend returned error message:", backendJson.message);
    }

    // Return backend response to frontend
    return NextResponse.json(backendJson);

  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Invalid request" },
      { status: 400 }
    );
  }
}
