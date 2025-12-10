import { apiGet, apiPost, apiPut, apiDelete } from "./http";

export function getClasses(params) {
  const q = new URLSearchParams(params).toString();
  return apiGet(`/classes?${q}`);
}

export function createClass(payload) {
  return apiPost("/classes", payload);
}

export function updateClass(id, payload) {
  return apiPut(`/classes/${id}`, payload);
}

export function deleteClass(id) {
  return apiDelete(`/classes/${id}`);
}
