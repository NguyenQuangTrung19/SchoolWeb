import { apiGet, apiPost, apiPut, apiDelete } from "./http";

export function getStudents(params) {
  const q = new URLSearchParams(params).toString();
  return apiGet(`/students?${q}`);
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
