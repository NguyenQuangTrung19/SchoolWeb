// src/api/teachersApi.js

import { apiGet, apiPost, apiPut, apiDelete } from "./http";

export function getTeachers(params) {
  const q = new URLSearchParams(params).toString();
  return apiGet(`/teachers?${q}`);
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
  const res = await apiGet("/teachers?page=0&pageSize=9999");
  // nếu backend trả { data, total }
  return res.data || [];
}
