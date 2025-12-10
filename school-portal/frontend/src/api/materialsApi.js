// src/api/materialsApi.js

import { apiGet, apiPost, apiDelete } from "./http";

export function getMaterialsByClassSubject(classSubjectId) {
  return apiGet(`/materials/class-subject/${classSubjectId}`);
}

export function createMaterial(payload) {
  return apiPost(`/materials`, payload);
}

export function deleteMaterial(id) {
  return apiDelete(`/materials/${id}`);
}
