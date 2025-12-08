// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(username, password);

      // Nếu có "from" (trước đó bị redirect từ route bảo vệ) → quay lại
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Điều hướng theo role
      if (user.role === "ADMIN")
        navigate("/admin/dashboard", { replace: true });
      else if (user.role === "TEACHER")
        navigate("/teacher/dashboard", { replace: true });
      else if (user.role === "STUDENT")
        navigate("/student/dashboard", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10} p={4} boxShadow={3} borderRadius={2}>
        <Typography variant="h5" mb={3} textAlign="center">
          Đăng nhập hệ thống trường học
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên đăng nhập"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
            Đăng nhập
          </Button>
        </form>
      </Box>
    </Container>
  );
}
