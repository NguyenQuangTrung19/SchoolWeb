-- 1. TẠO DATABASE
CREATE DATABASE IF NOT EXISTS school_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE school_db;

-- 2. XÓA BẢNG CŨ (NẾU CÓ) ĐỂ CHẠY LẠI CHO SẠCH
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;

-- 3. BẢNG classes
--   Khớp với mockClasses trong classesApi.js
--   id (INT, auto increment)
CREATE TABLE classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,               -- "10A1"
  grade INT NOT NULL,                       -- 10,11,...
  year_start INT NOT NULL,                  -- 2025
  year_end INT NOT NULL,                    -- 2026

  homeroom_teacher_id VARCHAR(20) NULL,     -- "GV001"
  homeroom_teacher_name VARCHAR(100) NULL,  -- "Nguyễn Văn A"

  capacity INT NULL,
  total_students INT DEFAULT 0,
  boys_count INT DEFAULT 0,
  girls_count INT DEFAULT 0,

  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. BẢNG students
--   Khớp với mockStudents trong studentsApi.js
--   id là mã HS dạng "HS001"
CREATE TABLE students (
  id VARCHAR(20) PRIMARY KEY,               -- "HS001"
  user_id INT NULL,                         -- liên kết users.id sau này

  full_name VARCHAR(100) NOT NULL,
  dob DATE NULL,
  gender ENUM('M','F','O') DEFAULT 'O',
  address VARCHAR(255) NULL,

  current_class_id INT NULL,                -- FK tới classes.id

  guardian_name VARCHAR(100) NULL,
  guardian_phone VARCHAR(20) NULL,
  guardian_job VARCHAR(100) NULL,
  guardian_citizen_id VARCHAR(20) NULL,

  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  note TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_students_class
    FOREIGN KEY (current_class_id)
    REFERENCES classes(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

-- 5. SEED DATA DEMO

INSERT INTO classes
  (name, grade, year_start, year_end,
   homeroom_teacher_id, homeroom_teacher_name,
   capacity, total_students, boys_count, girls_count, status)
VALUES
  ('10A1', 10, 2025, 2026, 'GV001', 'Nguyễn Văn A', 45, 40, 20, 20, 'ACTIVE'),
  ('11A3', 11, 2025, 2026, 'GV002', 'Trần Thị B', 45, 42, 18, 24, 'ACTIVE');

INSERT INTO students
  (id, user_id, full_name, dob, gender, address, current_class_id,
   guardian_name, guardian_phone, guardian_job, guardian_citizen_id,
   status, note)
VALUES
  ('HS001', 3, 'Nguyễn Văn Học', '2010-03-15', 'M', 'TP. HCM', 1,
   'Nguyễn Văn Bố', '0902000001', 'Kỹ sư', '079123456789',
   'ACTIVE', ''),
  ('HS002', 6, 'Trần Thị Học', '2010-07-10', 'F', 'TP. HCM', 1,
   'Trần Văn Mẹ', '0902000002', 'Giáo viên', '079123456780',
   'ACTIVE', ''),
  ('HS003', 7, 'Lê Minh K', '2009-11-20', 'M', 'Đồng Nai', 2,
   'Lê Văn Cha', '0902000003', 'Công nhân', '079123456781',
   'INACTIVE', 'Chuyển trường');


USE school_db;

-- ===============================
-- 5. BẢNG subjects
-- ===============================
DROP TABLE IF EXISTS subjects;

CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,            -- "Toán"
  code VARCHAR(20) NOT NULL,             -- "MATH"
  grade INT NOT NULL,                    -- 10,11,12...
  is_optional TINYINT(1) DEFAULT 0,      -- 0: bắt buộc, 1: tự chọn
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subject_code_grade (code, grade)
);

-- ===============================
-- 6. BẢNG teachers
-- ===============================
DROP TABLE IF EXISTS teachers;

CREATE TABLE teachers (
  id VARCHAR(20) PRIMARY KEY,            -- "GV001" (mã GV)
  user_id INT NULL,                      -- liên kết users.id sau này
  full_name VARCHAR(100) NOT NULL,
  dob DATE NULL,
  gender ENUM('M','F','O') DEFAULT 'O',
  address VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  citizen_id VARCHAR(20) NULL,

  main_subject VARCHAR(100) NULL,        -- giữ dạng text cho khớp mock hiện tại

  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  note TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===============================
-- 7. SEED DỮ LIỆU MẪU
-- ===============================

INSERT INTO subjects (name, code, grade, is_optional, status) VALUES
  ('Toán',      'MATH', 10, 0, 'ACTIVE'),
  ('Ngữ văn',   'LIT',  10, 0, 'ACTIVE'),
  ('Tiếng Anh', 'ENG',  10, 0, 'ACTIVE'),
  ('Vật lý',    'PHY',  10, 0, 'ACTIVE'),
  ('Hóa học',   'CHEM', 10, 0, 'ACTIVE'),
  ('Sinh học',  'BIO',  10, 0, 'ACTIVE');

INSERT INTO teachers
  (id, user_id, full_name, dob, gender, address, phone,
   citizen_id, main_subject, status, note)
VALUES
  ('GV001', 2, 'Nguyễn Văn A', '1985-01-15', 'M', 'TP. HCM',
   '0901000001', '012345678901', 'Toán',      'ACTIVE', ''),
  ('GV002', 5, 'Trần Thị B',   '1987-04-20', 'F', 'TP. HCM',
   '0901000002', '012345678902', 'Ngữ văn',   'ACTIVE', ''),
  ('GV003', 8, 'Lê Văn C',     '1982-09-10', 'M', 'Đồng Nai',
   '0901000003', '012345678903', 'Tiếng Anh', 'ACTIVE', '');
