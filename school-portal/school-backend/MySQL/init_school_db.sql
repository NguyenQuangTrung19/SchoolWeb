-- 1. TẠO DATABASE
CREATE DATABASE IF NOT EXISTS school_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE school_db;

-- XÓA BẢNG CŨ
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS class_subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;

-- ===============================
-- BẢNG users  (email/phone NOT NULL)
-- ===============================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  fullname VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('ADMIN','TEACHER','STUDENT') NOT NULL,
  status ENUM('ACTIVE','LOCKED') DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SEED users: 1 admin + 3 GV + 3 HS
INSERT INTO users (id, username, password, fullname, email, phone, role, status) VALUES
  (1, 'admin1', 'AbcdefGh', 'Quản trị viên 1', 'admin1@school.local', '0900000001', 'ADMIN',  'ACTIVE'),
  (2, 'gv001',  'AbcdefGh', 'Nguyễn Văn A',    'gv001@school.local',  '0901000001', 'TEACHER','ACTIVE'),
  (5, 'gv002',  'AbcdefGh', 'Trần Thị B',      'gv002@school.local',  '0901000002', 'TEACHER','ACTIVE'),
  (8, 'gv003',  'AbcdefGh', 'Lê Văn C',        'gv003@school.local',  '0901000003', 'TEACHER','ACTIVE'),
  (3, 'hs001',  'AbcdefGh', 'Nguyễn Văn Học',  'hs001@school.local',  '0902000001', 'STUDENT','ACTIVE'),
  (6, 'hs002',  'AbcdefGh', 'Trần Thị Học',    'hs002@school.local',  '0902000002', 'STUDENT','ACTIVE'),
  (7, 'hs003',  'AbcdefGh', 'Lê Minh K',       'hs003@school.local',  '0902000003', 'STUDENT','LOCKED');

-- ===============================
-- BẢNG classes
-- ===============================
CREATE TABLE classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  grade INT NOT NULL,
  year_start INT NOT NULL,
  year_end INT NOT NULL,

  homeroom_teacher_id VARCHAR(20) NULL,
  homeroom_teacher_name VARCHAR(100) NULL,

  capacity INT NULL,
  total_students INT DEFAULT 0,
  boys_count INT DEFAULT 0,
  girls_count INT DEFAULT 0,

  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SEED classes
INSERT INTO classes
  (name, grade, year_start, year_end,
   homeroom_teacher_id, homeroom_teacher_name,
   capacity, total_students, boys_count, girls_count, status)
VALUES
  ('10A1', 10, 2025, 2026, 'GV001', 'Nguyễn Văn A', 45, 40, 20, 20, 'ACTIVE'),
  ('11A3', 11, 2025, 2026, 'GV002', 'Trần Thị B', 45, 42, 18, 24, 'ACTIVE');

