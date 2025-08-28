// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === process.env.APP_USERNAME && password === process.env.APP_PASSWORD) {
      const response = NextResponse.json({ message: "Logged in" }, { status: 200 });
      
      response.cookies.set("token", "loggedin", {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60, // 1 hour
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    } else {
      return NextResponse.json({ message: "Invalid Credentials" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}