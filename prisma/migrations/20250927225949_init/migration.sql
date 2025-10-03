-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "tradeDate" TIMESTAMP(3) NOT NULL,
    "counterparty" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "itemSku" TEXT,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);
