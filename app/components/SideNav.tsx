"use client";

import * as React from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Link from "next/link";
import { usePathname } from "next/navigation";

const drawerWidth = 240;

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  match?: (pathname: string) => boolean;
};

const items: NavItem[] = [
  { label: "メニュー", href: "/", icon: <DashboardIcon />, match: (p) => p === "/" },
  { label: "取引一覧", href: "/trades", icon: <ListAltIcon />, match: (p) => p.startsWith("/trades") },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      {/* AppBar の高さ分だけ余白 */}
      <Toolbar />
      <List>
        {items.map((item) => {
          const selected = item.match ? item.match(pathname) : pathname === item.href;
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}

export { drawerWidth };
