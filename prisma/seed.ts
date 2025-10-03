import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const samples = [
    { tradeDate: new Date("2025-09-12"), counterparty: "ABC商事", type: "文房具", itemSku: "SKU-0001", itemName: "ノート", quantity: 10, price: 150, amount: 1500, status: "CONFIRMED" },
    { tradeDate: new Date("2025-09-15"), counterparty: "DEF物産", type: "食品",   itemSku: "SKU-0002", itemName: "パン",   quantity: 50, price: 80,  amount: 4000, status: "NEW" },
    { tradeDate: new Date("2025-09-18"), counterparty: "GHI貿易", type: "家電",   itemSku: "SKU-0003", itemName: "ヘッドホン", quantity: 5,  price: 16000, amount: 80000, status: "CANCELLED" },
  ];

  for (const s of samples) {
    await prisma.trade.create({ data: s });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });