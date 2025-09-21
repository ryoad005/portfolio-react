export type TradeStatus = "NEW" | "CONFIRMED" | "CANCELLED";
export type TradeType = "BUY" | "SELL";

export type Trade = {
  id: string;
  tradeDate: string;     // ISO (YYYY-MM-DD でOK)
  counterparty: string;
  type: TradeType;
  itemSku: string;
  itemName: string;
  quantity: number;
  price: number;
  amount: number;        // quantity * price
  status: TradeStatus;
  notes?: string;
};
