import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type Ok = { ok: true };
type Err = { error: string };

// Next App Router: 第二引数で { params } を直接受け取る
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // 受け取った body から id を除外してから update に渡す
    const body = await req.json();
    const { id: _ignore, ...payload } = body;

    const data = {
      ...payload,
      tradeDate: new Date(payload.tradeDate),
      amount: Number(payload.quantity) * Number(payload.price),
    };

    await prisma.trade.update({ where: { id }, data });
    return NextResponse.json({ ok: true } satisfies Ok);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "failed" } satisfies Err, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.trade.delete({ where: { id } });
    return NextResponse.json({ ok: true } satisfies Ok);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "failed" } satisfies Err, { status: 400 });
  }
}
