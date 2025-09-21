import { NextResponse } from "next/server";
import { addDays, parseISO, isAfter, isBefore } from "date-fns";
import { Trade } from "@/types/trade";

// ひとまずインメモリのモック
const seed: Trade[] = [
  { id:"t1", tradeDate:"2025-09-12", counterparty:"ABC商事", type:"SELL", itemSku:"A-100", itemName:"ノート", quantity:10, price:150, amount:1500, status:"CONFIRMED" },
  { id:"t2", tradeDate:"2025-09-15", counterparty:"DEF物産", type:"BUY",  itemSku:"B-200", itemName:"ペン",   quantity:50, price:80,  amount:4000, status:"NEW" },
  { id:"t3", tradeDate:"2025-09-18", counterparty:"GHI貿易", type:"SELL", itemSku:"A-100", itemName:"ノート", quantity:5,  price:160, amount:800,  status:"CANCELLED" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // クエリ（任意）
  const q = (searchParams.get("q") || "").toLowerCase();
  const status = searchParams.get("status"); // NEW/CONFIRMED/CANCELLED
  const from = searchParams.get("from");     // YYYY-MM-DD
  const to = searchParams.get("to");         // YYYY-MM-DD
  const page = Number(searchParams.get("page") || "0");
  const pageSize = Number(searchParams.get("pageSize") || "20");

  let rows = [...seed];

  // フリーテキスト検索（取引先・SKU・商品名）
  if (q) {
    rows = rows.filter(r =>
      r.counterparty.toLowerCase().includes(q) ||
      r.itemSku.toLowerCase().includes(q) ||
      r.itemName.toLowerCase().includes(q)
    );
  }

  // ステータス
  if (status && ["NEW","CONFIRMED","CANCELLED"].includes(status)) {
    rows = rows.filter(r => r.status === status);
  }

  // 日付範囲（両端含む）
  if (from) {
    rows = rows.filter(r => !isBefore(parseISO(r.tradeDate), parseISO(from)));
  }
  if (to) {
    // to の当日を含めたいので +1 日未満
    rows = rows.filter(r => !isAfter(parseISO(r.tradeDate), addDays(parseISO(to), 0)));
  }

  // ソート（例：取引日降順）
  rows.sort((a, b) => (a.tradeDate < b.tradeDate ? 1 : -1));

  const total = rows.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const pageRows = rows.slice(start, end);

  return NextResponse.json({ total, rows: pageRows });
}
