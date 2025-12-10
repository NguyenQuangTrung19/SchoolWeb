// src/api/subjectsApi.js

import { apiGet, apiPost, apiPut, apiDelete } from "./http";

export function getSubjects(params) {
  const q = new URLSearchParams(params).toString();
  return apiGet(`/subjects?${q}`);
}

export function createSubject(payload) {
  return apiPost("/subjects", payload);
}

export function updateSubject(id, payload) {
  return apiPut(`/subjects/${id}`, payload);
}

export function deleteSubject(id) {
  return apiDelete(`/subjects/${id}`);
}
