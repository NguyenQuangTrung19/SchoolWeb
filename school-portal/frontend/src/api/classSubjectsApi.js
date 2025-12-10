// src/api/classSubjectsApi.js

import { apiGet, apiPost, apiPut, apiDelete } from "./http";

export function getClassSubjects({
  page = 0,
  pageSize = 10,
  classId = "ALL",
  subjectId = "ALL",
  teacherId = "ALL",
}) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("pageSize", pageSize);

  if (classId !== "ALL") {
    params.set("classId", classId);
  }
  if (subjectId !== "ALL") {
    params.set("subjectId", subjectId);
  }
  if (teacherId !== "ALL") {
    params.set("teacherId", teacherId);
  }

  return apiGet(`/class-subjects?${params.toString()}`);
}

export function getClassSubjectById(id) {
  return apiGet(`/class-subjects/${id}`);
}

export function createClassSubject(payload) {
  return apiPost("/class-subjects", payload);
}

export function updateClassSubject(id, payload) {
  return apiPut(`/class-subjects/${id}`, payload);
}

export function deleteClassSubject(id) {
  return apiDelete(`/class-subjects/${id}`);
}
