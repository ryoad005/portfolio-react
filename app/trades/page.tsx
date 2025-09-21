"use client";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridRowId,
} from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { Trade } from "@/types/trade";

type RowWithFlags = Trade & { _isNew?: boolean }; // 新規行フラグ

export default function TradesPage() {
  const [rows, setRows] = useState<RowWithFlags[]>([]);
  const [originalRows, setOriginalRows] = useState<Trade[]>([]); // キャンセル用
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  // v8: 選択モデルはオブジェクト { type, ids }
  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  // 差分管理
  const [addedIds, setAddedIds] = useState<Set<GridRowId>>(new Set());
  const [editedIds, setEditedIds] = useState<Set<GridRowId>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<GridRowId>>(new Set());

  // 一覧取得
  const fetchRows = async () => {
    setLoading(true);
    const res = await fetch("/api/trades?page=0&pageSize=200", {
      cache: "no-store",
    });
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

  useEffect(() => {
    fetchRows();
  }, []);

  // 編集時（ローカル反映のみ）
  const processRowUpdate = (newRow: RowWithFlags, oldRow: RowWithFlags) => {
    const recalced: RowWithFlags = {
      ...newRow,
      amount: Number(newRow.quantity) * Number(newRow.price),
    };
    if (!addedIds.has(recalced.id)) {
      const next = new Set(editedIds);
      next.add(recalced.id);
      setEditedIds(next);
    }
    setDirty(true);
    return recalced;
  };

  // 新規行追加
  const handleAddRow = () => {
    const id = `tmp-${Date.now()}`;
    const newRow: RowWithFlags = {
      id,
      tradeDate: new Date().toISOString().slice(0, 10),
      counterparty: "",
      type: "BUY",
      itemSku: "",
      itemName: "",
      quantity: 0,
      price: 0,
      amount: 0,
      status: "NEW",
      _isNew: true,
    };
    setRows((prev) => [newRow, ...prev]);
    const next = new Set(addedIds);
    next.add(id);
    setAddedIds(next);
    setDirty(true);
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
      if (nextAdded.has(id)) {
        nextAdded.delete(id); // 未保存行は消すだけ
      } else {
        nextDeleted.add(id); // 既存行は削除フラグへ
      }
      nextEdited.delete(id); // 編集フラグは不要に
    });

    setAddedIds(nextAdded);
    setDeletedIds(nextDeleted);
    setEditedIds(nextEdited);

    setDirty(true);
    setSelection({ type: "include", ids: new Set() }); // 選択解除
  };

  // 保存
  const handleSave = async () => {
    // 追加
    for (const id of addedIds) {
      const row = rows.find((r) => r.id === id);
      if (!row) continue;
      const payload = { ...row };
      delete (payload as any)._isNew;
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
      const payload = { ...row };
      delete (payload as any)._isNew;
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

    await fetchRows(); // リロード
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

  const columns: GridColDef<RowWithFlags>[] = useMemo(
    () => [
      { field: "tradeDate", headerName: "取引日", flex: 1, editable: true },
      { field: "counterparty", headerName: "取引先", flex: 1.2, editable: true },
      { field: "type", headerName: "種別", flex: 0.8, editable: true },
      { field: "itemSku", headerName: "SKU", flex: 1, editable: true },
      { field: "itemName", headerName: "商品名", flex: 1.2, editable: true },
      {
        field: "quantity",
        headerName: "数量",
        type: "number",
        flex: 0.8,
        editable: true,
      },
      {
        field: "price",
        headerName: "単価",
        type: "number",
        flex: 0.8,
        editable: true,
      },
      {
        field: "amount",
        headerName: "金額",
        type: "number",
        flex: 1,
      }, // 自動計算のみ
      { field: "status", headerName: "ステータス", flex: 1, editable: true },
    ],
    []
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        取引一覧（追加・編集・削除 → 一括保存/キャンセル）
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
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
      </Stack>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid<RowWithFlags>
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          rowSelectionModel={selection}
          onRowSelectionModelChange={(m) =>
            setSelection(m as GridRowSelectionModel)
          }
          processRowUpdate={processRowUpdate}
          experimentalFeatures={{ newEditingApi: true } as any}
          sx={{
            "& .MuiDataGrid-row.Mui-selected": { backgroundColor: "action.selected" },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "action.hover",
              cursor: "cell",
            },
          }}
        />
      </div>
    </Box>
  );
}
