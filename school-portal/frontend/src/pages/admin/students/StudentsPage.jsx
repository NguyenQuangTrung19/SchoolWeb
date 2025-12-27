// src/pages/admin/students/StudentsPage.jsx
import { useState, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Drawer,
  Stack,
  Divider,
  Avatar,
  Paper,
  TableContainer,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../../../components/layout/AppLayout";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../../api/studentsApi";
import { getClasses } from "../../../api/classesApi";
import { getTeachers } from "../../../api/teachersApi";
import { getClassSubjects } from "../../../api/classSubjectsApi";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isTeacher = user?.role === "TEACHER";

  // Filter & pagination
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formValues, setFormValues] = useState({
    id: "", // HSxxx optional
    fullname: "",
    email: "",
    dob: "",
    gender: "",
    address: "",
    current_class_id: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_job: "",
    guardian_citizenid: "",
    status: "ACTIVE",
    note: "",
    password: "", // admin xem (read-only)
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const closeToast = (event, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const openStudentDrawer = (s) => {
    setSelectedStudent(s);
    setOpenDrawer(true);
  };
  const closeStudentDrawer = () => {
    setOpenDrawer(false);
    setSelectedStudent(null);
  };

  const toTitleCase = (s = "") =>
    s
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const normalizeDigits = (s = "") => s.replace(/\D/g, "");
  const isValidPhoneVN = (s = "") => /^0\d{9}$/.test(s);
  const isValidCitizenId12 = (s = "") => /^\d{12}$/.test(s);

  const isAllowedEmail = (email) => {
    if (!email) return false; // student: email bắt buộc
    const e = email.trim().toLowerCase();
    const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    if (!basic) return false;
    return (
      e.endsWith("@gmail.com") ||
      e.endsWith(".edu") ||
      e.endsWith(".edu.vn") ||
      e.endsWith(".ac.vn")
    );
  };

  const toDateInputValue = (v) => {
    if (!v) return "";
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const isAtLeast10 = (dobStr) => {
    if (!dobStr) return false;
    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 10;
  };

  const copyToClipboard = async (text, label = "Nội dung") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Đã copy ${label}`, "success");
    } catch {
      showToast("Không thể copy, vui lòng thử lại", "error");
    }
  };

  // ---------------------------
  // 1) Load classes
  // ---------------------------
  const classesQuery = useQuery({
    queryKey: [
      "classes",
      { page: 0, pageSize: 1000, search: "", grade: "ALL" },
    ],
    queryFn: () =>
      getClasses({ page: 0, pageSize: 1000, search: "", grade: "ALL" }),
    staleTime: 5 * 60 * 1000,
  });

  const classes = classesQuery.data?.data || [];
  const classMap = useMemo(() => {
    const map = {};
    classes.forEach((c) => (map[c.id] = c));
    return map;
  }, [classes]);

  // ---------------------------
  // 2) Teacher: resolve teacherId (GV001) from auth_user.id
  //    => then fetch class-subjects for that teacherId => allowedClassIds
  // ---------------------------
  const teacherMetaQuery = useQuery({
    enabled: !!user && isTeacher, // chỉ chạy nếu teacher
    queryKey: ["teacher-meta-by-userid", user?.id],
    queryFn: async () => {
      // lấy toàn bộ teachers (thường không quá nhiều)
      const res = await getTeachers({ page: 0, pageSize: 9999 });
      const arr = Array.isArray(res?.data) ? res.data : [];
      const me = arr.find((t) => Number(t.userid) === Number(user.id));
      return { teacherId: me?.id || null };
    },
    staleTime: 60 * 1000,
  });

  const teacherId = teacherMetaQuery.data?.teacherId || null;

  const teacherAssignmentsQuery = useQuery({
    enabled: !!teacherId && isTeacher,
    queryKey: ["teacher-assignments", teacherId],
    queryFn: async () => {
      const res = await getClassSubjects({
        page: 0,
        pageSize: 9999,
        teacherId,
        classId: "ALL",
        subjectId: "ALL",
      });

      const rows = Array.isArray(res?.data) ? res.data : [];
      const classIds = new Set(
        rows.map((x) => Number(x.classId)).filter((n) => Number.isFinite(n))
      );
      return { classIds };
    },
    staleTime: 30 * 1000,
  });

  const allowedClassIds = teacherAssignmentsQuery.data?.classIds || new Set();

  const canTeacherEditClass = (classId) => {
    const n = Number(classId);
    if (!Number.isFinite(n)) return false;
    return allowedClassIds.has(n);
  };

  const canEditStudent = (s) => {
    if (isAdmin) return true;
    if (isTeacher) return canTeacherEditClass(s?.current_class_id);
    return false;
  };

  // ---------------------------
  // 3) Query list students
  // ---------------------------
  const studentsQuery = useQuery({
    queryKey: [
      "students",
      { page, pageSize, search, classFilter, statusFilter, isAdmin },
    ],
    queryFn: () =>
      getStudents({
        page,
        pageSize,
        search,
        classId: classFilter,
        status: statusFilter,
        includePassword: isAdmin ? 1 : 0, // ✅ only admin
      }),
    keepPreviousData: true,
  });

  // ---------------------------
  // 4) Mutations
  // ---------------------------
  const createMutation = useMutation({
    mutationFn: (payload) => createStudent(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      handleCloseDialog();

      if (isAdmin && created?.password) {
        showToast(`Đã tạo HS. Password: ${created.password}`, "success");
      } else {
        showToast("Đã tạo học sinh", "success");
      }
    },
    onError: (err) => {
      const msg = err?.message || "Tạo học sinh thất bại";
      showToast(msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStudent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      handleCloseDialog();
      showToast("Đã cập nhật học sinh", "success");
    },
    onError: (err) => {
      const msg = err?.message || "Cập nhật thất bại";
      showToast(msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      showToast("Đã xóa học sinh", "success");
    },
    onError: (err) => {
      const msg = err?.message || "Xóa thất bại";
      showToast(msg, "error");
    },
  });

  const handleChangePage = (e, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormValues({
      id: "",
      fullname: "",
      email: "",
      dob: "",
      gender: "",
      address: "",
      current_class_id: "",
      guardian_name: "",
      guardian_phone: "",
      guardian_job: "",
      guardian_citizenid: "",
      status: "ACTIVE",
      note: "",
      password: "",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (student) => {
    // ✅ chặn mở dialog nếu teacher không có quyền
    if (!canEditStudent(student)) {
      showToast(
        "Bạn chỉ được chỉnh sửa học sinh thuộc lớp được phân công",
        "warning"
      );
      return;
    }

    setEditingStudent(student);
    setFormValues({
      id: student.id,
      fullname: student.fullname || "",
      email: student.email || "",
      dob: toDateInputValue(student.dob),
      gender: student.gender || "",
      address: student.address || "",
      current_class_id: student.current_class_id || "",
      guardian_name: student.guardian_name || "",
      guardian_phone: student.guardian_phone || "",
      guardian_job: student.guardian_job || "",
      guardian_citizenid: student.guardian_citizenid || "",
      status: student.status || "ACTIVE",
      note: student.note || "",
      password: student.password || "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = () => {
    // ✅ Teacher phải load được teacherId + assignments trước khi tạo/sửa
    if (isTeacher && !teacherId) {
      return showToast(
        "Không xác định được mã giáo viên (teacherId). Kiểm tra bảng teachers.userid.",
        "error"
      );
    }

    const id = (formValues.id || "").trim().toUpperCase(); // optional
    const fullname = toTitleCase(formValues.fullname || "");
    const email = (formValues.email || "").trim();
    const dob = formValues.dob || "";
    const gender = formValues.gender || "";
    const address = (formValues.address || "").trim();
    const current_class_id = formValues.current_class_id || "";

    const guardian_name = toTitleCase(formValues.guardian_name || "");
    const guardian_phone = normalizeDigits(formValues.guardian_phone || "");
    const guardian_job = (formValues.guardian_job || "").trim();
    const guardian_citizenid = normalizeDigits(
      formValues.guardian_citizenid || ""
    );

    const status = formValues.status || "ACTIVE";
    const note = (formValues.note || "").trim();

    // REQUIRED
    if (!fullname) return showToast("Vui lòng nhập họ tên học sinh", "warning");

    if (!email) return showToast("Vui lòng nhập email", "warning");
    if (!isAllowedEmail(email)) {
      return showToast(
        "Email không hợp lệ. Chỉ chấp nhận @gmail.com hoặc domain .edu/.edu.vn/.ac.vn",
        "warning"
      );
    }

    if (!dob) return showToast("Vui lòng nhập ngày sinh", "warning");
    if (!isAtLeast10(dob))
      return showToast("Học sinh phải đủ 10 tuổi", "warning");

    if (!gender) return showToast("Vui lòng chọn giới tính", "warning");

    if (!current_class_id)
      return showToast("Vui lòng chọn lớp hiện tại", "warning");

    // ✅ Teacher chỉ được thao tác HS thuộc lớp được phân công
    if (isTeacher && !canTeacherEditClass(current_class_id)) {
      return showToast(
        "Bạn không được phân công lớp này nên không thể tạo/sửa học sinh",
        "warning"
      );
    }

    if (!guardian_name)
      return showToast("Vui lòng nhập tên người giám hộ", "warning");

    if (!guardian_phone)
      return showToast("Vui lòng nhập SĐT giám hộ", "warning");
    if (!isValidPhoneVN(guardian_phone)) {
      return showToast(
        "SĐT giám hộ không hợp lệ. Phải bắt đầu bằng 0 và đủ 10 số.",
        "warning"
      );
    }

    if (guardian_citizenid && !isValidCitizenId12(guardian_citizenid)) {
      return showToast("CCCD giám hộ không hợp lệ. Phải đủ 12 số.", "warning");
    }

    // normalize setState (optional)
    if (formValues.fullname !== fullname)
      handleFormChange("fullname", fullname);
    if (formValues.guardian_name !== guardian_name)
      handleFormChange("guardian_name", guardian_name);
    if (formValues.guardian_phone !== guardian_phone)
      handleFormChange("guardian_phone", guardian_phone);
    if (formValues.guardian_citizenid !== guardian_citizenid)
      handleFormChange("guardian_citizenid", guardian_citizenid);
    if (formValues.id !== id) handleFormChange("id", id);

    const payload = {
      ...(editingStudent ? {} : id ? { id } : {}),
      fullname,
      email,
      dob,
      gender,
      current_class_id: Number(current_class_id),

      guardian_name,
      guardian_phone,
      guardian_job: guardian_job || undefined,
      guardian_citizenid: guardian_citizenid || undefined,

      status,
      address: address || undefined,
      note: note || undefined,
    };

    if (editingStudent) {
      // ✅ Teacher chỉ được update HS thuộc phân công
      if (isTeacher && !canEditStudent(editingStudent)) {
        return showToast(
          "Bạn chỉ được chỉnh sửa học sinh thuộc lớp được phân công",
          "warning"
        );
      }
      updateMutation.mutate({ id: editingStudent.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteStudent = (student) => {
    // ✅ Teacher chỉ được xóa HS thuộc phân công
    if (!canEditStudent(student)) {
      showToast(
        "Bạn chỉ được xóa học sinh thuộc lớp được phân công",
        "warning"
      );
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc muốn xóa học sinh ${student.fullname} (${student.id})?`
      )
    ) {
      deleteMutation.mutate(student.id);
    }
  };

  const { data, isLoading } = studentsQuery;
  const rows = data?.data || [];
  const total = data?.total || 0;

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Quản lý học sinh
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            label="Tìm kiếm (mã HS, tên, giám hộ, SĐT)"
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 280 }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Lớp</InputLabel>
            <Select
              label="Lớp"
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(0);
              }}
              disabled={classesQuery.isLoading}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.year_start}-{c.year_end})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              label="Trạng thái"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            </Select>
          </FormControl>

          <Box flexGrow={1} />

          {/* ✅ Admin always can add; Teacher can add but only to assigned classes (validated on submit) */}
          {(isAdmin || isTeacher) && (
            <Button
              variant="contained"
              onClick={handleOpenCreate}
              disabled={isTeacher && teacherAssignmentsQuery.isLoading}
              title={
                isTeacher ? "Giáo viên chỉ tạo HS cho lớp được phân công" : ""
              }
            >
              Thêm học sinh
            </Button>
          )}
        </Box>
      </Paper>

      {/* Table */}
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Mã HS</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Lớp</TableCell>
                  <TableCell>Giám hộ</TableCell>
                  <TableCell>SĐT giám hộ</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((s) => {
                  const clazz = s.current_class_id
                    ? classMap[s.current_class_id]
                    : null;
                  const canEdit = canEditStudent(s);

                  return (
                    <TableRow
                      key={s.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => openStudentDrawer(s)}
                    >
                      <TableCell>{s.id}</TableCell>
                      <TableCell>{s.fullname}</TableCell>
                      <TableCell>{clazz ? clazz.name : "-"}</TableCell>
                      <TableCell>{s.guardian_name || "-"}</TableCell>
                      <TableCell>{s.guardian_phone || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={s.status}
                          color={s.status === "ACTIVE" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {(isAdmin || isTeacher) && (
                          <>
                            {canEdit ? (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(s);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteStudent(s);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              isTeacher && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Chỉ xem
                                </Typography>
                              )
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Không có học sinh nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </Paper>
      )}

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingStudent ? "Chỉnh sửa học sinh" : "Thêm học sinh mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box mt={1}>
            <Grid container spacing={2}>
              {!editingStudent && (
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Mã HS (tùy chọn)"
                    value={formValues.id}
                    onChange={(e) => handleFormChange("id", e.target.value)}
                    fullWidth
                    placeholder="VD: HS010 (bỏ trống để tự tạo)"
                    disabled={isTeacher} // ✅ giáo viên không tự đặt mã (tránh lách)
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={editingStudent ? 6 : 8}>
                <TextField
                  label="Họ tên học sinh *"
                  value={formValues.fullname}
                  onChange={(e) => handleFormChange("fullname", e.target.value)}
                  onBlur={() =>
                    handleFormChange(
                      "fullname",
                      toTitleCase(formValues.fullname)
                    )
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email *"
                  value={formValues.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ngày sinh *"
                  type="date"
                  value={formValues.dob}
                  onChange={(e) => handleFormChange("dob", e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Giới tính *</InputLabel>
                  <Select
                    label="Giới tính *"
                    value={formValues.gender}
                    onChange={(e) => handleFormChange("gender", e.target.value)}
                  >
                    <MenuItem value="">Chọn</MenuItem>
                    <MenuItem value="M">Nam</MenuItem>
                    <MenuItem value="F">Nữ</MenuItem>
                    <MenuItem value="O">Khác</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={8}>
                <FormControl fullWidth>
                  <InputLabel>Lớp hiện tại *</InputLabel>
                  <Select
                    label="Lớp hiện tại *"
                    value={formValues.current_class_id}
                    onChange={(e) =>
                      handleFormChange("current_class_id", e.target.value)
                    }
                    disabled={classesQuery.isLoading}
                  >
                    <MenuItem value="">Chọn</MenuItem>
                    {classes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} ({c.year_start}-{c.year_end})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* ✅ teacher hint */}
                {isTeacher && (
                  <Typography variant="caption" color="text.secondary">
                    Giáo viên chỉ được tạo/sửa học sinh thuộc lớp được phân
                    công.
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Địa chỉ (không bắt buộc)"
                  value={formValues.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tên người giám hộ *"
                  value={formValues.guardian_name}
                  onChange={(e) =>
                    handleFormChange("guardian_name", e.target.value)
                  }
                  onBlur={() =>
                    handleFormChange(
                      "guardian_name",
                      toTitleCase(formValues.guardian_name)
                    )
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="SĐT giám hộ *"
                  value={formValues.guardian_phone}
                  onChange={(e) =>
                    handleFormChange("guardian_phone", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nghề nghiệp giám hộ (không bắt buộc)"
                  value={formValues.guardian_job}
                  onChange={(e) =>
                    handleFormChange("guardian_job", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="CCCD giám hộ (không bắt buộc)"
                  value={formValues.guardian_citizenid}
                  onChange={(e) =>
                    handleFormChange("guardian_citizenid", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    label="Trạng thái"
                    value={formValues.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                  >
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Ghi chú (không bắt buộc)"
                  value={formValues.note}
                  onChange={(e) => handleFormChange("note", e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>

              {/* Password view (admin only) */}
              {isAdmin && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mật khẩu (admin xem)"
                    value={formValues.password || ""}
                    fullWidth
                    disabled
                    placeholder="Tạo mới xong sẽ hiện ở thông báo / drawer"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmitForm}
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={closeStudentDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 460 },
            p: 2.25,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          },
        }}
      >
        {!selectedStudent
          ? null
          : (() => {
              const clazz = selectedStudent.current_class_id
                ? classMap[selectedStudent.current_class_id]
                : null;

              const canEdit = canEditStudent(selectedStudent);

              return (
                <Stack spacing={2.25} sx={{ height: "100%" }}>
                  {/* Header */}
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 52, height: 52 }}>
                        {(selectedStudent.fullname || "?")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 800, lineHeight: 1.2 }}
                          noWrap
                        >
                          {selectedStudent.fullname}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mt: 0.25 }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.25}
                            alignItems="center"
                          >
                            <Typography variant="body2" color="text.secondary">
                              {selectedStudent.id}
                            </Typography>
                            <Tooltip title="Copy mã học sinh">
                              <IconButton
                                size="small"
                                sx={{ p: 0.25 }}
                                onClick={() =>
                                  copyToClipboard(
                                    selectedStudent.id,
                                    "mã học sinh"
                                  )
                                }
                              >
                                <ContentCopyIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>

                          <Typography variant="body2" color="text.secondary">
                            •
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {clazz ? clazz.name : "Chưa có lớp"}
                          </Typography>
                        </Stack>
                      </Box>

                      <Chip
                        label={selectedStudent.status}
                        color={
                          selectedStudent.status === "ACTIVE"
                            ? "success"
                            : "default"
                        }
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>

                  {/* Info */}
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ width: 110, flexShrink: 0 }}
                        >
                          Email
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ flex: 1, minWidth: 0 }}
                          noWrap
                        >
                          {selectedStudent.email || "-"}
                        </Typography>
                        {selectedStudent.email && (
                          <Tooltip title="Copy email">
                            <IconButton
                              size="small"
                              sx={{ p: 0.25 }}
                              onClick={() =>
                                copyToClipboard(selectedStudent.email, "email")
                              }
                            >
                              <ContentCopyIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>

                      {/* Password (admin only) */}
                      {isAdmin && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ width: 110, flexShrink: 0 }}
                          >
                            Password
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ flex: 1, minWidth: 0 }}
                            noWrap
                          >
                            {selectedStudent.password || "-"}
                          </Typography>
                          {selectedStudent.password && (
                            <Tooltip title="Copy password">
                              <IconButton
                                size="small"
                                sx={{ p: 0.25 }}
                                onClick={() =>
                                  copyToClipboard(
                                    selectedStudent.password,
                                    "password"
                                  )
                                }
                              >
                                <ContentCopyIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      )}

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ width: 110, flexShrink: 0 }}
                        >
                          Ngày sinh
                        </Typography>
                        <Typography variant="body2">
                          {toDateInputValue(selectedStudent.dob) || "-"}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ width: 110, flexShrink: 0 }}
                        >
                          Giới tính
                        </Typography>
                        <Typography variant="body2">
                          {selectedStudent.gender === "M"
                            ? "Nam"
                            : selectedStudent.gender === "F"
                            ? "Nữ"
                            : "Khác"}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ width: 110, flexShrink: 0, pt: 0.25 }}
                        >
                          Địa chỉ
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {selectedStudent.address || "-"}
                        </Typography>
                      </Stack>

                      <Divider sx={{ my: 0.5 }} />

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ width: 110, flexShrink: 0 }}
                        >
                          Giám hộ
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ flex: 1, minWidth: 0 }}
                          noWrap
                        >
                          {selectedStudent.guardian_name || "-"}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ width: 110, flexShrink: 0 }}
                        >
                          SĐT giám hộ
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ flex: 1, minWidth: 0 }}
                          noWrap
                        >
                          {selectedStudent.guardian_phone || "-"}
                        </Typography>
                        {selectedStudent.guardian_phone && (
                          <Tooltip title="Copy SĐT giám hộ">
                            <IconButton
                              size="small"
                              sx={{ p: 0.25 }}
                              onClick={() =>
                                copyToClipboard(
                                  selectedStudent.guardian_phone,
                                  "SĐT giám hộ"
                                )
                              }
                            >
                              <ContentCopyIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ width: 110, flexShrink: 0 }}
                        >
                          Nghề nghiệp
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ flex: 1, minWidth: 0 }}
                          noWrap
                        >
                          {selectedStudent.guardian_job || "-"}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ width: 110, flexShrink: 0 }}
                        >
                          CCCD giám hộ
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ flex: 1, minWidth: 0 }}
                          noWrap
                        >
                          {selectedStudent.guardian_citizenid || "-"}
                        </Typography>
                        {selectedStudent.guardian_citizenid && (
                          <Tooltip title="Copy CCCD giám hộ">
                            <IconButton
                              size="small"
                              sx={{ p: 0.25 }}
                              onClick={() =>
                                copyToClipboard(
                                  selectedStudent.guardian_citizenid,
                                  "CCCD giám hộ"
                                )
                              }
                            >
                              <ContentCopyIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Note */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, mb: 1, color: "text.secondary" }}
                    >
                      Ghi chú
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {selectedStudent.note || "Không có ghi chú"}
                      </Typography>
                    </Paper>
                  </Box>

                  <Box flexGrow={1} />

                  <Divider />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button onClick={closeStudentDrawer}>Đóng</Button>

                    {/* ✅ ADMIN: full actions; TEACHER: only if assigned; otherwise view-only */}
                    {(isAdmin || isTeacher) && canEdit && (
                      <>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            closeStudentDrawer();
                            handleDeleteStudent(selectedStudent);
                          }}
                        >
                          Xóa
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => {
                            closeStudentDrawer();
                            handleOpenEdit(selectedStudent);
                          }}
                        >
                          Chỉnh sửa
                        </Button>
                      </>
                    )}
                  </Stack>
                </Stack>
              );
            })()}
      </Drawer>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
