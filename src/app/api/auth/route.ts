import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Please provide both staff email and password." }, { status: 400 });
    }

    const user = await verifyCredentials(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials. Please check your staff email and password." }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal authentication error." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    service: "PAKMEC Precision Engineering Authentication Gateway",
    status: "online",
    rbac: "active"
  });
}

