// src/api/http.js
export const API_URL = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("access_token") || "";
}

function forceLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("auth_user");
  // bắn event cho app biết để redirect/login lại
  window.dispatchEvent(new Event("auth:logout"));
}

async function request(method, url, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  const res = await fetch(API_URL + url, options);

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  // ✅ auto clear nếu 401
  if (res.status === 401) {
    forceLogout();
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  if (!res.ok) {
    const msg =
      (data &&
        data.message &&
        (Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export const apiGet = (url) => request("GET", url);
export const apiPost = (url, body) => request("POST", url, body);
export const apiPut = (url, body) => request("PUT", url, body);
export const apiDelete = (url) => request("DELETE", url);
