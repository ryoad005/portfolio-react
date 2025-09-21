import { NextResponse } from "next/server";
import { Trade } from "@/types/trade";

/** globalThis に __TRADE_DB__ を安全に追加（宣言マージ） */
declare global {
  // eslint-disable-next-line no-var
  var __TRADE_DB__: Trade[] | undefined;
}

/** インメモリDBの取得（初期化もここで） */
function getDb(): Trade[] {
  if (!globalThis.__TRADE_DB__) {
    globalThis.__TRADE_DB__ = [
      { id:"t1", tradeDate:"2025/09/12", counterparty:"ABC商事", type:"文房具", itemSku:"A-100", itemName:"ノート", quantity:10, price:150, amount:1500, status:"CONFIRMED" },
      { id:"t2", tradeDate:"2025/09/15", counterparty:"DEF物産", type:"食品",   itemSku:"B-200", itemName:"パン",   quantity:50, price:80,  amount:4000, status:"NEW" },
      { id:"t3", tradeDate:"2025/09/18", counterparty:"GHI貿易", type:"文房具", itemSku:"A-100", itemName:"ノート", quantity:5,  price:160, amount:800,  status:"CANCELLED" },
    ];
  }
  return globalThis.__TRADE_DB__!;
}

type ListResponse = {
  total: number;
  page: number;
  pageSize: number;
  rows: Trade[];
};

export async function GET(req: Request): Promise<NextResponse<ListResponse>> {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 0);
  const pageSize = Number(searchParams.get("pageSize") ?? 50);
  const start = page * pageSize;
  const rows = db.slice(start, start + pageSize);
  return NextResponse.json({ total: db.length, page, pageSize, rows });
}

type PostOk = { ok: true };
type PostErr = { error: string };

export async function POST(req: Request): Promise<NextResponse<PostOk | PostErr>> {
  const db = getDb();
  const body = (await req.json()) as Trade;
  if (db.some((r) => r.id === body.id)) {
    return NextResponse.json({ error: "id already exists" }, { status: 400 });
  }
  db.push(body);
  return NextResponse.json({ ok: true });
}
