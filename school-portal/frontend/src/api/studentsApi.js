// src/api/studentsApi.js
import { apiGet, apiPost, apiPut, apiDelete } from "./http";

const toDateInputValue = (v) => {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Lọc param undefined/null/""
const buildQuery = (params = {}) => {
  const clean = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    clean[k] = String(v);
  });
  return new URLSearchParams(clean).toString();
};

export async function getStudents(params) {
  const q = buildQuery(params);
  const res = await apiGet(`/students${q ? `?${q}` : ""}`); // { data, total }

  if (res?.data && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.map((s) => ({
        ...s,
        dob: toDateInputValue(s.dob),
      })),
    };
  }

  return res;
}

export function createStudent(payload) {
  return apiPost("/students", payload);
}

export function updateStudent(id, payload) {
  return apiPut(`/students/${id}`, payload);
}

export function deleteStudent(id) {
  return apiDelete(`/students/${id}`);
}

export async function getAllStudents() {
  const res = await apiGet("/students?page=0&pageSize=9999"); // { data, total }
  const arr = Array.isArray(res?.data) ? res.data : [];
  return arr.map((s) => ({ ...s, dob: toDateInputValue(s.dob) }));
}
