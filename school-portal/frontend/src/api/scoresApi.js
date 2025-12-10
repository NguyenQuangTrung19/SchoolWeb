// src/api/scoresApi.js

import { apiGet, apiPost } from "./http";

export function getScoresByClassSubject(classSubjectId) {
  return apiGet(`/scores/class-subject/${classSubjectId}`);
}

export function upsertScore(payload) {
  return apiPost("/scores/upsert", payload);
}
