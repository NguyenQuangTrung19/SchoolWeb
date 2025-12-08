// src/api/materialsApi.js

let mockMaterials = [
  {
    id: 1,
    class_subject_id: 1,
    title: "Ôn tập chương 1",
    description: "Tài liệu ôn tập chương 1 môn Toán",
    url: "https://example.com/tailieu-toan-1.pdf",
    created_at: "2025-11-01",
  },
];

let nextMatId = 2;
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function getMaterialsByClassSubject(classSubjectId) {
  await sleep(200);
  return mockMaterials.filter(
    (m) => m.class_subject_id === Number(classSubjectId)
  );
}

export async function createMaterial(payload) {
  await sleep(200);
  const newMat = {
    id: nextMatId++,
    class_subject_id: Number(payload.class_subject_id),
    title: payload.title,
    description: payload.description || "",
    url: payload.url || "",
    created_at: new Date().toISOString().slice(0, 10),
  };
  mockMaterials.push(newMat);
  return newMat;
}

export async function deleteMaterial(id) {
  await sleep(200);
  mockMaterials = mockMaterials.filter((m) => m.id !== id);
  return true;
}
