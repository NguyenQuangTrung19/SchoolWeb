// src/controllers/teacher.controller.js
function validateScoreValue(score) {
  if (typeof score !== "number") return false;
  if (Number.isNaN(score)) return false;
  return score >= 0 && score <= 10;
}

// 1. Danh sách lớp dạy
export async function getTeacherClasses(req, res) {
  try {
    const user = req.user;

    let classes;
    if (user.role === "ADMIN") {
      classes = await Class.findAllWithSubjectAndTeacher();
    } else {
      classes = await Class.findAllByTeacherId(user.id);
    }

    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// 2. Chi tiết lớp + danh sách học sinh
export async function getClassStudents(req, res) {
  try {
    const classId = Number(req.params.id);
    const user = req.user;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // quyền
    if (user.role === "TEACHER" && cls.teacherId !== user.id) {
      return res.status(403).json({ message: "Not your class" });
    }

    const students = await Student.findByClassId(classId);

    res.json({
      class: cls,
      students,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// 3. Nhập điểm - POST /scores
export async function createScore(req, res) {
  try {
    const { studentId, classId, subjectId, type, score } = req.body;
    const user = req.user;

    if (!validateScoreValue(score)) {
      return res.status(400).json({ message: "Score must be 0–10" });
    }

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (user.role === "TEACHER" && cls.teacherId !== user.id) {
      return res.status(403).json({ message: "Not your class" });
    }

    // validate student thuộc class
    const existsInClass = await ClassStudent.exists(classId, studentId);
    if (!existsInClass) {
      return res
        .status(400)
        .json({ message: "Student does not belong to this class" });
    }

    const newScore = await Score.create({
      studentId,
      classId,
      subjectId,
      type,
      score,
      createdBy: user.id,
    });

    res.status(201).json(newScore);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// 3b. Sửa điểm - PUT /scores/:id
export async function updateScore(req, res) {
  try {
    const scoreId = Number(req.params.id);
    const { score } = req.body;
    const user = req.user;

    if (!validateScoreValue(score)) {
      return res.status(400).json({ message: "Score must be 0–10" });
    }

    const sc = await Score.findByIdWithClass(scoreId); // include class
    if (!sc) return res.status(404).json({ message: "Score not found" });

    if (user.role === "TEACHER" && sc.class.teacherId !== user.id) {
      return res.status(403).json({ message: "Not your class" });
    }

    sc.score = score;
    sc.updatedBy = user.id;
    await sc.save();

    res.json(sc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// 4. Điểm danh bulk
export async function bulkAttendance(req, res) {
  try {
    const { classId, date, records } = req.body;
    const user = req.user;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (user.role === "TEACHER" && cls.teacherId !== user.id) {
      return res.status(403).json({ message: "Not your class" });
    }

    // TODO: validate date format, status
    const allowedStatus = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

    for (const r of records) {
      if (!allowedStatus.includes(r.status)) {
        return res.status(400).json({ message: "Invalid status: " + r.status });
      }
    }

    // upsert từng record (classId + date + studentId unique)
    await Promise.all(
      records.map((r) =>
        Attendance.upsert({
          classId,
          date,
          studentId: r.studentId,
          status: r.status,
          updatedBy: user.id,
        })
      )
    );

    res
      .status(201)
      .json({ message: "Attendance saved", count: records.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// 5. Tài liệu lớp-môn
export async function createDocument(req, res) {
  try {
    const classId = Number(req.params.classId);
    const { subjectId, title, description, fileUrl } = req.body;
    const user = req.user;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (user.role === "TEACHER" && cls.teacherId !== user.id) {
      return res.status(403).json({ message: "Not your class" });
    }

    const doc = await Document.create({
      classId,
      subjectId,
      title,
      description,
      fileUrl, // hiện tại chỉ là URL giả
      createdBy: user.id,
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
