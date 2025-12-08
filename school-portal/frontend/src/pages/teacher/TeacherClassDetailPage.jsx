// src/pages/teacher/TeacherClassDetailPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../../components/layout/AppLayout";
import { getClassSubjectById } from "../../api/classSubjectsApi";
import { getStudents } from "../../api/studentsApi";
import { getScoresByClassSubject, upsertScore } from "../../api/scoresApi";
import {
  getAttendanceByClassAndDate,
  saveAttendanceBulk,
} from "../../api/attendanceApi";
import {
  getMaterialsByClassSubject,
  createMaterial,
  deleteMaterial,
} from "../../api/materialsApi";

function a11yProps(index) {
  return {
    id: `class-tab-${index}`,
    "aria-controls": `class-tabpanel-${index}`,
  };
}

export default function TeacherClassDetailPage() {
  const { id } = useParams(); // id = class_subject_id
  const [tab, setTab] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [attendanceMap, setAttendanceMap] = useState({});
  const [newMat, setNewMat] = useState({
    title: "",
    url: "",
    description: "",
  });

  const queryClient = useQueryClient();

  // 1) Thông tin phân công dạy
  const classSubjectQuery = useQuery({
    queryKey: ["class-subject-detail", id],
    queryFn: () => getClassSubjectById(id),
  });

  // 2) Danh sách học sinh (theo class_id)
  const studentsQuery = useQuery({
    queryKey: ["students-of-class-subject", id],
    enabled: !!classSubjectQuery.data,
    queryFn: () =>
      getStudents({
        page: 0,
        pageSize: 200,
        search: "",
        classId: classSubjectQuery.data.class_id,
        status: "ALL",
      }),
  });

  // 3) Điểm
  const scoresQuery = useQuery({
    queryKey: ["scores", id],
    enabled: !!id,
    queryFn: () => getScoresByClassSubject(id),
  });

  // 4) Điểm danh theo ngày + lớp
  const attendanceQuery = useQuery({
    queryKey: ["attendance", { classSubjectId: id, date }],
    enabled: !!classSubjectQuery.data,
    queryFn: () =>
      getAttendanceByClassAndDate(classSubjectQuery.data.class_id, date),
  });

  // 5) Tài liệu
  const materialsQuery = useQuery({
    queryKey: ["materials", id],
    enabled: !!id,
    queryFn: () => getMaterialsByClassSubject(id),
  });

  // ======= MUTATIONS =======
  const upsertScoreMutation = useMutation({
    mutationFn: upsertScore,
    onSuccess: () => {
      queryClient.invalidateQueries(["scores", id]);
    },
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: saveAttendanceBulk,
    onSuccess: () => {
      queryClient.invalidateQueries([
        "attendance",
        { classSubjectId: id, date },
      ]);
    },
  });

  const createMaterialMutation = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries(["materials", id]);
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries(["materials", id]);
    },
  });

  // Build map scores: key = studentId_type
  const scores = scoresQuery.data || [];
  const scoresMap = useMemo(() => {
    const map = {};
    scores.forEach((s) => {
      map[`${s.student_id}_${s.type}`] = s.score;
    });
    return map;
  }, [scores]);

  // Khi attendanceQuery.data thay đổi -> build attendanceMap
  useEffect(() => {
    if (!attendanceQuery.data) return;
    const map = {};
    attendanceQuery.data.forEach((a) => {
      map[a.student_id] = a.status;
    });
    setAttendanceMap(map);
  }, [attendanceQuery.data]);

  if (classSubjectQuery.isLoading) {
    return (
      <AppLayout>
        <Typography>Đang tải...</Typography>
      </AppLayout>
    );
  }

  if (classSubjectQuery.isError) {
    return (
      <AppLayout>
        <Typography color="error">
          Lỗi: {classSubjectQuery.error?.message || "Không tải được dữ liệu"}
        </Typography>
      </AppLayout>
    );
  }

  const cs = classSubjectQuery.data;
  const students = studentsQuery.data?.data || [];
  const materials = materialsQuery.data || [];

  // ======= HANDLERS =======

  const handleChangeScore = (student_id, type, value) => {
    upsertScoreMutation.mutate({
      student_id,
      class_subject_id: Number(id),
      type,
      score: value,
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const handleChangeAttendance = (student_id, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [student_id]: status,
    }));
  };

  const handleSaveAttendance = () => {
    const items = students.map((s) => ({
      student_id: s.id,
      status: attendanceMap[s.id] || "PRESENT",
    }));

    saveAttendanceMutation.mutate({
      class_id: cs.class_id,
      date,
      items,
    });
  };

  const handleCreateMaterial = () => {
    if (!newMat.title) {
      alert("Vui lòng nhập tiêu đề tài liệu");
      return;
    }
    createMaterialMutation.mutate({
      ...newMat,
      class_subject_id: Number(id),
    });
    setNewMat({ title: "", url: "", description: "" });
  };

  // ======= RENDER =======

  return (
    <AppLayout>
      {/* Header */}
      <Box mb={2}>
        <Typography variant="h5" gutterBottom>
          {cs.class_name} - {cs.subject_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ID phân công: {cs.id} | GV: {cs.teacher_name} | Phòng:{" "}
          {cs.room || "-"} | Tiết/tuần: {cs.weekly_lessons || "-"}
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{ mb: 2 }}
        aria-label="tabs lớp tôi dạy"
      >
        <Tab label="Học sinh" {...a11yProps(0)} />
        <Tab label="Nhập điểm" {...a11yProps(1)} />
        <Tab label="Điểm danh" {...a11yProps(2)} />
        <Tab label="Tài liệu" {...a11yProps(3)} />
      </Tabs>

      {/* TAB 0 - Học sinh */}
      {tab === 0 && (
        <Box>
          {studentsQuery.isLoading ? (
            <Typography>Đang tải danh sách học sinh...</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Mã HS</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Người giám hộ</TableCell>
                  <TableCell>SĐT giám hộ</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.id}</TableCell>
                    <TableCell>{s.full_name}</TableCell>
                    <TableCell>{s.guardian_name}</TableCell>
                    <TableCell>{s.guardian_phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={s.status}
                        color={s.status === "ACTIVE" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Không có học sinh nào trong lớp này
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      )}

      {/* TAB 1 - Nhập điểm */}
      {tab === 1 && (
        <Box>
          {studentsQuery.isLoading ? (
            <Typography>Đang tải học sinh...</Typography>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mã HS</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Miệng</TableCell>
                    <TableCell>15 phút</TableCell>
                    <TableCell>1 tiết</TableCell>
                    <TableCell>Cuối kỳ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((s) => {
                    const oral = scoresMap[`${s.id}_oral`] ?? "";
                    const quiz = scoresMap[`${s.id}_quiz`] ?? "";
                    const mid = scoresMap[`${s.id}_mid`] ?? "";
                    const final = scoresMap[`${s.id}_final`] ?? "";

                    return (
                      <TableRow key={s.id}>
                        <TableCell>{s.id}</TableCell>
                        <TableCell>{s.full_name}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            inputProps={{ step: "0.1" }}
                            value={oral}
                            onChange={(e) =>
                              handleChangeScore(s.id, "oral", e.target.value)
                            }
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            inputProps={{ step: "0.1" }}
                            value={quiz}
                            onChange={(e) =>
                              handleChangeScore(s.id, "quiz", e.target.value)
                            }
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            inputProps={{ step: "0.1" }}
                            value={mid}
                            onChange={(e) =>
                              handleChangeScore(s.id, "mid", e.target.value)
                            }
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            inputProps={{ step: "0.1" }}
                            value={final}
                            onChange={(e) =>
                              handleChangeScore(s.id, "final", e.target.value)
                            }
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {upsertScoreMutation.isError && (
                <Typography color="error" mt={1}>
                  {upsertScoreMutation.error.message}
                </Typography>
              )}
            </>
          )}
        </Box>
      )}

      {/* TAB 2 - Điểm danh */}
      {tab === 2 && (
        <Box>
          <Box mb={2} display="flex" alignItems="center" gap={2}>
            <TextField
              label="Ngày"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <Button
              variant="outlined"
              onClick={() => attendanceQuery.refetch()}
            >
              Tải lại
            </Button>
          </Box>

          {attendanceQuery.isLoading || studentsQuery.isLoading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mã HS</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((s) => {
                    const status = attendanceMap[s.id] || "PRESENT";
                    return (
                      <TableRow key={s.id}>
                        <TableCell>{s.id}</TableCell>
                        <TableCell>{s.full_name}</TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={status}
                            onChange={(e) =>
                              handleChangeAttendance(s.id, e.target.value)
                            }
                            sx={{ width: 160 }}
                          >
                            <MenuItem value="PRESENT">Có mặt</MenuItem>
                            <MenuItem value="ABSENT">Vắng</MenuItem>
                            <MenuItem value="LATE">Trễ</MenuItem>
                            <MenuItem value="EXCUSED">Vắng có phép</MenuItem>
                          </TextField>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Box mt={2}>
                <Button
                  variant="contained"
                  onClick={handleSaveAttendance}
                  disabled={saveAttendanceMutation.isLoading}
                >
                  Lưu điểm danh
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}

      {/* TAB 3 - Tài liệu */}
      {tab === 3 && (
        <Box>
          {/* Form tạo tài liệu */}
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            mb={3}
            maxWidth={500}
          >
            <TextField
              label="Tiêu đề"
              value={newMat.title}
              onChange={(e) =>
                setNewMat((prev) => ({ ...prev, title: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Link tài liệu (URL)"
              value={newMat.url}
              onChange={(e) =>
                setNewMat((prev) => ({ ...prev, url: e.target.value }))
              }
              fullWidth
              placeholder="https://..."
            />
            <TextField
              label="Mô tả"
              value={newMat.description}
              onChange={(e) =>
                setNewMat((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              multiline
              minRows={2}
            />
            <Button
              variant="contained"
              onClick={handleCreateMaterial}
              disabled={createMaterialMutation.isLoading}
            >
              Thêm tài liệu
            </Button>
          </Box>

          {/* Danh sách tài liệu */}
          {materialsQuery.isLoading ? (
            <Typography>Đang tải tài liệu...</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Link</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.title}</TableCell>
                    <TableCell>
                      {m.url ? (
                        <a href={m.url} target="_blank" rel="noreferrer">
                          {m.url}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{m.created_at}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteMaterialMutation.mutate(m.id)}
                      >
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {materials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Chưa có tài liệu nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </AppLayout>
  );
}
