// src/pages/admin/teachers/TeachersPage.jsx
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
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../../../api/teachersApi";
import { getSubjects } from "../../../api/subjectsApi";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminTeachersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // Filter & pagination
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formValues, setFormValues] = useState({
    id: "",
    fullname: "",
    email: "",
    dob: "",
    gender: "",
    address: "",
    phone: "",
    citizenid: "",
    mainsubject: "",
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
  const [selectedTeacher, setSelectedTeacher] = useState(null);

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

  const isAtLeast18 = (dobStr) => {
    if (!dobStr) return true;
    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 18;
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

  const copyToClipboard = async (text, label = "Nội dung") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Đã copy ${label}`, "success");
    } catch {
      showToast("Không thể copy, vui lòng thử lại", "error");
    }
  };

  // Query list teachers
  const teachersQuery = useQuery({
    queryKey: [
      "teachers",
      { page, pageSize, search, subjectFilter, statusFilter },
    ],
    queryFn: () =>
      getTeachers({
        page,
        pageSize,
        search,
        subject: subjectFilter,
        status: statusFilter,
      }),
    keepPreviousData: true,
  });

  const subjectsQuery = useQuery({
    queryKey: [
      "subjects",
      { page: 0, pageSize: 1000, search: "", status: "ACTIVE" },
    ],
    queryFn: () =>
      getSubjects({ page: 0, pageSize: 1000, search: "", status: "ACTIVE" }),
    staleTime: 5 * 60 * 1000,
  });

  // robust: apiGet thường trả {data,total}
  const subjectOptions = useMemo(() => {
    const d = subjectsQuery.data;
    if (!d) return [];
    // trường hợp getSubjects trả {data,total}
    if (Array.isArray(d.data)) return d.data;
    // trường hợp trả thẳng array
    if (Array.isArray(d)) return d;
    return [];
  }, [subjectsQuery.data]);

  const createMutation = useMutation({
    mutationFn: (payload) => createTeacher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["teachers"]);
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateTeacher(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["teachers"]);
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["teachers"]);
    },
  });

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setFormValues({
      id: "",
      fullname: "",
      email: "",
      dob: "",
      gender: "",
      address: "",
      phone: "",
      citizenid: "",
      mainsubject: "",
      status: "ACTIVE",
      note: "",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormValues({
      id: teacher.id,
      fullname: teacher.fullname,
      email: teacher.email,
      dob: teacher.dob || "",
      gender: teacher.gender || "",
      address: teacher.address || "",
      phone: teacher.phone || "",
      citizenid: teacher.citizenid || "",
      mainsubject: teacher.mainsubject || "",
      status: teacher.status || "ACTIVE",
      note: teacher.note || "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTeacher(null);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const openTeacherDrawer = (t) => {
    setSelectedTeacher(t);
    setOpenDrawer(true);
  };

  const closeTeacherDrawer = () => {
    setOpenDrawer(false);
    setSelectedTeacher(null);
  };

  const handleSubmitForm = () => {
    const fullname = toTitleCase(formValues.fullname || "");
    const email = formValues.email?.trim() || "";
    const dob = formValues.dob || "";
    const gender = formValues.gender || "";
    const address = formValues.address?.trim() || "";
    const phoneDigits = formValues.phone
      ? normalizeDigits(formValues.phone)
      : "";
    const citizenDigits = formValues.citizenid
      ? normalizeDigits(formValues.citizenid)
      : "";
    const mainsubject = formValues.mainsubject || "";
    const status = formValues.status || "ACTIVE";
    const note = formValues.note?.trim() || "";

    if (!fullname) {
      alert("Vui lòng nhập họ tên giáo viên");
      return;
    }

    if (email && !isAllowedEmail(email)) {
      alert(
        "Email không hợp lệ. Chỉ chấp nhận @gmail.com hoặc domain .edu/.edu.vn/.ac.vn"
      );
      return;
    }

    if (dob && !isAtLeast18(dob)) {
      alert("Giáo viên phải đủ 18 tuổi. Vui lòng nhập lại ngày sinh.");
      return;
    }

    if (phoneDigits && !isValidPhoneVN(phoneDigits)) {
      alert("SĐT không hợp lệ. Phải bắt đầu bằng 0 và đủ 10 số.");
      return;
    }

    if (citizenDigits && !isValidCitizenId(citizenDigits)) {
      alert("CCCD không hợp lệ. CCCD phải đủ 12 số.");
      return;
    }

    const payload = {
      ...(formValues.id?.trim() ? { id: formValues.id.trim() } : {}),

      fullname,
      email: email || undefined,
      dob: dob || undefined,
      gender: gender || undefined,
      address: address || undefined,
      phone: phoneDigits || undefined,
      citizenid: citizenDigits || undefined,
      mainsubject: mainsubject || undefined,
      status: status || undefined,
      note: note || undefined,
    };

    if (formValues.fullname !== fullname) {
      handleFormChange("fullname", fullname);
    }
    if (formValues.phone && phoneDigits !== formValues.phone) {
      handleFormChange("phone", phoneDigits);
    }
    if (formValues.citizenid && citizenDigits !== formValues.citizenid) {
      handleFormChange("citizenid", citizenDigits);
    }

    if (editingTeacher) {
      const { id, ...rest } = payload;
      updateMutation.mutate({ id: editingTeacher.id, payload: rest });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteTeacher = (teacher) => {
    if (window.confirm(`Bạn có chắc muốn xóa giáo viên ${teacher.fullname}?`)) {
      deleteMutation.mutate(teacher.id);
    }
  };

  const { data, isLoading } = teachersQuery;
  const rows = data?.data || [];
  const total = data?.total || 0;

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Quản lý giáo viên
      </Typography>

      {/* Bộ lọc */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          label="Tìm kiếm (mã GV, tên, SĐT)"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 260 }}
        />

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Môn</InputLabel>
          <Select
            label="Môn"
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>

            {subjectOptions.map((s) => (
              <MenuItem key={s.id} value={s.name}>
                {s.name} ({s.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
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

        {isAdmin && (
          <Button variant="contained" onClick={handleOpenCreate}>
            Thêm giáo viên
          </Button>
        )}
      </Box>

      {/* Bảng giáo viên */}
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã GV</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Môn chính</TableCell>
                <TableCell>SĐT</TableCell>
                <TableCell>CCCD</TableCell>
                <TableCell>Giới tính</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((t) => (
                <TableRow
                  key={t.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => openTeacherDrawer(t)}
                >
                  <TableCell>{t.id}</TableCell>
                  <TableCell>{t.fullname}</TableCell>
                  <TableCell>{t.mainsubject}</TableCell>
                  <TableCell>{t.phone}</TableCell>
                  <TableCell>{t.citizenid}</TableCell>
                  <TableCell>
                    {t.gender === "M" ? "Nam" : t.gender === "F" ? "Nữ" : ""}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.status}
                      color={t.status === "ACTIVE" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {isAdmin && (
                      <>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(t);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTeacher(t);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có giáo viên nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </>
      )}

      {/* Dialog thêm/sửa giáo viên */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingTeacher ? "Chỉnh sửa giáo viên" : "Thêm giáo viên mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box mt={1}>
            <Grid container spacing={2}>
              {!editingTeacher && (
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Mã giáo viên (tùy chọn)"
                    value={formValues.id}
                    onChange={(e) => handleFormChange("id", e.target.value)}
                    fullWidth
                    placeholder="VD: GV010 (bỏ trống để hệ thống tự tạo)"
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={editingTeacher ? 6 : 8}>
                <TextField
                  label="Họ tên giáo viên"
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
                  label="Email"
                  value={formValues.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
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
                    <MenuItem value="O">Khác</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="SĐT"
                  value={formValues.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="CCCD"
                  value={formValues.citizenid}
                  onChange={(e) =>
                    handleFormChange("citizenid", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  label="Địa chỉ"
                  value={formValues.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Môn chính</InputLabel>
                  <Select
                    label="Môn chính"
                    value={formValues.mainsubject || ""}
                    onChange={(e) =>
                      handleFormChange("mainsubject", e.target.value)
                    }
                  >
                    <MenuItem value="">Chưa chọn</MenuItem>

                    {subjectOptions.map((s) => (
                      <MenuItem key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
        onClose={closeTeacherDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 440 },
            p: 2.25,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          },
        }}
      >
        {!selectedTeacher ? null : (
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
                  {(selectedTeacher.fullname || "?")
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, lineHeight: 1.2 }}
                    noWrap
                  >
                    {selectedTeacher.fullname}
                  </Typography>

                  {/* ID + subject + copy */}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 0.25 }}
                  >
                    {/* Mã GV + copy dính sát */}
                    <Stack direction="row" spacing={0.25} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {selectedTeacher.id}
                      </Typography>

                      <Tooltip title="Copy mã giáo viên">
                        <IconButton
                          size="small"
                          sx={{ p: 0.25 }}
                          onClick={() =>
                            copyToClipboard(selectedTeacher.id, "mã giáo viên")
                          }
                        >
                          <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>

                    <Typography variant="body2" color="text.secondary" noWrap>
                      {selectedTeacher.mainsubject || "Chưa chọn môn"}
                    </Typography>
                  </Stack>
                </Box>

                <Chip
                  label={selectedTeacher.status}
                  color={
                    selectedTeacher.status === "ACTIVE" ? "success" : "default"
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
                {/* Email row */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 92, flexShrink: 0 }}
                  >
                    Email
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ flex: 1, minWidth: 0 }}
                    noWrap
                  >
                    {selectedTeacher.email || "-"}
                  </Typography>

                  {selectedTeacher.email && (
                    <Tooltip title="Copy email">
                      <IconButton
                        size="small"
                        sx={{ p: 0.25 }}
                        onClick={() =>
                          copyToClipboard(selectedTeacher.email, "email")
                        }
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {/* DOB */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 92, flexShrink: 0 }}
                  >
                    Ngày sinh
                  </Typography>
                  <Typography variant="body2">
                    {toDateInputValue(selectedTeacher.dob) || "-"}
                  </Typography>
                </Stack>

                {/* Gender */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 92, flexShrink: 0 }}
                  >
                    Giới tính
                  </Typography>
                  <Typography variant="body2">
                    {selectedTeacher.gender === "M"
                      ? "Nam"
                      : selectedTeacher.gender === "F"
                      ? "Nữ"
                      : "Khác"}
                  </Typography>
                </Stack>

                {/* Phone + copy */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 92, flexShrink: 0 }}
                  >
                    Số điện thoại
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ flex: 1, minWidth: 0 }}
                    noWrap
                  >
                    {selectedTeacher.phone || "-"}
                  </Typography>

                  {selectedTeacher.phone && (
                    <Tooltip title="Copy số điện thoại">
                      <IconButton
                        size="small"
                        sx={{ p: 0.25 }}
                        onClick={() =>
                          copyToClipboard(
                            selectedTeacher.phone,
                            "số điện thoại"
                          )
                        }
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {/* CCCD */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 92, flexShrink: 0 }}
                  >
                    CCCD
                  </Typography>
                  <Typography variant="body2">
                    {selectedTeacher.citizenid || "-"}
                  </Typography>
                </Stack>

                {/* Address */}
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 92, flexShrink: 0, pt: 0.25 }}
                  >
                    Địa chỉ
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {selectedTeacher.address || "-"}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Note */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}
              >
                Ghi chú
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {selectedTeacher.note || "Không có ghi chú"}
                </Typography>
              </Paper>
            </Box>

            <Box flexGrow={1} />

            {/* Actions */}
            <Divider />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={closeTeacherDrawer}>Đóng</Button>

              {isAdmin && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      closeTeacherDrawer();
                      handleDeleteTeacher(selectedTeacher);
                    }}
                  >
                    Xóa
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => {
                      closeTeacherDrawer();
                      handleOpenEdit(selectedTeacher);
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        )}
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
