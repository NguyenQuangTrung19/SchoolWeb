const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getClasses({
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

  const res = await fetch(`${API_URL}/classes?${params.toString()}`);
  if (!res.ok) throw new Error("Không tải được danh sách lớp");
  return res.json(); // { data, total }
}

export async function createClass(payload) {
  const res = await fetch(`${API_URL}/classes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không tạo được lớp học");
  return res.json();
}

export async function updateClass(id, payload) {
  const res = await fetch(`${API_URL}/classes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không cập nhật được lớp học");
  return res.json();
}

export async function deleteClass(id) {
  const res = await fetch(`${API_URL}/classes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Không xóa được lớp học");
  return true;
}
