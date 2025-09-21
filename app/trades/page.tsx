"use client";

import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridRowId,
  GridRenderEditCellParams,
} from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Trade, TradeType } from "@/types/trade";

// ===== マスタ =====
const CATEGORY_OPTIONS: readonly TradeType[] = ["文房具", "家電", "食品"] as const;
const PRODUCTS_BY_CATEGORY: Record<TradeType, string[]> = {
  文房具: ["ノート", "ペン", "消しゴム", "定規", "ホッチキス"],
  家電:   ["ドライヤー", "掃除機", "電子レンジ", "炊飯器", "扇風機"],
  食品:   ["りんご", "パン", "コーヒー", "チョコレート", "牛乳"],
};

type RowWithFlags = Trade & { _isNew?: boolean };

// ===== CSV 出力ユーティリティ =====
function exportToCsv(rows: RowWithFlags[]) {
  // 出力したい列（見出しと値の取得方法）
  const columns: { header: string; getter: (r: RowWithFlags) => string | number }[] = [
    { header: "取引日",   getter: (r) => r.tradeDate },
    { header: "取引先",   getter: (r) => r.counterparty },
    { header: "種別",     getter: (r) => r.type },
    { header: "商品名",   getter: (r) => r.itemName },
    { header: "数量",     getter: (r) => r.quantity },
    { header: "単価",     getter: (r) => r.price },
    { header: "金額",     getter: (r) => r.amount },
  ];

  const esc = (v: string | number) => {
    const s = String(v ?? "");
    // カンマ / ダブルクォート / 改行 が含まれる場合は " で囲み、内部の " は "" にエスケープ
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    // ※ 数字はそのまま（カンマ区切りなどの整形はしない）
  };

  const header = columns.map((c) => esc(c.header)).join(",");
  const body = rows
    .map((r) => columns.map((c) => esc(c.getter(r))).join(","))
    .join("\r\n");

  const csv = `${header}\r\n${body}`;
  // Excel でも文字化けしないよう BOM 付き UTF-8
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8;" });

  const ts = dayjs().format("YYYYMMDD_HHmmss");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trades_${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function TradesPage() {
  const [rows, setRows] = useState<RowWithFlags[]>([]);
  const [originalRows, setOriginalRows] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  // v8: selection は { type, ids }
  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const [addedIds, setAddedIds] = useState<Set<GridRowId>>(new Set());
  const [editedIds, setEditedIds] = useState<Set<GridRowId>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<GridRowId>>(new Set());

  // 一覧取得
  const fetchRows = async () => {
    setLoading(true);
    const res = await fetch("/api/trades?page=0&pageSize=200", { cache: "no-store" });
    const json = await res.json();
    setRows(json.rows);
    setOriginalRows(json.rows);
    setLoading(false);
    setDirty(false);
    setAddedIds(new Set());
    setEditedIds(new Set());
    setDeletedIds(new Set());
    setSelection({ type: "include", ids: new Set() });
  };
  useEffect(() => { fetchRows(); }, []);

  // 編集（ローカルのみ）
  const processRowUpdate = (newRow: RowWithFlags, oldRow: RowWithFlags) => {
    const recalced: RowWithFlags = {
      ...newRow,
      amount: Number(newRow.quantity) * Number(newRow.price),
    };
    if (newRow.type !== oldRow.type) {
      const candidates = PRODUCTS_BY_CATEGORY[newRow.type] ?? [];
      if (!candidates.includes(newRow.itemName)) {
        recalced.itemName = "";
      }
    }
    if (!addedIds.has(recalced.id)) {
      const next = new Set(editedIds);
      next.add(recalced.id);
      setEditedIds(next);
    }
    setDirty(true);
    return recalced;
  };

  // 追加（末尾）
  const handleAddRow = () => {
    const id = `tmp-${Date.now()}`;
    const today = dayjs().format("YYYY/MM/DD");
    const defaultCat: TradeType = CATEGORY_OPTIONS[0];

    const newRow: RowWithFlags = {
      id,
      tradeDate: today,
      counterparty: "",
      type: defaultCat,
      itemSku: "",
      itemName: "",
      quantity: 0,
      price: 0,
      amount: 0,
      status: "",
      _isNew: true,
    };
    setRows((prev) => [...prev, newRow]);
    setAddedIds((prev) => new Set(prev).add(id));
    setDirty(true);
    setSelection((prev) => ({ type: "include", ids: new Set(prev.ids).add(id) }));
  };

  // 削除
  const handleDeleteSelected = () => {
    if (selection.ids.size === 0) return;
    if (!confirm(`${selection.ids.size}件を削除します。よろしいですか？`)) return;

    setRows((prev) => prev.filter((r) => !selection.ids.has(r.id)));

    const nextAdded = new Set(addedIds);
    const nextDeleted = new Set(deletedIds);
    const nextEdited = new Set(editedIds);

    selection.ids.forEach((id) => {
      if (nextAdded.has(id)) nextAdded.delete(id);
      else nextDeleted.add(id);
      nextEdited.delete(id);
    });

    setAddedIds(nextAdded);
    setDeletedIds(nextDeleted);
    setEditedIds(nextEdited);
    setDirty(true);
    setSelection({ type: "include", ids: new Set() });
  };

  // 保存（差分送信）
  const handleSave = async () => {
    // 追加
    for (const id of addedIds) {
      const row = rows.find((r) => r.id === id);
      if (!row) continue;
      const { _isNew: _ignored1, ...rest } = row;           // ★ any不要
      const payload: Trade = rest;                           // ★ 型がTradeに確定
      await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    // 更新
    for (const id of editedIds) {
      if (addedIds.has(id)) continue;
      const row = rows.find((r) => r.id === id);
      if (!row) continue;
      const { _isNew: _ignored2, ...rest } = row;           // ★ any不要
      const payload: Trade = rest;
      await fetch(`/api/trades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    // 削除
    for (const id of deletedIds) {
      await fetch(`/api/trades/${id}`, { method: "DELETE" });
    }
    await fetchRows();
  };

  // キャンセル
  const handleCancel = () => {
    setRows(originalRows);
    setAddedIds(new Set());
    setEditedIds(new Set());
    setDeletedIds(new Set());
    setDirty(false);
    setSelection({ type: "include", ids: new Set() });
  };

  // CSV 出力
  const handleExportCsv = () => {
    const ids = selection.ids;
    const target =
      ids.size > 0 ? rows.filter((r) => ids.has(r.id)) : rows;
    exportToCsv(target);
  };

  // 取引日セル（YYYY/MM/DD）
  const renderTradeDateEditCell = (
    params: GridRenderEditCellParams<RowWithFlags, string>
  ) => {
    const toDayjs = (v: string | null | undefined): Dayjs | null =>
      v ? dayjs(v, "YYYY/MM/DD", true) : null;
    const value = toDayjs(params.value);

    return (
      <DatePicker
        value={value}
        format="YYYY/MM/DD"
        onChange={(newValue) => {
          if (!newValue || !newValue.isValid()) {
            params.api.setEditCellValue({ id: params.id, field: params.field, value: "" });
            return;
          }
          params.api.setEditCellValue({
            id: params.id,
            field: params.field,
            value: newValue.format("YYYY/MM/DD"),
          });
        }}
        slotProps={{ textField: { size: "small" } }}
      />
    );
  };

  // 列
  const columns: GridColDef<RowWithFlags>[] = useMemo(
    () => [
      { field: "tradeDate", headerName: "取引日", flex: 1, editable: true, renderEditCell: renderTradeDateEditCell },
      { field: "counterparty", headerName: "取引先", flex: 1.2, editable: true },
      {
        field: "type",
        headerName: "種別",
        flex: 1,
        editable: true,
        type: "singleSelect",
        valueOptions: CATEGORY_OPTIONS as unknown as readonly string[],
      },
      {
        field: "itemName",
        headerName: "商品名",
        flex: 1.6,
        editable: true,
        type: "singleSelect",
        valueOptions: (params) =>
          PRODUCTS_BY_CATEGORY[(params.row as RowWithFlags).type] ?? [],
      },
      { field: "quantity", headerName: "数量", type: "number", flex: 0.8, editable: true },
      { field: "price", headerName: "単価", type: "number", flex: 0.8, editable: true },
      { field: "amount", headerName: "金額", type: "number", flex: 1 },
    ],
    []
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        取引一覧（追加・編集・削除 → 一括保存/キャンセル）
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={handleAddRow}>＋ 追加</Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteSelected}
          disabled={selection.ids.size === 0}
        >
          削除
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!dirty}>保存</Button>
        <Button variant="outlined" onClick={handleCancel} disabled={!dirty}>キャンセル</Button>
        <Button variant="outlined" onClick={handleExportCsv}>
          CSV出力（選択／全件）
        </Button>
      </Stack>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid<RowWithFlags>
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          rowSelectionModel={selection}
          onRowSelectionModelChange={(m) => setSelection(m as GridRowSelectionModel)}
          processRowUpdate={processRowUpdate}
          checkboxSelection
          sx={{
            "& .MuiDataGrid-row.Mui-selected": { backgroundColor: "action.selected" },
            "& .MuiDataGrid-row:hover": { backgroundColor: "action.hover", cursor: "cell" },
          }}
        />
      </div>
    </Box>
  );
}
