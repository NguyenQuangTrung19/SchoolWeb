// src/components/layout/AppLayout.jsx
import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const drawerWidth = 220;
const collapsedWidth = 64;

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(true);
  const sidebarOffset = -180;

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Truyền state và hàm toggle xuống Topbar */}
      <Topbar
        open={open}
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />

      {/* Truyền state open xuống Sidebar */}
      <Sidebar open={open} drawerWidth={drawerWidth} />

      {/* Phần nội dung chính: Tự động dịch chuyển khi sidebar đóng/mở */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          transition: "margin 0.3s, width 0.3s",
          marginLeft: open
            ? `${drawerWidth + sidebarOffset}px`
            : `${collapsedWidth + sidebarOffset + 150}px`,
          width: open
            ? `calc(100% - ${drawerWidth + sidebarOffset}px)`
            : `calc(100% - ${collapsedWidth + sidebarOffset}px)`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
