"use client";

import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRenderEditCellParams,
  useGridApiRef,
  GridRowModes,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Trade, TradeType } from "@/types/trade";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);


// ===== マスタ =====
const CATEGORY_OPTIONS: readonly TradeType[] = ["文房具", "家電", "食品"] as const;
const PRODUCTS_BY_CATEGORY: Record<TradeType, string[]> = {
  文房具: ["ノート", "ペン", "消しゴム", "定規", "ホッチキス"],
  家電: ["ドライヤー", "掃除機", "電子レンジ", "炊飯器", "扇風機"],
  食品: ["りんご", "パン", "コーヒー", "チョコレート", "牛乳"],
};

type RowWithFlags = Trade & { _isNew?: boolean };

// ===== CSV 出力ユーティリティ =====
function exportToCsv(rows: RowWithFlags[]) {
  const columns: { header: string; getter: (r: RowWithFlags) => string | number }[] = [
    { header: "取引日", getter: (r) => r.tradeDate },
    { header: "取引先", getter: (r) => r.counterparty },
    { header: "種別", getter: (r) => r.type },
    { header: "商品名", getter: (r) => r.itemName },
    { header: "数量", getter: (r) => r.quantity },
    { header: "単価", getter: (r) => r.price },
    { header: "金額", getter: (r) => r.amount ?? 0 },
  ];

  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = columns.map((c) => esc(c.header)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(c.getter(r))).join(",")).join("\r\n");
  const csv = `${header}\r\n${body}`;

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
  const apiRef = useGridApiRef();

  const [rows, setRows] = useState<RowWithFlags[]>([]);
  const [originalRows, setOriginalRows] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  // ★ あなたの版に合わせて { type, ids } 形式で管理
  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set<GridRowId>(),
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
    setSelection({ type: "include", ids: new Set() }); // 形式に合わせてリセット
  };
  useEffect(() => {
    fetchRows();
  }, []);

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

    if (!addedIds.has(recalced.id!)) {
      const next = new Set(editedIds);
      next.add(recalced.id!);
      setEditedIds(next);
    }
    setDirty(true);
    return recalced;
  };

  // 追加（末尾）
  const handleAddRow = () => {
    const id = `tmp-${Date.now()}`;
    const now = dayjs().format("YYYY/MM/DD HH:mm");
    const defaultCat: TradeType = CATEGORY_OPTIONS[0];

    const newRow: RowWithFlags = {
      id,
      tradeDate: now,
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
    setSelection((prev) => ({
      type: "include",
      ids: new Set(prev.ids).add(id),
    }));
  };

  // 削除
  const handleDeleteSelected = () => {
    const count = selection.ids.size;
    if (count === 0) return;
    if (!confirm(`${count}件を削除します。よろしいですか？`)) return;

    setRows((prev) => prev.filter((r) => !selection.ids.has(r.id!)));

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
    setSelection({ type: "include", ids: new Set() }); // 選択解除
  };

  // 未コミットの編集を確定（セレクタ非依存）
  const commitAllEdits = () => {
    const api = apiRef.current;
    if (!api) return;

    // RowModesModel が取得できる場合は、編集中の行だけ確定
    const getModel = (api as any).getRowModesModel?.bind(api);
    const rowModesModel: Record<string, { mode: string }> = getModel ? getModel() : {};
    if (rowModesModel && Object.keys(rowModesModel).length > 0) {
      for (const [id, state] of Object.entries(rowModesModel)) {
        if (state?.mode === GridRowModes.Edit) {
          api.stopRowEditMode({ id, ignoreModifications: false });
        }
      }
      return;
    }

    // フォールバック：全行に stop を打つ（編集中でない行には影響なし）
    for (const id of api.getRowModels().keys()) {
      try {
        api.stopRowEditMode({ id, ignoreModifications: false });
      } catch {
        /* no-op */
      }
    }
  };

  // 保存（差分送信）
  const handleSave = async () => {
    const api = apiRef.current;
    if (!api) return;

    // 1) 未コミットの編集を確定（processRowUpdate が発火）
    commitAllEdits();

    // 2) DataGrid の実態から最新行を取得（rows state ではなく）
    const snapshotRows = Array.from(api.getRowModels().values()) as RowWithFlags[];

    // 3) 追加
    for (const id of addedIds) {
      const row = snapshotRows.find((r) => r.id === id);
      if (!row) continue;
      const { _isNew: _ignored1, ...rest } = row;
      const payload: Trade = rest;
      await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    // 4) 更新
    for (const id of editedIds) {
      if (addedIds.has(id)) continue; // 追加と二重送信を避ける
      const row = snapshotRows.find((r) => r.id === id);
      if (!row) continue;
      const { _isNew: _ignored2, ...rest } = row;
      const payload: Trade = rest;
      await fetch(`/api/trades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    // 5) 削除
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
    const target = ids.size > 0 ? rows.filter((r) => r.id && ids.has(r.id)) : rows;
    exportToCsv(target);
  };

  // 取引日セル（YYYY/MM/DD）: ISO/フォーマット済みの両方を受ける
  const renderTradeDateEditCell = (
    params: GridRenderEditCellParams<RowWithFlags, string>
  ) => {
    const toDayjs = (v: string | null | undefined): Dayjs | null => {
      if (!v) return null;
      const iso = dayjs(v); // ISO想定
      if (iso.isValid()) return iso;
      const ymd = dayjs(v, "YYYY/MM/DD HH:mm", true); // 既に整形済み想定
      return ymd.isValid() ? ymd : null;
    };
    const value = toDayjs(params.value);

    return (
      <DateTimePicker
        value={value}
        format="YYYY/MM/DD HH:mm"
        onChange={(newValue) => {
          if (!newValue || !newValue.isValid()) {
            params.api.setEditCellValue({ id: params.id, field: params.field, value: "" });
            return;
          }
          params.api.setEditCellValue({
            id: params.id,
            field: params.field,
            value: newValue.format("YYYY/MM/DD HH:mm"),
          });
        }}
        slotProps={{ textField: { size: "small" } }}
      />
    );
  };

  // tradeDate 列だけ、値型を明示して型エラーを回避（GridValueFormatterParams は使わない）
  const tradeDateCol: GridColDef<RowWithFlags, string> = {
    field: "tradeDate",
    headerName: "取引日",
    flex: 1,
    editable: true,
    renderEditCell: renderTradeDateEditCell,
    renderCell: (params) => {
      const raw = params.row.tradeDate; // 行データから直接参照
      if (!raw) return "";

      // ISO か "YYYY/MM/DD" の両方をサポート
      const d1 = dayjs(raw);
      if (d1.isValid()) return d1.format("YYYY/MM/DD HH:mm");

      const d2 = dayjs(String(raw), "YYYY/MM/DD HH:mm", true);
      return d2.isValid() ? d2.format("YYYY/MM/DD HH:mm") : String(raw);
    },
  };

  // 列
  const columns: GridColDef<RowWithFlags>[] = useMemo(
    () => [
      tradeDateCol,
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
        <Button variant="contained" onClick={handleAddRow}>
          ＋ 追加
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteSelected}
          disabled={selection.ids.size === 0}
        >
          削除
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!dirty}>
          保存
        </Button>
        <Button variant="outlined" onClick={handleCancel} disabled={!dirty}>
          キャンセル
        </Button>
        <Button variant="outlined" onClick={handleExportCsv}>
          CSV出力（選択／全件）
        </Button>
      </Stack>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid<RowWithFlags>
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id!}
          loading={loading}
          // ★ あなたの版の型に合わせてそのまま渡す
          rowSelectionModel={selection}
          onRowSelectionModelChange={(m) => setSelection(m)}
          processRowUpdate={processRowUpdate}
          editMode="row"
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
