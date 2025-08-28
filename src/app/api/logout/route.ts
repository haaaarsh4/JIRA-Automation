// app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    
    // Clear the token cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0, // Expire immediately
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    console.log("User logged out successfully");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}