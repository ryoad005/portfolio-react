"use client";

import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Typography variant="h4" align="center" gutterBottom>
        メニュー
      </Typography>

      <Stack spacing={2} sx={{ mt: 4 }}>
        <Button
          component={Link}
          href="/trades"
          variant="contained"
          size="large"
        >
          取引一覧
        </Button>

        {/* 将来的に在庫管理や他のページも増やせる */}
        {/* <Button component={Link} href="/inventory" variant="outlined" size="large">
          在庫管理
        </Button> */}
      </Stack>
    </Container>
  );
}
