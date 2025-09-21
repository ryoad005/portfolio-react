import { NextResponse } from "next/server";
import { Trade } from "@/types/trade";

// インメモリDB（開発用・再起動で初期化）
const g = globalThis as any;
g.__TRADE_DB__ = g.__TRADE_DB__ ?? ([
  { id:"t1", tradeDate:"2025/09/12", counterparty:"ABC商事", type:"文房具", itemSku:"A-100", itemName:"ノート", quantity:10, price:150, amount:1500, status:"CONFIRMED" },
  { id:"t2", tradeDate:"2025/09/15", counterparty:"DEF物産", type:"食品",   itemSku:"B-200", itemName:"パン",   quantity:50, price:80,  amount:4000, status:"NEW" },
  { id:"t3", tradeDate:"2025/09/18", counterparty:"GHI貿易", type:"文房具", itemSku:"A-100", itemName:"ノート", quantity:5,  price:160, amount:800,  status:"CANCELLED" },
] satisfies Trade[]);
const db = g.__TRADE_DB__ as Trade[];

// GET /api/trades?page=&pageSize=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 0);
  const pageSize = Number(searchParams.get("pageSize") ?? 50);
  const start = page * pageSize;
  const rows = db.slice(start, start + pageSize);
  return NextResponse.json({ total: db.length, page, pageSize, rows });
}

// POST /api/trades  新規追加
export async function POST(req: Request) {
  const body = (await req.json()) as Trade;
  const exists = db.some((r) => r.id === body.id);
  if (exists) return NextResponse.json({ error: "id already exists" }, { status: 400 });
  db.push(body);
  return NextResponse.json({ ok: true });
}
