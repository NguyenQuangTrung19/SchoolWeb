// src/api/studentPortalApi.js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- Scores API ---
export async function getStudentScores(studentId, classId) {
  await sleep(200);
  // Lấy từ mockScores trong scoresApi.js
  const scores =
    window.mockScores?.filter(
      (s) => s.studentId === studentId && s.class_subject_id === Number(classId)
    ) || [];

  // group by type
  const result = {
    oral: [],
    quiz: [],
    mid: [],
    final: [],
  };

  scores.forEach((s) => {
    result[s.type].push(s.score);
  });

  return result;
}

// --- Attendance API ---
export async function getStudentAttendance(studentId, from, to) {
  await sleep(200);
  const all = window.mockAttendance || [];

  return all.filter(
    (a) => a.studentId === studentId && a.date >= from && a.date <= to
  );
}

// --- Materials API ---
export async function getStudentMaterials(classSubjectId) {
  await sleep(200);
  return (
    window.mockMaterials?.filter(
      (m) => m.class_subject_id === Number(classSubjectId)
    ) || []
  );
}
