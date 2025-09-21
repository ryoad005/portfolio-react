import { NextResponse } from "next/server";
import { Trade } from "@/types/trade";

const g = globalThis as any;
const db = (g.__TRADE_DB__ ??= []) as Trade[];

// GET /api/trades/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const row = db.find((r) => r.id === params.id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}

// PUT /api/trades/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = (await req.json()) as Trade;
  const idx = db.findIndex((r) => r.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  db[idx] = body;
  return NextResponse.json({ ok: true });
}

// DELETE /api/trades/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const idx = db.findIndex((r) => r.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  db.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
