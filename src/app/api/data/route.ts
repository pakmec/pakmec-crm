import { NextResponse } from "next/server";
import { getAllData, syncEntity, purgeDemoData, resetAllData } from "@/lib/db";

export async function GET() {
  try {
    const data = await getAllData();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Failed to fetch database data:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { table, id, data, action } = body;

    // Handle special bulk operations
    if (action === "purge_demo") {
      await purgeDemoData();
      return NextResponse.json({ success: true, message: "Demo data purged successfully" });
    }

    if (action === "reset") {
      await resetAllData();
      return NextResponse.json({ success: true, message: "Database reset to defaults successfully" });
    }

    if (!table || !id) {
      return NextResponse.json({ error: "Missing required table or id" }, { status: 400 });
    }

    await syncEntity(table, id, data, action || "upsert");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to sync entity to database:", err);
    return NextResponse.json({ error: err.message || "Database sync failed" }, { status: 500 });
  }
}
