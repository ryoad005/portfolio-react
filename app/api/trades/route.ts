import { NextRequest, NextResponse } from "next/server";
import { Trade } from "@/types/trade";

// 共有インメモリDB（開発サーバー起動中のみ保持）
const g = globalThis as any;
g.__TRADE_DB__ = g.__TRADE_DB__ ?? [
  { id:"t1", tradeDate:"2025-09-12", counterparty:"ABC商事", type:"SELL", itemSku:"A-100", itemName:"ノート", quantity:10, price:150, amount:1500, status:"CONFIRMED" },
  { id:"t2", tradeDate:"2025-09-15", counterparty:"DEF物産", type:"BUY",  itemSku:"B-200", itemName:"ペン",   quantity:50, price:80,  amount:4000, status:"NEW" },
  { id:"t3", tradeDate:"2025-09-18", counterparty:"GHI貿易", type:"SELL", itemSku:"A-100", itemName:"ノート", quantity:5,  price:160, amount:800,  status:"CANCELLED" },
];
const db = g.__TRADE_DB__ as Trade[];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "0");
  const pageSize = Number(searchParams.get("pageSize") || "50");

  const rows = [...db].sort((a, b) => (a.tradeDate < b.tradeDate ? 1 : -1));
  const total = rows.length;
  const start = page * pageSize;
  const end = start + pageSize;
  return NextResponse.json({ total, rows: rows.slice(start, end) });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Omit<Trade,"id"|"amount"> & { id?: string };
  const id = body.id?.startsWith("tmp-") ? `t${Date.now()}` : (body.id ?? `t${Date.now()}`);
  const amount = Number(body.quantity) * Number(body.price);
  const newRow: Trade = { ...body, id, amount };
  db.unshift(newRow);
  return NextResponse.json(newRow, { status: 201 });
}
