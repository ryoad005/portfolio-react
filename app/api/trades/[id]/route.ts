import { NextResponse } from "next/server";
import { Trade } from "@/types/trade";

declare global {
  // eslint-disable-next-line no-var
  var __TRADE_DB__: Trade[] | undefined;
}

function getDb(): Trade[] {
  globalThis.__TRADE_DB__ ??= [];
  return globalThis.__TRADE_DB__!;
}

type Params = { params: { id: string } };

type Ok = { ok: true };
type Err = { error: string };

export async function GET(_: Request, { params }: Params): Promise<NextResponse<Trade | Err>> {
  const db = getDb();
  const row = db.find((r) => r.id === params.id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: Request, { params }: Params): Promise<NextResponse<Ok | Err>> {
  const db = getDb();
  const body = (await req.json()) as Trade;
  const idx = db.findIndex((r) => r.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  db[idx] = body;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Params): Promise<NextResponse<Ok | Err>> {
  const db = getDb();
  const idx = db.findIndex((r) => r.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  db.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
