"use client";

import * as React from "react";
import { AppBar, Box, CssBaseline, Toolbar, Typography } from "@mui/material";
import SideNav, { drawerWidth } from "./components/SideNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <CssBaseline />
        {/* 上部バー */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              取引管理ポートフォリオ
            </Typography>
          </Toolbar>
        </AppBar>

        {/* サイドナビ + メイン */}
        <SideNav />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: `${drawerWidth}px`,       // サイドバー幅ぶん左マージン
            mt: (theme) => theme.spacing(8), // AppBarの高さぶん上マージン (Toolbar相当)
            p: 3,
          }}
        >
          {children}
        </Box>
      </body>
    </html>
  );
}
