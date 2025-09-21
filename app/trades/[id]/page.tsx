import { Box, Typography } from "@mui/material";

export default function TradeDetailPage({ params }: { params: { id: string } }) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        取引詳細（ID: {params.id}）
      </Typography>
      {/* ここに詳細情報を表示。後でAPIからfetchして内容を描画 */}
    </Box>
  );
}
