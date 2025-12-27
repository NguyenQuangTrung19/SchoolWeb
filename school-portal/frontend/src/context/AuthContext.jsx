// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { apiPost } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const token = localStorage.getItem("access_token");

    // ✅ Nếu thiếu 1 trong 2 -> coi như logout sạch
    if (!storedUser || !token) {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("access_token");
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error("Failed to parse auth_user:", e);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("access_token");
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    if (!username || !password)
      throw new Error("Vui lòng nhập tên đăng nhập và mật khẩu");

    const res = await apiPost("/auth/login", { username, password });

    localStorage.setItem("access_token", res.access_token);
    localStorage.setItem("auth_user", JSON.stringify(res.user));
    setUser(res.user);

    return res.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
