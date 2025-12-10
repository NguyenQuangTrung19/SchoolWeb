// src/api/attendanceApi.js

import { apiGet, apiPost } from "./http";

export function getAttendanceByClassAndDate(classId, date) {
  return apiGet(`/attendance/class/${classId}/date/${date}`);
}

export function saveAttendanceBulk(payload) {
  return apiPost(`/attendance/bulk`, payload);
}
