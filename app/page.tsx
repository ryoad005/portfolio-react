"use client";

import Link from "next/link";
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>メニュー</Typography>
      <Stack direction="row" spacing={2}>
        <Card sx={{ width: 260 }}>
          <CardActionArea component={Link} href="/trades">
            <CardContent>
              <Typography variant="h6">取引一覧</Typography>
              <Typography variant="body2" color="text.secondary">
                追加・編集・削除／一括保存のデモ
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Stack>
    </Box>
  );
}
