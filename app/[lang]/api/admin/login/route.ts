import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  try {
    const { lang } = await params;
    const body = await request.json();
    const { username, password } = body;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    const response = await fetch(`${backendUrl}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.detail || "Invalid credentials" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const { access_token, role, year } = data;

    const res = NextResponse.json({ success: true, role, year });

    // Set HTTP-only Cookie for JWT token
    res.cookies.set("admin_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Set non-HTTP-only Cookies for client-side role and year details
    res.cookies.set("admin_role", role, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    res.cookies.set("admin_year", String(year), {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login API route error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
