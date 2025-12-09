// src/api/teachersApi.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getTeachers({
  page = 0,
  pageSize = 10,
  search = "",
  subject = "ALL",
  status = "ALL",
}) {
  const params = new URLSearchParams({
    page,
    pageSize,
    search,
    subject,
    status,
  });

  const res = await fetch(`${API_URL}/teachers?${params.toString()}`);
  if (!res.ok) throw new Error("Không tải được danh sách giáo viên");
  return res.json(); // { data, total }
}

export async function createTeacher(payload) {
  const res = await fetch(`${API_URL}/teachers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không tạo được giáo viên");
  return res.json();
}

export async function updateTeacher(id, payload) {
  const res = await fetch(`${API_URL}/teachers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không cập nhật được giáo viên");
  return res.json();
}

export async function deleteTeacher(id) {
  const res = await fetch(`${API_URL}/teachers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Không xóa được giáo viên");
  return true;
}

export async function getAllTeachers() {
  await sleep(200); // cho đồng bộ với các API mock khác
  return [...mockTeachers]; // trả về mảng giáo viên
}
