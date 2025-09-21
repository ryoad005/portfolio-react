export type TradeType = "文房具" | "家電" | "食品";

export type Trade = {
  id: string;
  tradeDate: string;      // YYYY/MM/DD
  counterparty: string;   // 取引先
  type: TradeType;        // 種別（商品カテゴリ）
  itemSku: string;        // SKU（使わなくても可）
  itemName: string;       // 商品名
  quantity: number;       // 数量
  price: number;          // 単価
  amount: number;         // 金額（数量×単価）
  status: string;         // 任意（使わなくても可）
};
