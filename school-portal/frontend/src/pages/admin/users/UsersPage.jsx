// src/pages/admin/users/UsersPage.jsx
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
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
  Paper,
  Divider,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../../../components/layout/AppLayout";
import EditIcon from "@mui/icons-material/Edit";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";

import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
} from "../../../api/usersApi";
import { createStudent } from "../../../api/studentsApi";
import { createTeacher } from "../../../api/teachersApi";
import { getClasses } from "../../../api/classesApi";

const emptyForm = {
  // Common user fields
  username: "",
  fullname: "",
  email: "",
  phone: "",
  role: "STUDENT",

  // STUDENT fields (giống StudentsPage)
  student_id: "", // optional (HSxxx). Nếu backend auto-gen, có thể để trống
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

  // TEACHER fields (giống TeachersPage)
  teacher_id: "", // optional (GVxxx) nếu backend hỗ trợ auto-gen
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

  // Load classes (for STUDENT role)
  const classesQuery = useQuery({
    queryKey: ["classes", { page: 0, pageSize: 200, search: "", grade: "ALL" }],
    queryFn: () =>
      getClasses({ page: 0, pageSize: 200, search: "", grade: "ALL" }),
    enabled: openDialog && formValues.role === "STUDENT",
  });

  const classes = classesQuery.data?.data || [];
  const classMap = useMemo(() => {
    const m = {};
    classes.forEach((c) => (m[c.id] = c));
    return m;
  }, [classes]);

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
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: (payload) => createStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["students"]);
      handleCloseDialog();
    },
  });

  const createTeacherMutation = useMutation({
    mutationFn: (payload) => createTeacher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["teachers"]);
      handleCloseDialog();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      handleCloseDialog();
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
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
    // Edit: chỉ chỉnh fields của user (profile student/teacher sửa ở trang tương ứng)
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
    if (!formValues.username?.trim()) {
      alert("Vui lòng nhập Username");
      return false;
    }
    if (!formValues.fullname?.trim()) {
      alert("Vui lòng nhập Họ tên");
      return false;
    }
    if (!formValues.email?.trim()) {
      alert("Vui lòng nhập Email");
      return false;
    }
    if (!formValues.phone?.trim()) {
      alert("Vui lòng nhập SĐT");
      return false;
    }
    return true;
  };

  const handleSubmitForm = () => {
    // ===== EDIT USER =====
    if (editingUser) {
      if (!validateCommonRequired()) return;

      updateUserMutation.mutate({
        id: editingUser.id,
        payload: {
          fullname: formValues.fullname.trim(),
          email: formValues.email.trim(),
          phone: formValues.phone.trim(),
          role: formValues.role,
        },
      });
      return;
    }

    // ===== CREATE =====
    if (!validateCommonRequired()) return;

    // ADMIN -> createUser
    if (formValues.role === "ADMIN") {
      createUserMutation.mutate({
        username: formValues.username.trim(),
        fullname: formValues.fullname.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        role: "ADMIN",
      });
      return;
    }

    // STUDENT -> createStudent (backend tạo users + students)
    if (formValues.role === "STUDENT") {
      if (!formValues.current_class_id) {
        alert("Vui lòng chọn Lớp hiện tại");
        return;
      }
      if (!formValues.guardian_name?.trim()) {
        alert("Vui lòng nhập Tên người giám hộ");
        return;
      }
      if (!formValues.guardian_phone?.trim()) {
        alert("Vui lòng nhập SĐT người giám hộ");
        return;
      }

      createStudentMutation.mutate({
        // id HS: để trống nếu backend auto-gen
        id: formValues.student_id?.trim() || undefined,
        username: formValues.username.trim(),
        fullname: formValues.fullname.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),

        dob: formValues.dob || undefined,
        gender: formValues.gender || undefined,
        address: formValues.address?.trim() || undefined,
        current_class_id: Number(formValues.current_class_id),

        guardian_name: formValues.guardian_name.trim(),
        guardian_phone: formValues.guardian_phone.trim(),
        guardian_job: formValues.guardian_job?.trim() || undefined,
        guardian_citizenid: formValues.guardian_citizenid?.trim() || undefined,

        status: formValues.status || "ACTIVE",
        note: formValues.note?.trim() || undefined,
      });
      return;
    }

    // TEACHER -> createTeacher (backend tạo users + teachers)
    if (formValues.role === "TEACHER") {
      // Nếu backend chưa auto-gen GV, bạn bắt buộc teacher_id ở đây
      if (!formValues.teacher_id?.trim()) {
        alert(
          "Vui lòng nhập Mã giáo viên (VD: GV001) (hoặc bật auto-gen backend)"
        );
        return;
      }

      createTeacherMutation.mutate({
        id: formValues.teacher_id.trim(),
        username: formValues.username.trim(),
        fullname: formValues.fullname.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),

        dob: formValues.dob || undefined,
        gender: formValues.gender || undefined,
        address: formValues.address?.trim() || undefined,
        citizenid: formValues.citizenid?.trim() || undefined,
        mainsubject: formValues.mainsubject?.trim() || undefined,
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
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
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

      {/* Table */}
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <>
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
                <TableRow key={u.id}>
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
                    <IconButton size="small" onClick={() => handleOpenEdit(u)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(u)}
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
            {/* SECTION: Tài khoản */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
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
                      disabled={!!editingUser} // tránh đổi username khi edit
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
                        // disabled={!!editingUser} // edit chỉ sửa user fields, không đổi role để khỏi lệch profile
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
                    Ghi chú: Khi chỉnh sửa user, phần thông tin hồ sơ (Học
                    sinh/Giáo viên) sẽ chỉnh ở trang Students/Teachers tương
                    ứng.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* SECTION: Profile theo role (chỉ khi CREATE) */}
            {!editingUser && formValues.role === "STUDENT" && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
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
                      {formValues.current_class_id &&
                        classMap[formValues.current_class_id] && (
                          <Typography variant="caption" color="text.secondary">
                            Đã chọn:{" "}
                            {classMap[formValues.current_class_id].name}
                          </Typography>
                        )}
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
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Thông tin giáo viên
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Mã giáo viên"
                        value={formValues.teacher_id}
                        onChange={(e) =>
                          handleFormChange("teacher_id", e.target.value)
                        }
                        fullWidth
                        placeholder="VD: GV001 (bắt buộc nếu backend chưa auto-gen)"
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
                      <TextField
                        label="Môn chính"
                        value={formValues.mainsubject}
                        onChange={(e) =>
                          handleFormChange("mainsubject", e.target.value)
                        }
                        fullWidth
                        placeholder="VD: Toán, Hóa..."
                      />
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
    </AppLayout>
  );
}
