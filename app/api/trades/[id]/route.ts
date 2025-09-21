import { NextRequest, NextResponse } from "next/server";
import { Trade } from "@/types/trade";

const g = globalThis as any;
const db = (g.__TRADE_DB__ ??= []) as Trade[];

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const row = db.find(r => r.id === params.id);
  return row ? NextResponse.json(row) : NextResponse.json({ message: "Not Found" }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const idx = db.findIndex(r => r.id === params.id);
  if (idx === -1) return NextResponse.json({ message: "Not Found" }, { status: 404 });

  const patch = await req.json() as Partial<Trade>;
  const merged = { ...db[idx], ...patch };
  merged.amount = Number(merged.quantity) * Number(merged.price);
  db[idx] = merged;
  return NextResponse.json(merged);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const idx = db.findIndex(r => r.id === params.id);
  if (idx === -1) return NextResponse.json({ message: "Not Found" }, { status: 404 });
  db.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
