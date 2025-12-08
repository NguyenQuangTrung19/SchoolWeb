// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username, role }
  const [loading, setLoading] = useState(true);

  // Load từ localStorage khi reload trang
  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse auth_user:", e);
      }
    }
    setLoading(false);
  }, []);

  // 🔐 MOCK LOGIN: tạm phân role dựa trên username
  const login = async (username, password) => {
    // TODO: sau này gọi API thật ở đây

    // Demo: check trống
    if (!username || !password) {
      throw new Error("Vui lòng nhập tên đăng nhập và mật khẩu");
    }

    const u = username.toLowerCase();
    let role = "STUDENT";
    if (u.startsWith("admin")) role = "ADMIN";
    else if (u.startsWith("gv") || u.startsWith("teacher")) role = "TEACHER";
    else if (u.startsWith("hs") || u.startsWith("student")) role = "STUDENT";

    const loggedUser = { username, role };
    setUser(loggedUser);
    localStorage.setItem("auth_user", JSON.stringify(loggedUser));
    return loggedUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook tiện dùng
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
