import { NextResponse } from "next/server";
import { verifyCredentials, getUserByRole, SEEDED_USERS } from "@/lib/auth";
import { UserRole } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, role } = body;

    // Quick demo switch
    if (action === "switch-role" && role) {
      const user = getUserByRole(role as UserRole);
      return NextResponse.json({ success: true, user });
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Please provide both email and password" }, { status: 400 });
    }

    const user = await verifyCredentials(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials. Use admin@pakmec.com / pakmec2026!" }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  // Return list of available demo profiles for easy testing
  const demoUsers = SEEDED_USERS.map(({ passwordHash, ...u }) => u);
  return NextResponse.json({ demoUsers });
}
