// src/api/classesApi.js

let mockClasses = [
  {
    id: 1,
    name: "10A1",
    grade: 10,
    year_start: 2025,
    year_end: 2026,
    homeroom_teacher_id: "GV001",
    homeroom_teacher_name: "Nguyễn Văn A", // chỉ để hiển thị nhanh
    capacity: 45,
    total_students: 40,
    boys_count: 20,
    girls_count: 20,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "11A3",
    grade: 11,
    year_start: 2025,
    year_end: 2026,
    homeroom_teacher_id: "GV002",
    homeroom_teacher_name: "Trần Thị B",
    capacity: 45,
    total_students: 42,
    boys_count: 18,
    girls_count: 24,
    status: "ACTIVE",
  },
];

let nextClassId = 3;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function getClasses({
  page = 0,
  pageSize = 10,
  search = "",
  grade = "ALL",
}) {
  await sleep(300);

  let data = [...mockClasses];

  if (search) {
    const keyword = search.toLowerCase();
    data = data.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        String(c.year_start).includes(keyword) ||
        String(c.year_end).includes(keyword)
    );
  }

  if (grade !== "ALL") {
    data = data.filter((c) => String(c.grade) === String(grade));
  }

  const total = data.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  return { data: pageData, total };
}

export async function createClass(payload) {
  await sleep(300);
  const newClass = {
    id: nextClassId++,
    name: payload.name,
    grade: payload.grade,
    year_start: payload.year_start,
    year_end: payload.year_end,
    homeroom_teacher_id: payload.homeroom_teacher_id || null,
    homeroom_teacher_name: payload.homeroom_teacher_name || "",
    capacity: payload.capacity || null,
    total_students: payload.total_students || 0,
    boys_count: payload.boys_count || 0,
    girls_count: payload.girls_count || 0,
    status: payload.status || "ACTIVE",
  };
  mockClasses.push(newClass);
  return newClass;
}

export async function updateClass(id, payload) {
  await sleep(300);
  mockClasses = mockClasses.map((c) =>
    c.id === id ? { ...c, ...payload } : c
  );
  return mockClasses.find((c) => c.id === id);
}

export async function deleteClass(id) {
  await sleep(300);
  mockClasses = mockClasses.filter((c) => c.id !== id);
  return true;
}
