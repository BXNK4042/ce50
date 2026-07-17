import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  try {
    const { lang } = await params;
    const body = await request.json();
    const { username, password, email, fullName } = body;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    const response = await fetch(`${backendUrl}/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        email,
        fullName,
        role: "writer", // Default role for self-registration
        year: 1,        // Default year
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.detail || "Registration failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register API route error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
