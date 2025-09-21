import { NextResponse, NextRequest } from "next/server";
import { Trade } from "@/types/trade";

declare global {
  // eslint-disable-next-line no-var
  var __TRADE_DB__: Trade[] | undefined;
}

function getDb(): Trade[] {
  globalThis.__TRADE_DB__ ??= [];
  return globalThis.__TRADE_DB__!;
}

type Ok = { ok: true };
type Err = { error: string };

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; // ★ await が必要
  const db = getDb();
  const row = db.find((r) => r.id === id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = (await req.json()) as Trade;
  const idx = db.findIndex((r) => r.id === id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  db[idx] = body;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  const idx = db.findIndex((r) => r.id === id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  db.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
