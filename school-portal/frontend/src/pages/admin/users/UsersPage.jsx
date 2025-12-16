// src/pages/admin/users/UsersPage.jsx
import { useMemo, useState } from "react";
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

import EditIcon from "@mui/icons-material/Edit";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
} from "../../../api/usersApi";
import { createStudent } from "../../../api/studentsApi";
import { createTeacher } from "../../../api/teachersApi";
import { getClasses } from "../../../api/classesApi";
import { getSubjects } from "../../../api/subjectsApi";

const emptyForm = {
  username: "",
  fullname: "",
  email: "",
  phone: "",
  role: "STUDENT",

  student_id: "",
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

  teacher_id: "",
  citizenid: "",
  mainsubject: "",
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formValues, setFormValues] = useState({ ...emptyForm });

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
  const [selectedUser, setSelectedUser] = useState(null);

  const openUserDrawer = (u) => {
    setSelectedUser(u);
    setOpenDrawer(true);
  };

  const closeUserDrawer = () => {
    setOpenDrawer(false);
    setSelectedUser(null);
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

  // Load classes (for STUDENT role)
  const classesQuery = useQuery({
    queryKey: ["classes", { page: 0, pageSize: 200, search: "", grade: "ALL" }],
    queryFn: () =>
      getClasses({ page: 0, pageSize: 200, search: "", grade: "ALL" }),
    enabled: openDialog && formValues.role === "STUDENT" && !editingUser,
  });

  const classes = classesQuery.data?.data || [];
  const classMap = useMemo(() => {
    const m = {};
    classes.forEach((c) => (m[c.id] = c));
    return m;
  }, [classes]);

  const subjectsQuery = useQuery({
    queryKey: [
      "subjects",
      { page: 0, pageSize: 1000, search: "", status: "ACTIVE" },
    ],
    queryFn: () =>
      getSubjects({ page: 0, pageSize: 1000, search: "", status: "ACTIVE" }),
    enabled: openDialog && formValues.role === "TEACHER" && !editingUser,
    staleTime: 5 * 60 * 1000,
  });

  const subjectOptions = useMemo(() => {
    const d = subjectsQuery.data;
    if (!d) return [];
    // trường hợp getSubjects trả {data,total}
    if (Array.isArray(d.data)) return d.data;
    // trường hợp trả thẳng array
    if (Array.isArray(d)) return d;
    return [];
  }, [subjectsQuery.data]);

  // Query list users
  const usersQuery = useQuery({
    queryKey: ["users", { page, pageSize, search, roleFilter }],
    queryFn: () => getUsers({ page, pageSize, search, role: roleFilter }),
    keepPreviousData: true,
  });

  // Mutations (top-level, đúng Rules of Hooks)
  const createUserMutation = useMutation({
    mutationFn: (payload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      handleCloseDialog();
      showToast("Đã tạo user", "success");
    },
    onError: () => showToast("Tạo user thất bại", "error"),
  });

  const createStudentMutation = useMutation({
    mutationFn: (payload) => createStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["students"]);
      handleCloseDialog();
      showToast("Đã tạo học sinh", "success");
    },
    onError: () => showToast("Tạo học sinh thất bại", "error"),
  });

  const createTeacherMutation = useMutation({
    mutationFn: (payload) => createTeacher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["teachers"]);
      handleCloseDialog();
      showToast("Đã tạo giáo viên", "success");
    },
    onError: () => showToast("Tạo giáo viên thất bại", "error"),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      handleCloseDialog();
      showToast("Đã cập nhật user", "success");
    },
    onError: () => showToast("Cập nhật thất bại", "error"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      showToast("Đã cập nhật trạng thái", "success");
    },
    onError: () => showToast("Đổi trạng thái thất bại", "error"),
  });

  // Handlers
  const handleChangePage = (_e, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormValues({ ...emptyForm, role: "STUDENT" });
    setOpenDialog(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormValues((prev) => ({
      ...prev,
      username: user.username || "",
      fullname: user.fullname || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "STUDENT",
    }));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormValues({ ...emptyForm });
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const validateCommonRequired = () => {
    const username = formValues.username?.trim();
    const fullname = toTitleCase(formValues.fullname || "");
    const email = formValues.email?.trim() || "";
    const phoneDigits = normalizeDigits(formValues.phone || "");

    if (!username) return showToast("Vui lòng nhập Username", "warning"), false;
    if (!fullname) return showToast("Vui lòng nhập Họ tên", "warning"), false;

    if (!email) return showToast("Vui lòng nhập Email", "warning"), false;
    if (email && !isAllowedEmail(email))
      return (
        showToast(
          "Email không hợp lệ. Chỉ chấp nhận @gmail.com hoặc domain .edu/.edu.vn/.ac.vn",
          "warning"
        ),
        false
      );

    if (!phoneDigits) return showToast("Vui lòng nhập SĐT", "warning"), false;
    if (!isValidPhoneVN(phoneDigits))
      return (
        showToast(
          "SĐT không hợp lệ. Phải bắt đầu bằng 0 và đủ 10 số.",
          "warning"
        ),
        false
      );

    if (formValues.fullname !== fullname)
      handleFormChange("fullname", fullname);
    if (formValues.phone !== phoneDigits)
      handleFormChange("phone", phoneDigits);

    return true;
  };

  const handleSubmitForm = () => {
    if (editingUser) {
      if (!validateCommonRequired()) return;

      updateUserMutation.mutate({
        id: editingUser.id,
        payload: {
          fullname: toTitleCase(formValues.fullname || ""),
          email: formValues.email.trim(),
          phone: normalizeDigits(formValues.phone || ""),
          role: formValues.role,
        },
      });
      return;
    }

    if (!validateCommonRequired()) return;

    const common = {
      username: formValues.username.trim(),
      fullname: toTitleCase(formValues.fullname || ""),
      email: formValues.email.trim(),
      phone: normalizeDigits(formValues.phone || ""),
    };

    // ADMIN -> createUser
    if (formValues.role === "ADMIN") {
      createUserMutation.mutate({ ...common, role: "ADMIN" });
      return;
    }

    // STUDENT -> createStudent (backend tạo users + students)
    if (formValues.role === "STUDENT") {
      if (!formValues.current_class_id)
        return showToast("Vui lòng chọn Lớp hiện tại", "warning");

      if (!formValues.guardian_name?.trim())
        return showToast("Vui lòng nhập Tên người giám hộ", "warning");

      const guardianPhoneDigits = normalizeDigits(
        formValues.guardian_phone || ""
      );
      if (!guardianPhoneDigits)
        return showToast("Vui lòng nhập SĐT người giám hộ", "warning");
      if (!isValidPhoneVN(guardianPhoneDigits))
        return showToast(
          "SĐT giám hộ không hợp lệ. Phải bắt đầu bằng 0 và đủ 10 số.",
          "warning"
        );

      const guardianCitizen = normalizeDigits(
        formValues.guardian_citizenid || ""
      );
      if (guardianCitizen && !isValidCitizenId(guardianCitizen))
        return showToast(
          "CCCD giám hộ không hợp lệ. CCCD phải đủ 12 số.",
          "warning"
        );

      createStudentMutation.mutate({
        id: formValues.student_id?.trim() || undefined,
        ...common,

        dob: formValues.dob || undefined,
        gender: formValues.gender || undefined,
        address: formValues.address?.trim() || undefined,
        current_class_id: Number(formValues.current_class_id),

        guardian_name: toTitleCase(formValues.guardian_name || ""),
        guardian_phone: guardianPhoneDigits,
        guardian_job: formValues.guardian_job?.trim() || undefined,
        guardian_citizenid: guardianCitizen || undefined,

        status: formValues.status || "ACTIVE",
        note: formValues.note?.trim() || undefined,
      });
      return;
    }

    // TEACHER -> createTeacher (backend tạo users + teachers)
    if (formValues.role === "TEACHER") {
      const dob = formValues.dob || "";
      if (dob && !isAtLeast18(dob))
        return showToast(
          "Giáo viên phải đủ 18 tuổi. Vui lòng nhập lại ngày sinh.",
          "warning"
        );

      const citizenDigits = normalizeDigits(formValues.citizenid || "");
      if (citizenDigits && !isValidCitizenId(citizenDigits))
        return showToast("CCCD không hợp lệ. CCCD phải đủ 12 số.", "warning");

      createTeacherMutation.mutate({
        ...(formValues.teacher_id?.trim()
          ? { id: formValues.teacher_id.trim() }
          : {}),
        ...common,

        dob: formValues.dob || undefined,
        gender: formValues.gender || undefined,
        address: formValues.address?.trim() || undefined,
        citizenid: citizenDigits || undefined,
        mainsubject: formValues.mainsubject || undefined,
        status: formValues.status || "ACTIVE",
        note: formValues.note?.trim() || undefined,
      });
    }
  };

  const handleToggleStatus = (user) => {
    toggleStatusMutation.mutate(user.id);
  };

  const { data, isLoading } = usersQuery;
  const rows = data?.data || [];
  const total = data?.total || 0;

  const isSubmitting =
    createUserMutation.isLoading ||
    createStudentMutation.isLoading ||
    createTeacherMutation.isLoading ||
    updateUserMutation.isLoading;

  const roleColor = (role) => {
    if (role === "ADMIN") return "error";
    if (role === "TEACHER") return "primary";
    return "default";
  };

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Quản lý Users
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            label="Tìm kiếm (tên, username, email)"
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 260 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="TEACHER">TEACHER</MenuItem>
              <MenuItem value="STUDENT">STUDENT</MenuItem>
            </Select>
          </FormControl>

          <Box flexGrow={1} />

          <Button variant="contained" onClick={handleOpenCreate}>
            Thêm user
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
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((u) => (
                  <TableRow
                    key={u.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => openUserDrawer(u)}
                  >
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.fullname}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        color={roleColor(u.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.status === "ACTIVE" ? "ACTIVE" : "LOCKED"}
                        color={u.status === "ACTIVE" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(u);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(u);
                        }}
                      >
                        {u.status === "ACTIVE" ? (
                          <LockIcon fontSize="small" />
                        ) : (
                          <LockOpenIcon fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Không có user nào
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
          {editingUser ? "Chỉnh sửa user" : "Thêm user mới"}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Account */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={800}>
                  Thông tin tài khoản
                </Typography>
                <Divider sx={{ my: 1.5 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Username"
                      value={formValues.username}
                      onChange={(e) =>
                        handleFormChange("username", e.target.value)
                      }
                      fullWidth
                      disabled={!!editingUser}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        label="Role"
                        value={formValues.role}
                        onChange={(e) =>
                          handleFormChange("role", e.target.value)
                        }
                        disabled={!!editingUser}
                      >
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                        <MenuItem value="TEACHER">TEACHER</MenuItem>
                        <MenuItem value="STUDENT">STUDENT</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Họ tên"
                      value={formValues.fullname}
                      onChange={(e) =>
                        handleFormChange("fullname", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleFormChange("email", e.target.value)
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="SĐT (User)"
                      value={formValues.phone}
                      onChange={(e) =>
                        handleFormChange("phone", e.target.value)
                      }
                      fullWidth
                    />
                  </Grid>
                </Grid>

                {!!editingUser && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1 }}
                    color="text.secondary"
                  >
                    Ghi chú: Khi chỉnh sửa user, phần hồ sơ (HS/GV) hãy chỉnh ở
                    trang Students/Teachers.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Role Profile - only CREATE */}
            {!editingUser && formValues.role === "STUDENT" && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Thông tin học sinh
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Mã HS (tùy chọn)"
                        value={formValues.student_id}
                        onChange={(e) =>
                          handleFormChange("student_id", e.target.value)
                        }
                        fullWidth
                        placeholder="VD: HS010 (để trống nếu hệ thống tự tạo)"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Ngày sinh"
                        type="date"
                        value={formValues.dob}
                        onChange={(e) =>
                          handleFormChange("dob", e.target.value)
                        }
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
                          onChange={(e) =>
                            handleFormChange("gender", e.target.value)
                          }
                        >
                          <MenuItem value="">Chưa chọn</MenuItem>
                          <MenuItem value="M">Nam</MenuItem>
                          <MenuItem value="F">Nữ</MenuItem>
                          <MenuItem value="O">Khác</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Địa chỉ"
                        value={formValues.address}
                        onChange={(e) =>
                          handleFormChange("address", e.target.value)
                        }
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
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

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                          label="Trạng thái"
                          value={formValues.status}
                          onChange={(e) =>
                            handleFormChange("status", e.target.value)
                          }
                        >
                          <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                          <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Tên người giám hộ"
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
                        label="SĐT giám hộ"
                        value={formValues.guardian_phone}
                        onChange={(e) =>
                          handleFormChange("guardian_phone", e.target.value)
                        }
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
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
                        label="CCCD giám hộ"
                        value={formValues.guardian_citizenid}
                        onChange={(e) =>
                          handleFormChange("guardian_citizenid", e.target.value)
                        }
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Ghi chú"
                        value={formValues.note}
                        onChange={(e) =>
                          handleFormChange("note", e.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {!editingUser && formValues.role === "TEACHER" && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Thông tin giáo viên
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Mã giáo viên (tùy chọn)"
                        value={formValues.teacher_id}
                        onChange={(e) =>
                          handleFormChange("teacher_id", e.target.value)
                        }
                        fullWidth
                        placeholder="VD: GV010 (để trống nếu hệ thống tự tạo)"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Ngày sinh"
                        type="date"
                        value={formValues.dob}
                        onChange={(e) =>
                          handleFormChange("dob", e.target.value)
                        }
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
                          onChange={(e) =>
                            handleFormChange("gender", e.target.value)
                          }
                        >
                          <MenuItem value="">Chưa chọn</MenuItem>
                          <MenuItem value="M">Nam</MenuItem>
                          <MenuItem value="F">Nữ</MenuItem>
                          <MenuItem value="O">Khác</MenuItem>
                        </Select>
                      </FormControl>
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
                      <TextField
                        label="CCCD"
                        value={formValues.citizenid}
                        onChange={(e) =>
                          handleFormChange("citizenid", e.target.value)
                        }
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Địa chỉ"
                        value={formValues.address}
                        onChange={(e) =>
                          handleFormChange("address", e.target.value)
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
                          onChange={(e) =>
                            handleFormChange("status", e.target.value)
                          }
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
                        onChange={(e) =>
                          handleFormChange("note", e.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmitForm}
            disabled={isSubmitting}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer detail */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={closeUserDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 440 },
            p: 2.25,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          },
        }}
      >
        {!selectedUser ? null : (
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
                  {(selectedUser.fullname || "?")
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
                    {selectedUser.fullname}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 0.25 }}
                  >
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {selectedUser.username}
                    </Typography>

                    <Tooltip title="Copy username">
                      <IconButton
                        size="small"
                        sx={{ p: 0.25 }}
                        onClick={() =>
                          copyToClipboard(selectedUser.username, "username")
                        }
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>

                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>

                    <Chip
                      label={selectedUser.role}
                      color={roleColor(selectedUser.role)}
                      size="small"
                    />
                  </Stack>
                </Box>

                <Chip
                  label={selectedUser.status === "ACTIVE" ? "ACTIVE" : "LOCKED"}
                  color={
                    selectedUser.status === "ACTIVE" ? "success" : "default"
                  }
                  size="small"
                  sx={{ fontWeight: 700 }}
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
                    sx={{ width: 92, flexShrink: 0 }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, minWidth: 0 }}
                    noWrap
                  >
                    {selectedUser.email || "-"}
                  </Typography>
                  {selectedUser.email && (
                    <Tooltip title="Copy email">
                      <IconButton
                        size="small"
                        sx={{ p: 0.25 }}
                        onClick={() =>
                          copyToClipboard(selectedUser.email, "email")
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
                    sx={{ width: 92, flexShrink: 0 }}
                  >
                    SĐT
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, minWidth: 0 }}
                    noWrap
                  >
                    {selectedUser.phone || "-"}
                  </Typography>
                  {selectedUser.phone && (
                    <Tooltip title="Copy SĐT">
                      <IconButton
                        size="small"
                        sx={{ p: 0.25 }}
                        onClick={() =>
                          copyToClipboard(selectedUser.phone, "số điện thoại")
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
                    sx={{ width: 92, flexShrink: 0 }}
                  >
                    User ID
                  </Typography>
                  <Typography variant="body2">{selectedUser.id}</Typography>
                </Stack>
              </Stack>
            </Box>

            <Box flexGrow={1} />
            <Divider />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={closeUserDrawer}>Đóng</Button>

              <Button
                variant="outlined"
                onClick={() => {
                  closeUserDrawer();
                  handleOpenEdit(selectedUser);
                }}
              >
                Chỉnh sửa
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  closeUserDrawer();
                  handleToggleStatus(selectedUser);
                }}
              >
                {selectedUser.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
              </Button>
            </Stack>
          </Stack>
        )}
      </Drawer>
      <Snackbar
        open={toast.open}
        autoHideDuration={2200}
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
