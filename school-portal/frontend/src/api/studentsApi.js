const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getStudents({
  page = 0,
  pageSize = 10,
  search = "",
  classId = "ALL",
  status = "ALL",
}) {
  const params = new URLSearchParams({
    page,
    pageSize,
    search,
    classId,
    status,
  });

  const res = await fetch(`${API_URL}/students?${params.toString()}`);
  if (!res.ok) throw new Error("Không tải được danh sách học sinh");
  return res.json(); // { data, total }
}

export async function getAllStudents() {
  // nếu cần tất cả (không phân trang):
  const res = await fetch(`${API_URL}/students?page=0&pageSize=10000`);
  if (!res.ok) throw new Error("Không tải được danh sách học sinh");
  const json = await res.json();
  return json.data;
}

export async function createStudent(payload) {
  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không tạo được học sinh");
  return res.json();
}

export async function updateStudent(id, payload) {
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không cập nhật được học sinh");
  return res.json();
}

export async function deleteStudent(id) {
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Không xóa được học sinh");
  return true;
}
