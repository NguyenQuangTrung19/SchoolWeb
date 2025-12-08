// src/api/classSubjectsApi.js

let mockClassSubjects = [
  {
    id: 1,
    class_id: 1,
    class_name: "10A1",
    subject_id: 1,
    subject_name: "Toán",
    teacher_id: "GV001",
    teacher_name: "Nguyễn Văn A",
    weekly_lessons: 4,
    room: "P101",
    status: "ACTIVE",
  },
  {
    id: 2,
    class_id: 1,
    class_name: "10A1",
    subject_id: 2,
    subject_name: "Ngữ văn",
    teacher_id: "GV002",
    teacher_name: "Trần Thị B",
    weekly_lessons: 3,
    room: "P102",
    status: "ACTIVE",
  },
];

let nextAssignId = 3;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function getClassSubjects({
  page = 0,
  pageSize = 10,
  classId = "ALL",
  subjectId = "ALL",
  teacherId = "ALL",
}) {
  await sleep(300);

  let data = [...mockClassSubjects];

  if (classId !== "ALL") {
    data = data.filter((cs) => String(cs.class_id) === String(classId));
  }
  if (subjectId !== "ALL") {
    data = data.filter((cs) => String(cs.subject_id) === String(subjectId));
  }
  if (teacherId !== "ALL") {
    data = data.filter((cs) => String(cs.teacher_id) === String(teacherId));
  }

  const total = data.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  return { data: pageData, total };
}

export async function createClassSubject(payload) {
  await sleep(300);
  const newAssign = {
    id: nextAssignId++,
    ...payload,
  };
  mockClassSubjects.push(newAssign);
  return newAssign;
}

export async function updateClassSubject(id, payload) {
  await sleep(300);
  mockClassSubjects = mockClassSubjects.map((cs) =>
    cs.id === id ? { ...cs, ...payload } : cs
  );
  return mockClassSubjects.find((cs) => cs.id === id);
}

export async function deleteClassSubject(id) {
  await sleep(300);
  mockClassSubjects = mockClassSubjects.filter((cs) => cs.id !== id);
  return true;
}

export async function getClassSubjectById(id) {
  await sleep(200);
  const cs = mockClassSubjects.find((c) => c.id === Number(id));
  if (!cs) throw new Error("Không tìm thấy phân công dạy");
  return cs;
}
