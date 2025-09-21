"use client";

import Link from "next/link";
import { Drawer, List, ListItemButton, ListItemText, Toolbar } from "@mui/material";

export const drawerWidth = 220;

export default function SideNav() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <List>
        <ListItemButton component={Link} href="/">
          <ListItemText primary="メニュー" />
        </ListItemButton>
        <ListItemButton component={Link} href="/trades">
          <ListItemText primary="取引一覧" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
