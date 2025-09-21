"use client";

import * as React from "react";
import { AppBar, Box, CssBaseline, Toolbar, Typography } from "@mui/material";
import SideNav, { drawerWidth } from "./components/SideNav";

// DatePicker 用（これは必要）
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* ヘッダー */}
          <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" noWrap>
                取引管理ポートフォリオ
              </Typography>
            </Toolbar>
          </AppBar>

          {/* サイドメニュー */}
          <SideNav />

          {/* メイン */}
          <Box
            component="main"
            sx={{ ml: `${drawerWidth}px`, mt: (t) => t.spacing(8), p: 3 }}
          >
            {children}
          </Box>
        </LocalizationProvider>
      </body>
    </html>
  );
}
