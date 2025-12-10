// src/api/usersApi.js
import { apiGet, apiPost, apiPut } from "./http";

export function getUsers(params) {
  const q = new URLSearchParams(params).toString();
  return apiGet(`/users?${q}`);
}

export function createUser(payload) {
  return apiPost("/users", payload);
}

export function updateUser(id, payload) {
  return apiPut(`/users/${id}`, payload);
}

export function toggleUserStatus(id) {
  return apiPut(`/users/${id}/toggle-status`);
}
