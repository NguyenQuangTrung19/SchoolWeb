// src/pages/admin/teachers/TeachersPage.jsx
import { useState } from "react";
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
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../../../components/layout/AppLayout";
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../../../api/teachersApi";

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

  const handleSubmitForm = () => {
    if (!formValues.fullname) {
      alert("Vui lòng nhập họ tên giáo viên");
      return;
    }

    const payload = {
      ...formValues,
      id: formValues.id?.trim() || undefined,
      fullname: formValues.fullname.trim(),
      email: formValues.email.trim() || undefined,
      dob: formValues.dob || undefined,
      gender: formValues.gender || undefined,
      address: formValues.address || undefined,
      phone: formValues.phone || undefined,
      citizenid: formValues.citizenid || undefined,
      mainsubject: formValues.mainsubject || undefined,
      status: formValues.status || undefined,
      note: formValues.note || undefined,
    };
    console.log("Dữ liệu gửi đi:", payload);

    if (editingTeacher) {
      // Không cho đổi mã GV (id) khi edit, trừ khi bạn muốn cho phép
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

        <TextField
          label="Lọc theo môn (mainsubject)"
          size="small"
          value={subjectFilter === "ALL" ? "" : subjectFilter}
          onChange={(e) => {
            const val = e.target.value;
            setSubjectFilter(val ? val : "ALL");
            setPage(0);
          }}
          sx={{ minWidth: 180 }}
          placeholder="VD: Toán, Ngữ văn..."
        />

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
                <TableRow key={t.id}>
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
                          onClick={() => handleOpenEdit(t)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTeacher(t)}
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
                <TextField
                  label="Môn chính (mainsubject)"
                  value={formValues.mainsubject}
                  onChange={(e) =>
                    handleFormChange("mainsubject", e.target.value)
                  }
                  fullWidth
                  placeholder="VD: Toán, Ngữ văn, Tiếng Anh..."
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
    </AppLayout>
  );
}
