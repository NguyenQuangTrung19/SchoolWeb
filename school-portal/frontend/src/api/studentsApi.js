// src/api/studentsApi.js

// id ở đây CHÍNH LÀ mã học sinh (student_code)
let mockStudents = [
  {
    id: "HS001",
    user_id: 3, // mock liên kết users.id
    full_name: "Nguyễn Văn Học",
    dob: "2010-03-15",
    gender: "M",
    address: "TP. HCM",
    current_class_id: 1, // 10A1
    guardian_name: "Nguyễn Văn Bố",
    guardian_phone: "0902000001",
    guardian_job: "Kỹ sư",
    guardian_citizen_id: "079123456789",
    status: "ACTIVE",
    note: "",
  },
  {
    id: "HS002",
    user_id: 6,
    full_name: "Trần Thị Học",
    dob: "2010-07-10",
    gender: "F",
    address: "TP. HCM",
    current_class_id: 1, // 10A1
    guardian_name: "Trần Văn Mẹ",
    guardian_phone: "0902000002",
    guardian_job: "Giáo viên",
    guardian_citizen_id: "079123456780",
    status: "ACTIVE",
    note: "",
  },
  {
    id: "HS003",
    user_id: 7,
    full_name: "Lê Minh K",
    dob: "2009-11-20",
    gender: "M",
    address: "Đồng Nai",
    current_class_id: 2, // 11A3
    guardian_name: "Lê Văn Cha",
    guardian_phone: "0902000003",
    guardian_job: "Công nhân",
    guardian_citizen_id: "079123456781",
    status: "INACTIVE",
    note: "Chuyển trường",
  },
];

let nextStudentNumber = 4;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function generateStudentId() {
  const id = `HS${String(nextStudentNumber).padStart(3, "0")}`;
  nextStudentNumber++;
  return id;
}

// 🟢 Lấy danh sách học sinh (có phân trang + filter)
export async function getStudents({
  page = 0,
  pageSize = 10,
  search = "",
  classId = "ALL",
  status = "ALL",
}) {
  await sleep(300);

  let data = [...mockStudents];

  if (search) {
    const keyword = search.toLowerCase();
    data = data.filter(
      (s) =>
        s.id.toLowerCase().includes(keyword) ||
        s.full_name.toLowerCase().includes(keyword) ||
        (s.guardian_name && s.guardian_name.toLowerCase().includes(keyword)) ||
        (s.guardian_phone && s.guardian_phone.toLowerCase().includes(keyword))
    );
  }

  if (classId !== "ALL") {
    data = data.filter((s) => String(s.current_class_id) === String(classId));
  }

  if (status !== "ALL") {
    data = data.filter((s) => s.status === status);
  }

  const total = data.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  return { data: pageData, total };
}

// 🟢 Lấy tất cả học sinh (sau này dùng cho Teacher nếu cần)
export async function getAllStudents() {
  await sleep(200);
  return [...mockStudents];
}

// 🟢 Tạo học sinh mới
export async function createStudent(payload) {
  await sleep(300);

  const newStudent = {
    id:
      payload.id && payload.id.trim() ? payload.id.trim() : generateStudentId(),
    user_id: payload.user_id || null,
    full_name: payload.full_name,
    dob: payload.dob || "",
    gender: payload.gender || "",
    address: payload.address || "",
    current_class_id: payload.current_class_id
      ? parseInt(payload.current_class_id, 10)
      : null,
    guardian_name: payload.guardian_name || "",
    guardian_phone: payload.guardian_phone || "",
    guardian_job: payload.guardian_job || "",
    guardian_citizen_id: payload.guardian_citizen_id || "",
    status: payload.status || "ACTIVE",
    note: payload.note || "",
  };

  mockStudents.push(newStudent);
  return newStudent;
}

// 🟢 Cập nhật thông tin học sinh
export async function updateStudent(id, payload) {
  await sleep(300);
  mockStudents = mockStudents.map((s) =>
    s.id === id
      ? {
          ...s,
          ...payload,
          current_class_id: payload.current_class_id
            ? parseInt(payload.current_class_id, 10)
            : s.current_class_id,
        }
      : s
  );
  return mockStudents.find((s) => s.id === id);
}

// 🟢 Xóa học sinh
export async function deleteStudent(id) {
  await sleep(300);
  mockStudents = mockStudents.filter((s) => s.id !== id);
  return true;
}
