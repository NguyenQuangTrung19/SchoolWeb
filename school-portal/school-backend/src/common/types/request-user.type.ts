// src/common/types/request-user.type.ts
export type RequestUser = {
  sub: number; // users.id
  username: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
};
