import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ListResponse = {
  total: number;
  page: number;
  pageSize: number;  rows: any[];
};

export async function GET(req: Request): Promise<NextResponse<ListResponse>> {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 0);
  const pageSize = Number(searchParams.get("pageSize") ?? 50);
  const skip = page * pageSize;
  const take = pageSize;

  const [total, rows] = await Promise.all([
    prisma.trade.count(),
    prisma.trade.findMany({
      orderBy: { tradeDate: "desc" },
      skip,
      take,
    }),
  ]);

  return NextResponse.json({ total, page, pageSize, rows });
}

type PostOk = { ok: true };
type PostErr = { error: string };

export async function POST(req: Request): Promise<NextResponse<PostOk | PostErr>> {
  try {
    const body = await req.json();
    // amount は quantity × price に再計算
    const data = {
      ...body,
      tradeDate: new Date(body.tradeDate),
      amount: Number(body.quantity) * Number(body.price),
    };
    await prisma.trade.create({ data });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "failed" }, { status: 400 });
  }
}