// src/api/usersApi.js
let mockUsers = [
  {
    id: 1,
    username: "admin1",
    full_name: "Quản trị viên 1",
    email: "admin1@school.local",
    phone: "0900000001",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: 2,
    username: "gv001",
    full_name: "Nguyễn Văn Giáo",
    email: "gv001@school.local",
    phone: "0900000002",
    role: "TEACHER",
    status: "ACTIVE",
  },
  {
    id: 3,
    username: "hs001",
    full_name: "Trần Thị Học",
    email: "hs001@school.local",
    phone: "0900000003",
    role: "STUDENT",
    status: "LOCKED",
  },
];

let nextId = 4;

// Helper giả lập delay
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function getUsers({
  page = 0,
  pageSize = 10,
  search = "",
  role = "ALL",
}) {
  await sleep(300);

  let data = [...mockUsers];

  if (search) {
    const keyword = search.toLowerCase();
    data = data.filter(
      (u) =>
        u.username.toLowerCase().includes(keyword) ||
        u.full_name.toLowerCase().includes(keyword) ||
        (u.email && u.email.toLowerCase().includes(keyword))
    );
  }

  if (role !== "ALL") {
    data = data.filter((u) => u.role === role);
  }

  const total = data.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  return { data: pageData, total };
}

export async function createUser(payload) {
  await sleep(300);
  const newUser = {
    id: nextId++,
    username: payload.username,
    full_name: payload.full_name,
    email: payload.email || "",
    phone: payload.phone || "",
    role: payload.role || "STUDENT",
    status: "ACTIVE",
  };
  mockUsers.push(newUser);
  return newUser;
}

export async function updateUser(id, payload) {
  await sleep(300);
  mockUsers = mockUsers.map((u) => (u.id === id ? { ...u, ...payload } : u));
  return mockUsers.find((u) => u.id === id);
}

export async function toggleUserStatus(id) {
  await sleep(300);
  mockUsers = mockUsers.map((u) =>
    u.id === id
      ? { ...u, status: u.status === "ACTIVE" ? "LOCKED" : "ACTIVE" }
      : u
  );
  return mockUsers.find((u) => u.id === id);
}
