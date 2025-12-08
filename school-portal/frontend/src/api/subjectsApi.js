// src/api/subjectsApi.js

let mockSubjects = [
  {
    id: 1,
    name: "Toán",
    code: "MATH",
    grade: 10,
    is_optional: false,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Ngữ văn",
    code: "LIT",
    grade: 10,
    is_optional: false,
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Tiếng Anh",
    code: "ENG",
    grade: 11,
    is_optional: false,
    status: "ACTIVE",
  },
];

let nextSubjectId = 4;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function getSubjects({
  page = 0,
  pageSize = 10,
  search = "",
  grade = "ALL",
}) {
  await sleep(300);

  let data = [...mockSubjects];

  if (search) {
    const keyword = search.toLowerCase();
    data = data.filter(
      (s) =>
        s.name.toLowerCase().includes(keyword) ||
        (s.code && s.code.toLowerCase().includes(keyword))
    );
  }

  if (grade !== "ALL") {
    data = data.filter((s) => String(s.grade) === String(grade));
  }

  const total = data.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  return { data: pageData, total };
}

export async function createSubject(payload) {
  await sleep(300);
  const newSubject = {
    id: nextSubjectId++,
    name: payload.name,
    code: payload.code || "",
    grade: payload.grade ? parseInt(payload.grade, 10) : null,
    is_optional: !!payload.is_optional,
    status: payload.status || "ACTIVE",
  };
  mockSubjects.push(newSubject);
  return newSubject;
}

export async function updateSubject(id, payload) {
  await sleep(300);
  mockSubjects = mockSubjects.map((s) =>
    s.id === id
      ? {
          ...s,
          ...payload,
          grade: payload.grade ? parseInt(payload.grade, 10) : s.grade,
          is_optional:
            payload.is_optional !== undefined
              ? !!payload.is_optional
              : s.is_optional,
        }
      : s
  );
  return mockSubjects.find((s) => s.id === id);
}

export async function deleteSubject(id) {
  await sleep(300);
  mockSubjects = mockSubjects.filter((s) => s.id !== id);
  return true;
}
