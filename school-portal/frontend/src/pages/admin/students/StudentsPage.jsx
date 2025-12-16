// src/pages/admin/students/StudentsPage.jsx
import { useState, useMemo } from "react";
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

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();

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
    id: "",
    fullname: "",
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
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success", // success | info | warning | error
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
  const isValidCitizenId = (s = "") => /^\d{12}$/.test(s);

  const isAllowedEmail = (email) => {
    if (!email) return true;
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
    if (!dobStr) return true;
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

  // Load classes để hiển thị tên lớp + dropdown chọn lớp
  const classesQuery = useQuery({
    queryKey: [
      "classes",
      { page: 0, pageSize: 100, search: "", gradeFilter: "ALL" },
    ],
    queryFn: () =>
      getClasses({ page: 0, pageSize: 100, search: "", grade: "ALL" }),
  });

  const classes = classesQuery.data?.data || [];

  const classMap = useMemo(() => {
    const map = {};
    classes.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [classes]);

  // Query list students
  const studentsQuery = useQuery({
    queryKey: [
      "students",
      { page, pageSize, search, classFilter, statusFilter },
    ],
    queryFn: () =>
      getStudents({
        page,
        pageSize,
        search,
        classId: classFilter,
        status: statusFilter,
      }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      handleCloseDialog();
      showToast("Đã tạo học sinh", "success");
    },
    onError: () => showToast("Tạo học sinh thất bại", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStudent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      handleCloseDialog();
      showToast("Đã cập nhật học sinh", "success");
    },
    onError: () => showToast("Cập nhật thất bại", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      showToast("Đã xóa học sinh", "success");
    },
    onError: () => showToast("Xóa thất bại", "error"),
  });

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormValues({
      id: "",
      fullname: "",
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

  const openStudentDrawer = (s) => {
    setSelectedStudent(s);
    setOpenDrawer(true);
  };

  const closeStudentDrawer = () => {
    setOpenDrawer(false);
    setSelectedStudent(null);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormValues({
      id: student.id,
      fullname: student.fullname,
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
    });
    setOpenDialog(true);
    console.log("student khi edit =", student);
  };

  const handleSubmitForm = () => {
    const fullname = toTitleCase(formValues.fullname || "");
    const dob = formValues.dob || "";
    const gender = formValues.gender || "";
    const address = formValues.address?.trim() || "";
    const current_class_id = formValues.current_class_id || "";
    const guardian_name = toTitleCase(formValues.guardian_name || "");
    const guardian_phone = formValues.guardian_phone
      ? normalizeDigits(formValues.guardian_phone)
      : "";
    const guardian_job = formValues.guardian_job || "";
    const guardian_citizenid = formValues.guardian_citizenid
      ? normalizeDigits(formValues.guardian_citizenid)
      : "";
    const status = formValues.status || "ACTIVE";
    const note = formValues.note?.trim() || "";

    if (!fullname) {
      return showToast("Vui lòng nhập họ tên học sinh", "warning");
    }

    if (!current_class_id) {
      return showToast("Vui lòng chọn lớp hiện tại", "warning");
    }

    if (dob && !isAtLeast10(dob)) {
      showToast(
        "Học sinh phải nhập tuổi phù hợp. Vui lòng nhập lại ngày sinh."
      );
      return;
    }

    if (guardian_phone && !isValidPhoneVN(guardian_phone)) {
      showToast("SĐT không hợp lệ. Phải bắt đầu bằng 0 và đủ 10 số.");
      return;
    }

    if (guardian_citizenid && !isValidCitizenId(guardian_citizenid)) {
      showToast("CCCD không hợp lệ. CCCD phải đủ 12 số.");
      return;
    }

    const payload = {
      ...(formValues.id?.trim() ? { id: formValues.id.trim() } : {}),

      fullname,
      dob: dob || undefined,
      gender: gender || undefined,
      address: address || undefined,
      current_class_id: Number(current_class_id),
      guardian_name: guardian_name || undefined,
      guardian_phone: guardian_phone || undefined,
      guardian_job: guardian_job || undefined,
      guardian_citizenid: guardian_citizenid || undefined,
      status: status || undefined,
      note: note || undefined,
    };

    if (formValues.fullname !== fullname) {
      handleFormChange("fullname", fullname);
    }
    if (formValues.guardian_name !== guardian_name) {
      handleFormChange("guardian_name", guardian_name);
    }
    if (
      formValues.guardian_phone &&
      guardian_phone !== formValues.guardian_phone
    ) {
      handleFormChange("guardian_phone", guardian_phone);
    }
    if (
      formValues.guardian_citizenid &&
      guardian_citizenid !== formValues.guardian_citizenid
    ) {
      handleFormChange("guardian_citizenid", guardian_citizenid);
    }

    if (editingStudent) {
      const { id, ...rest } = payload;
      updateMutation.mutate({ id: editingStudent.id, payload: rest });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteStudent = (student) => {
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

          <Button variant="contained" onClick={handleOpenCreate}>
            Thêm học sinh
          </Button>
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

                  return (
                    <TableRow
                      key={s.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => openStudentDrawer(s)}
                    >
                      <TableCell sx={{ fontWeight: 700 }}>{s.id}</TableCell>
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

      {/* Dialog thêm/sửa học sinh */}
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
                    placeholder="VD: HS010 (bỏ trống để hệ thống tự tạo)"
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={editingStudent ? 6 : 8}>
                <TextField
                  label="Họ tên học sinh"
                  value={formValues.fullname}
                  onChange={(e) => handleFormChange("fullname", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Ngày sinh"
                  type="date"
                  value={formValues.dob}
                  onChange={(e) => handleFormChange("dob", e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    label="Giới tính"
                    value={formValues.gender}
                    onChange={(e) => handleFormChange("gender", e.target.value)}
                  >
                    <MenuItem value="">Chưa chọn</MenuItem>
                    <MenuItem value="M">Nam</MenuItem>
                    <MenuItem value="F">Nữ</MenuItem>
                    <MenuItem value="OTHER">Khác</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Lớp hiện tại</InputLabel>
                  <Select
                    label="Lớp hiện tại"
                    value={formValues.current_class_id}
                    onChange={(e) =>
                      handleFormChange("current_class_id", e.target.value)
                    }
                  >
                    {classes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} ({c.year_start}-{c.year_end})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Địa chỉ"
                  value={formValues.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tên người giám hộ"
                  value={formValues.guardian_name}
                  onChange={(e) =>
                    handleFormChange("guardian_name", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="SĐT giám hộ"
                  value={formValues.guardian_phone}
                  onChange={(e) =>
                    handleFormChange("guardian_phone", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Nghề nghiệp giám hộ"
                  value={formValues.guardian_job}
                  onChange={(e) =>
                    handleFormChange("guardian_job", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="CCCD người giám hộ"
                  value={formValues.guardian_citizenid}
                  onChange={(e) =>
                    handleFormChange("guardian_citizenid", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={3}>
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
                  label="Ghi chú"
                  value={formValues.note}
                  onChange={(e) => handleFormChange("note", e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
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

              return (
                <Stack spacing={2.25} sx={{ height: "100%" }}>
                  {/* Header card */}
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
                          {/* ID + copy */}
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

                  {/* Info card */}
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
                  </Stack>
                </Stack>
              );
            })()}
      </Drawer>
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
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
