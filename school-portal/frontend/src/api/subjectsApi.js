// src/api/subjectsApi.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getSubjects({
  page = 0,
  pageSize = 10,
  search = "",
  grade = "ALL",
}) {
  const params = new URLSearchParams({
    page,
    pageSize,
    search,
    grade,
  });

  const res = await fetch(`${API_URL}/subjects?${params.toString()}`);
  if (!res.ok) throw new Error("Không tải được danh sách môn học");
  return res.json(); // { data, total }
}

export async function createSubject(payload) {
  const res = await fetch(`${API_URL}/subjects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không tạo được môn học");
  return res.json();
}

export async function updateSubject(id, payload) {
  const res = await fetch(`${API_URL}/subjects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không cập nhật được môn học");
  return res.json();
}

export async function deleteSubject(id) {
  const res = await fetch(`${API_URL}/subjects/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Không xóa được môn học");
  return true;
}
