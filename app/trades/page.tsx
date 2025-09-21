"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { format } from "date-fns";
import Papa from "papaparse";
import { Trade } from "@/types/trade";
import { useRouter } from "next/navigation";

type ApiResult = { total: number; rows: Trade[] };
const PAGE_SIZE_DEFAULT = 20;

export default function TradesPage() {
  const router = useRouter();

  const [rows, setRows] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // フィルタ
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // ページング
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE_DEFAULT,
  });

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "tradeDate", headerName: "取引日", flex: 1 },
      { field: "counterparty", headerName: "取引先", flex: 1.2 },
      { field: "type", headerName: "種別", flex: 0.8 },
      { field: "itemSku", headerName: "SKU", flex: 1 },
      { field: "itemName", headerName: "商品名", flex: 1.2 },
      { field: "quantity", headerName: "数量", type: "number", flex: 0.8 },
      { field: "price", headerName: "単価", type: "number", flex: 0.8 },
      { field: "amount", headerName: "金額", type: "number", flex: 1 },
      { field: "status", headerName: "ステータス", flex: 1 },
    ],
    []
  );

  const fetchRows = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(pagination.page));
    params.set("pageSize", String(pagination.pageSize));

    const res = await fetch(`/api/trades?${params.toString()}`, { cache: "no-store" });
    const json: ApiResult = await res.json();
    setRows(json.rows);
    setTotal(json.total);
    setLoading(false);
  };

  useEffect(() => {
    // 初回＆ページング変更時に検索
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize]);

  const onSearch = () => {
    // ページ先頭に戻して再検索
    setPagination(p => ({ ...p, page: 0 }));
    fetchRows();
  };

  const onClear = () => {
    setQ("");
    setStatus("");
    setFrom("");
    setTo("");
    setPagination({ page: 0, pageSize: PAGE_SIZE_DEFAULT });
    fetchRows();
  };

  const exportCSV = () => {
    const csv = Papa.unparse(
      rows.map(r => ({
        取引日: r.tradeDate,
        取引先: r.counterparty,
        種別: r.type,
        SKU: r.itemSku,
        商品名: r.itemName,
        数量: r.quantity,
        単価: r.price,
        金額: r.amount,
        ステータス: r.status,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trades_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>取引一覧</Typography>

      {/* フィルタ */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField label="検索（取引先/SKU/商品名）" value={q} onChange={e => setQ(e.target.value)} size="small" />
        <TextField label="ステータス" select value={status} onChange={e => setStatus(e.target.value)} size="small" sx={{ minWidth: 180 }}>
          <MenuItem value="">（すべて）</MenuItem>
          <MenuItem value="NEW">NEW</MenuItem>
          <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
          <MenuItem value="CANCELLED">CANCELLED</MenuItem>
        </TextField>
        <TextField label="From" type="date" value={from} onChange={e => setFrom(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="To"   type="date" value={to}   onChange={e => setTo(e.target.value)}   size="small" InputLabelProps={{ shrink: true }} />
        <Button variant="contained" onClick={onSearch}>検索</Button>
        <Button variant="outlined" onClick={onClear}>クリア</Button>
        <Button variant="text" onClick={exportCSV}>CSV出力</Button>
      </Stack>

      {/* テーブル */}
      <div style={{ height: 540, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          rowCount={total}
          paginationMode="server"
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          pageSizeOptions={[10, 20, 50]}
                  // ▼ ダブルクリックで詳細へ
          onRowDoubleClick={(params) => {
            router.push(`/trades/${params.id}`);
          }}

          // （保険）環境によっては onRowDoubleClick が効かない場合があるので、
          // ダブルクリック検知のフォールバック：
          onRowClick={(params, event) => {
            if ((event as React.MouseEvent).detail === 2) {
              router.push(`/trades/${params.id}`);
            }
          }}

          // 見た目のアクセント
          sx={{
            cursor: "pointer",
            "& .MuiDataGrid-row:hover": { backgroundColor: "action.hover" },
          }}
        />
      </div>
    </Box>
  );
}
