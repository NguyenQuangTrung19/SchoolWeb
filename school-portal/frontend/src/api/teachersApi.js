// src/api/teachersApi.js

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

export async function getTeachers(params) {
  const q = new URLSearchParams(params).toString();
  const res = await apiGet(`/teachers?${q}`); // res = { data, total }

  if (res?.data && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.map((t) => ({
        ...t,
        dob: toDateInputValue(t.dob),
      })),
    };
  }

  return res;
}

export function createTeacher(payload) {
  return apiPost("/teachers", payload);
}

export function updateTeacher(id, payload) {
  return apiPut(`/teachers/${id}`, payload);
}

export function deleteTeacher(id) {
  return apiDelete(`/teachers/${id}`);
}

export async function getAllTeachers() {
  const res = await apiGet("/teachers?page=0&pageSize=9999"); // { data, total }
  const arr = Array.isArray(res?.data) ? res.data : [];
  return arr.map((t) => ({ ...t, dob: toDateInputValue(t.dob) }));
}
