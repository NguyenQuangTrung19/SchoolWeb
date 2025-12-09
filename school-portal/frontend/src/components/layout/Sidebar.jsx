import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Divider,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "@mui/material/styles";

// ICONS
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FaceOutlinedIcon from "@mui/icons-material/FaceOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import CollectionsBookmarkOutlinedIcon from "@mui/icons-material/CollectionsBookmarkOutlined";

import BarChartIcon from "@mui/icons-material/BarChart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";

const collapsedWidth = 64;

export default function Sidebar({ open, drawerWidth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();

  if (!user) return null;

  const isCollapsed = !open;

  // ===== MENU CONFIG THEO ROLE =====
  const menuConfig = {
    ADMIN: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: <DashboardOutlinedIcon />,
      },
      {
        label: "Users (accounts)",
        path: "/admin/users",
        icon: <PeopleOutlineIcon />,
      },
      {
        label: "Teachers",
        path: "/admin/teachers",
        icon: <SchoolOutlinedIcon />,
      },
      {
        label: "Students",
        path: "/admin/students",
        icon: <FaceOutlinedIcon />,
      },
      { label: "Lớp học", path: "/admin/classes", icon: <ClassOutlinedIcon /> },
      {
        label: "Môn học",
        path: "/admin/subjects",
        icon: <MenuBookOutlinedIcon />,
      },
      {
        label: "Phân công dạy",
        path: "/admin/assign-teaching",
        icon: <AssignmentIndOutlinedIcon />,
      },
    ],
    TEACHER: [
      {
        label: "Dashboard",
        path: "/teacher/dashboard",
        icon: <DashboardOutlinedIcon />,
      },
      {
        label: "Teachers",
        path: "/admin/teachers",
        icon: <SchoolOutlinedIcon />,
      },
      {
        label: "Students",
        path: "/admin/students",
        icon: <FaceOutlinedIcon />,
      },
      {
        label: "Lớp tôi dạy",
        path: "/teacher/classes",
        icon: <CollectionsBookmarkOutlinedIcon />,
      },
    ],
    STUDENT: [
      {
        label: "Dashboard",
        path: "/student/dashboard",
        icon: <DashboardOutlinedIcon />,
      },
      { label: "Thông tin", path: "/student/info", icon: <PersonIcon /> },
      { label: "Điểm", path: "/student/scores", icon: <BarChartIcon /> },
      {
        label: "Điểm danh",
        path: "/student/attendance",
        icon: <AccessTimeIcon />,
      },
      {
        label: "Tài liệu học tập",
        path: "/student/materials",
        icon: <MenuBookIcon />,
      },
    ],
  };

  const menuItems = menuConfig[user.role] || [];

  // màu active/hover
  const activeBg = "rgba(255,255,255,0.16)";
  const hoverBg = "rgba(255,255,255,0.08)";

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        "& .MuiDrawer-paper": {
          width: isCollapsed ? collapsedWidth : drawerWidth,
          overflow: "hidden",
          transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          boxSizing: "border-box",

          /* 🌟 Bo góc Sidebar */
          // borderRadius: "16px",

          /* 🌟 Gradient nền */
          background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 40%, #0b1020 100%)`,
          color: "#fff",

          /* Shadow để Sidebar nổi hơn */
          boxShadow: "0px 4px 20px rgba(0,0,0,0.25)",

          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* HEADER SIDEBAR */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          px: isCollapsed ? 0 : 2,
          py: 1.5,
          minHeight: 56,
        }}
      >
        {/* Logo + title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              // borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SchoolOutlinedIcon fontSize="small" />
          </Box>
          {!isCollapsed && (
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ fontWeight: "bold", letterSpacing: 0.2 }}
            >
              School Portal
            </Typography>
          )}
        </Box>

        {/* Role chip */}
        {!isCollapsed && (
          <Chip
            size="small"
            label={user.role}
            sx={{
              ml: 1,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 500,
            }}
          />
        )}
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.12)",
          mb: 0.5,
        }}
      />

      {/* MENU */}
      <Box sx={{ flexGrow: 1, px: isCollapsed ? 0.5 : 1 }}>
        <List sx={{ py: 0 }}>
          {menuItems.map((item) => {
            const selected = location.pathname.startsWith(item.path);
            return (
              <Tooltip
                key={item.path}
                title={isCollapsed ? item.label : ""}
                placement="right"
                arrow
              >
                <ListItemButton
                  selected={selected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    position: "relative",
                    my: 0.5,
                    px: isCollapsed ? 1 : 1.5,
                    // borderRadius: "10px",
                    minHeight: 40,
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    transition:
                      "background-color 0.25s, transform 0.25s, padding 0.25s",
                    backgroundColor: selected ? activeBg : "transparent",
                    "&:hover": {
                      backgroundColor: hoverBg,
                      transform: selected
                        ? "translateX(2px)"
                        : "translateX(4px)",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: activeBg,
                    },
                    // vạch sáng bên trái khi active
                    "&::before": selected
                      ? {
                          content: '""',
                          position: "absolute",
                          left: 4,
                          top: 6,
                          bottom: 6,
                          width: 3,
                          // borderRadius: 999,
                          backgroundColor: "#fff",
                        }
                      : {},
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isCollapsed ? "auto" : 40,
                      color: "#fff",
                      mr: isCollapsed ? 0 : 1,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    sx={{
                      opacity: isCollapsed ? 0 : 1,
                      transition: "opacity 0.25s",
                      "& .MuiTypography-root": {
                        fontSize: 14,
                        fontWeight: selected ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* FOOTER NHỎ Ở DƯỚI */}
      <Box
        sx={{
          px: isCollapsed ? 0 : 2,
          py: 1,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          fontSize: 11,
          color: "rgba(255,255,255,0.7)",
          textAlign: isCollapsed ? "center" : "left",
        }}
      >
        {!isCollapsed ? (
          <>
            <Typography variant="caption" display="block">
              {user.username}
            </Typography>
            <Typography variant="caption" display="block">
              {user.role === "STUDENT"
                ? "Chúc bạn học tốt hôm nay ✨"
                : user.role === "TEACHER"
                ? "Chúc thầy/cô một ngày tốt lành 👩‍🏫"
                : "Quản trị hệ thống"}
            </Typography>
          </>
        ) : (
          <Typography variant="caption">v1.0</Typography>
        )}
      </Box>
    </Drawer>
  );
}