-- ===============================
-- BẢNG students
-- ===============================
CREATE TABLE students (
  id VARCHAR(20) PRIMARY KEY,               -- "HS001"
  userid INT NOT NULL UNIQUE,                      -- liên kết users.id (BẮT BUỘC)

  fullname VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  gender ENUM('M','F','O') NOT NULL,
  address VARCHAR(255) NULL,

  current_class_id INT NOT NULL,            -- FK tới classes.id (BẮT BUỘC)

  guardian_name VARCHAR(100) NOT NULL,
  guardian_phone VARCHAR(20) NOT NULL,
  guardian_job VARCHAR(100) NULL,
  guardian_citizenid VARCHAR(20) NULL,

  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  note TEXT NULL,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_students_user
    FOREIGN KEY (userid)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_students_class
    FOREIGN KEY (current_class_id)
    REFERENCES classes(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- SEED students
INSERT INTO students
  (id, userid, fullname, dob, gender, address, current_class_id,
   guardian_name, guardian_phone, guardian_job, guardian_citizenid,
   status, note)
VALUES
  ('HS001', 3, 'Nguyễn Văn Học', '2015-03-15', 'M', 'TP. HCM', 1,
   'Nguyễn Văn Bố', '0902000001', 'Kỹ sư', '079123456789',
   'ACTIVE', ''),
  ('HS002', 6, 'Trần Thị Học', '2015-07-10', 'F', 'TP. HCM', 1,
   'Trần Văn Mẹ', '0902000002', 'Giáo viên', '079123456780',
   'ACTIVE', ''),
  ('HS003', 7, 'Lê Minh K', '2014-11-20', 'M', 'Đồng Nai', 2,
   'Lê Văn Cha', '0902000003', 'Công nhân', '079123456781',
   'INACTIVE', 'Chuyển trường');

-- ===============================
-- BẢNG subjects
-- ===============================
CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  grade INT NOT NULL,
  is_optional TINYINT(1) DEFAULT 0,
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subject_code_grade (code, grade)
);

INSERT INTO subjects (name, code, grade, is_optional, status) VALUES
  ('Toán',      'MATH', 10, 0, 'ACTIVE'),
  ('Ngữ văn',   'LIT',  10, 0, 'ACTIVE'),
  ('Tiếng Anh', 'ENG',  10, 0, 'ACTIVE'),
  ('Vật lý',    'PHY',  10, 0, 'ACTIVE'),
  ('Hóa học',   'CHEM', 10, 0, 'ACTIVE'),
  ('Sinh học',  'BIO',  10, 0, 'ACTIVE');

-- ===============================
-- BẢNG teachers
-- ===============================
CREATE TABLE teachers (
  id VARCHAR(20) PRIMARY KEY,            -- "GV001"
  userid INT NOT NULL UNIQUE,            -- 1-1 với users.id

  fullname VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  gender ENUM('M','F','O') NOT NULL,
  address VARCHAR(255) NULL,
  phone VARCHAR(20) NOT NULL,
  citizenid VARCHAR(20) NOT NULL,
  mainsubject VARCHAR(100) NOT NULL,

  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  note TEXT NULL,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_teachers_user
    FOREIGN KEY (userid)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

INSERT INTO teachers
  (id, userid, fullname, dob, gender, address, phone, citizenid, mainsubject, status, note)
VALUES
  ('GV001', 2, 'Nguyễn Văn A', '1985-01-15', 'M', 'TP. HCM',  '0901000001', '012345678901', 'Toán',      'ACTIVE', ''),
  ('GV002', 5, 'Trần Thị B',   '1987-04-20', 'F', 'TP. HCM',  '0901000002', '012345678902', 'Ngữ văn',   'ACTIVE', ''),
  ('GV003', 8, 'Lê Văn C',     '1982-09-10', 'M', 'Đồng Nai', '0901000003', '012345678903', 'Tiếng Anh', 'ACTIVE', '');

-- ===============================
-- BẢNG class_subjects (phân công giảng dạy)
-- ===============================
DROP TABLE IF EXISTS class_subjects;

CREATE TABLE class_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,

  classId INT NOT NULL,          -- FK -> classes.id
  subjectId INT NOT NULL,        -- FK -> subjects.id
  teacherId VARCHAR(20) NOT NULL,-- FK -> teachers.id

  weekly_lessons INT NULL,        -- số tiết / tuần (tuỳ chọn)
  room VARCHAR(50) NULL,          -- phòng học, ví dụ "P101"

  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_class_subject_teacher
    UNIQUE KEY (classId, subjectId, teacherId),

  CONSTRAINT fk_class_subjects_class
    FOREIGN KEY (classId)
    REFERENCES classes(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_class_subjects_subject
    FOREIGN KEY (subjectId)
    REFERENCES subjects(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_class_subjects_teacher
    FOREIGN KEY (teacherId)
    REFERENCES teachers(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- ===============================
-- BẢNG scores  (điểm số học sinh theo lớp-môn)
-- ===============================
DROP TABLE IF EXISTS scores;

CREATE TABLE scores (
  id INT AUTO_INCREMENT PRIMARY KEY,

  studentId VARCHAR(20) NOT NULL,     -- FK -> students.id (HS001)
  class_subject_id INT NOT NULL,       -- FK -> class_subjects.id

  type ENUM('oral','quiz','mid','final') NOT NULL,
  score DECIMAL(4,2) NULL,            -- cho phép NULL nếu chưa nhập
  date DATE NULL,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_score_student_class_type
    UNIQUE KEY (studentId, class_subject_id, type),

  CONSTRAINT fk_scores_student
    FOREIGN KEY (studentId)
    REFERENCES students(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_scores_class_subject
    FOREIGN KEY (class_subject_id)
    REFERENCES class_subjects(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- ===============================
-- BẢNG attendance (điểm danh)
-- ===============================
DROP TABLE IF EXISTS attendance;

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,

  studentId VARCHAR(20) NOT NULL,   -- FK -> students.id
  classId INT NOT NULL,             -- FK -> classes.id
  date DATE NOT NULL,

  status ENUM('PRESENT','ABSENT','LATE','EXCUSED')
    NOT NULL DEFAULT 'PRESENT',

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_attendance_student_class_date
    UNIQUE KEY (studentId, classId, date),

  CONSTRAINT fk_attendance_student
    FOREIGN KEY (studentId)
    REFERENCES students(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_attendance_class
    FOREIGN KEY (classId)
    REFERENCES classes(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- ===============================
-- BẢNG materials (tài liệu)
-- ===============================
DROP TABLE IF EXISTS materials;

CREATE TABLE materials (
  id INT AUTO_INCREMENT PRIMARY KEY,

  class_subject_id INT NOT NULL,       -- FK -> class_subjects.id
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  url VARCHAR(500) NULL,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_materials_class_subject
    FOREIGN KEY (class_subject_id)
    REFERENCES class_subjects(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
