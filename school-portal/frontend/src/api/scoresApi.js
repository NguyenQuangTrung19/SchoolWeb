// src/api/scoresApi.js

// Mỗi record: 1 học sinh - 1 class_subject - 1 loại điểm
// type: 'oral', 'quiz', 'mid', 'final'
let mockScores = [
  {
    id: 1,
    student_id: "HS001",
    class_subject_id: 1,
    type: "oral",
    score: 8,
    date: "2025-10-01",
  },
  {
    id: 2,
    student_id: "HS001",
    class_subject_id: 1,
    type: "final",
    score: 9,
    date: "2025-11-30",
  },
];

let nextScoreId = 3;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function getScoresByClassSubject(classSubjectId) {
  await sleep(200);
  return mockScores.filter(
    (s) => s.class_subject_id === Number(classSubjectId)
  );
}

// Upsert: nếu đã có (student+class_subject+type) thì update, ngược lại tạo mới
export async function upsertScore({
  student_id,
  class_subject_id,
  type,
  score,
  date,
}) {
  await sleep(200);

  const numScore =
    score === "" || score === null || score === undefined
      ? null
      : Number(score);

  if (numScore !== null) {
    if (Number.isNaN(numScore) || numScore < 0 || numScore > 10) {
      throw new Error("Điểm phải từ 0 đến 10");
    }
  }

  let existing = mockScores.find(
    (s) =>
      s.student_id === student_id &&
      s.class_subject_id === Number(class_subject_id) &&
      s.type === type
  );

  if (existing) {
    existing.score = numScore;
    existing.date = date || existing.date;
    return existing;
  } else {
    const newScore = {
      id: nextScoreId++,
      student_id,
      class_subject_id: Number(class_subject_id),
      type,
      score: numScore,
      date: date || new Date().toISOString().slice(0, 10),
    };
    mockScores.push(newScore);
    return newScore;
  }
}
