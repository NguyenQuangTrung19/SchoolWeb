// src/api/teachersApi.js

// id ở đây CHÍNH LÀ mã giáo viên (teacher_code)
let mockTeachers = [
  {
    id: "GV001",
    user_id: 2, // liên kết users.id (mock)
    full_name: "Nguyễn Văn A",
    dob: "1985-01-15",
    gender: "M",
    address: "TP. HCM",
    phone: "0901000001",
    citizen_id: "012345678901",
    main_subject: "Toán",
    status: "ACTIVE",
    note: "",
  },
  {
    id: "GV002",
    user_id: 4,
    full_name: "Trần Thị B",
    dob: "1988-05-20",
    gender: "F",
    address: "TP. HCM",
    phone: "0901000002",
    citizen_id: "012345678902",
    main_subject: "Ngữ văn",
    status: "ACTIVE",
    note: "",
  },
  {
    id: "GV003",
    user_id: 5,
    full_name: "Lê Văn C",
    dob: "1990-09-10",
    gender: "M",
    address: "Đồng Nai",
    phone: "0901000003",
    citizen_id: "012345678903",
    main_subject: "Tiếng Anh",
    status: "INACTIVE",
    note: "",
  },
];

let nextTeacherNumber = 4;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function generateTeacherId() {
  const id = `GV${String(nextTeacherNumber).padStart(3, "0")}`;
  nextTeacherNumber++;
  return id;
}

// 🟢 Lấy danh sách giáo viên (có phân trang + filter)
export async function getTeachers({
  page = 0,
  pageSize = 10,
  search = "",
  subject = "ALL",
  status = "ALL",
}) {
  await sleep(300);

  let data = [...mockTeachers];

  if (search) {
    const keyword = search.toLowerCase();
    data = data.filter(
      (t) =>
        t.id.toLowerCase().includes(keyword) ||
        t.full_name.toLowerCase().includes(keyword) ||
        (t.phone && t.phone.toLowerCase().includes(keyword))
    );
  }

  if (subject !== "ALL") {
    data = data.filter(
      (t) =>
        t.main_subject && t.main_subject.toLowerCase() === subject.toLowerCase()
    );
  }

  if (status !== "ALL") {
    data = data.filter((t) => t.status === status);
  }

  const total = data.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  return { data: pageData, total };
}

// 🟢 Lấy tất cả giáo viên (dùng cho dropdown GVCN, phân công dạy, ...)
export async function getAllTeachers() {
  await sleep(200);
  return [...mockTeachers];
}

// 🟢 Tạo giáo viên mới
export async function createTeacher(payload) {
  await sleep(300);

  const newTeacher = {
    id:
      payload.id && payload.id.trim() ? payload.id.trim() : generateTeacherId(),
    user_id: payload.user_id || null,
    full_name: payload.full_name,
    dob: payload.dob || "",
    gender: payload.gender || "",
    address: payload.address || "",
    phone: payload.phone || "",
    citizen_id: payload.citizen_id || "",
    main_subject: payload.main_subject || "",
    status: payload.status || "ACTIVE",
    note: payload.note || "",
  };

  mockTeachers.push(newTeacher);
  return newTeacher;
}

// 🟢 Cập nhật thông tin giáo viên
export async function updateTeacher(id, payload) {
  await sleep(300);
  mockTeachers = mockTeachers.map((t) =>
    t.id === id
      ? {
          ...t,
          ...payload,
        }
      : t
  );
  return mockTeachers.find((t) => t.id === id);
}

// 🟢 Xóa giáo viên
export async function deleteTeacher(id) {
  await sleep(300);
  mockTeachers = mockTeachers.filter((t) => t.id !== id);
  return true;
}
