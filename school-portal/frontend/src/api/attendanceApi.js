// src/api/attendanceApi.js

// mỗi record: 1 học sinh - 1 class - 1 ngày
// status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
let mockAttendance = [];

let nextAttId = 1;
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function getAttendanceByClassAndDate(classId, date) {
  await sleep(200);
  return mockAttendance.filter(
    (a) => a.class_id === Number(classId) && a.date === date
  );
}

// POST /attendance/bulk
export async function saveAttendanceBulk({ class_id, date, items }) {
  await sleep(200);

  // Xóa attendance cũ của class+date
  mockAttendance = mockAttendance.filter(
    (a) => !(a.class_id === Number(class_id) && a.date === date)
  );

  // Thêm mới theo danh sách items
  for (const item of items) {
    mockAttendance.push({
      id: nextAttId++,
      student_id: item.student_id,
      class_id: Number(class_id),
      date,
      status: item.status,
    });
  }

  return true;
}
