import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // Import icon menu
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
const collapsedWidth = 64;

export default function Topbar({ open, handleDrawerToggle, drawerWidth }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: open
          ? `calc(100% - ${drawerWidth}px)`
          : `calc(100% - ${collapsedWidth}px)`,
        ml: open ? `${drawerWidth}px` : `${collapsedWidth}px`,
        transition: "width 0.3s, margin 0.3s",
      }}
    >
      <Toolbar>
        {/* Nút đóng/mở Sidebar */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" noWrap>
            Hệ thống quản lý trường học
          </Typography>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography>
              {user
                ? `Xin chào, ${user.username} (${user.role})`
                : "Chưa đăng nhập"}
            </Typography>
            {user && (
              <Button color="inherit" onClick={handleLogout}>
                Đăng xuất
              </Button>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
