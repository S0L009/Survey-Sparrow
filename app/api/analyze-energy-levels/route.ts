import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { audioBase64, promptTimestamps, topic } = body;

    if (!audioBase64 || !Array.isArray(promptTimestamps) || !topic) {
      return NextResponse.json(
        { status: false, error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    // Call the external API
    const externalRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/game2/analyze-energies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64, promptTimestamps, topic }),
    });

    if (!externalRes.ok) {
      const errText = await externalRes.text();
      return NextResponse.json(
        { status: false, error: `External API error: ${externalRes.status} ${errText}` },
        { status: 502 }
      );
    }

    const externalData = await externalRes.json();

    // Return external API response directly, unwrapped
    return NextResponse.json(externalData);

  } catch (error: any) {
    return NextResponse.json(
      { status: false, error: error.message || "Invalid request" },
      { status: 400 }
    );
  }
}
