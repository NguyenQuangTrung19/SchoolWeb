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
    full_name: "",
    dob: "",
    gender: "",
    address: "",
    current_class_id: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_job: "",
    guardian_citizen_id: "",
    status: "ACTIVE",
    note: "",
  });

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
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStudent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
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
    setEditingStudent(null);
    setFormValues({
      id: "",
      full_name: "",
      dob: "",
      gender: "",
      address: "",
      current_class_id: "",
      guardian_name: "",
      guardian_phone: "",
      guardian_job: "",
      guardian_citizen_id: "",
      status: "ACTIVE",
      note: "",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormValues({
      id: student.id,
      full_name: student.full_name,
      dob: student.dob || "",
      gender: student.gender || "",
      address: student.address || "",
      current_class_id: student.current_class_id || "",
      guardian_name: student.guardian_name || "",
      guardian_phone: student.guardian_phone || "",
      guardian_job: student.guardian_job || "",
      guardian_citizen_id: student.guardian_citizen_id || "",
      status: student.status || "ACTIVE",
      note: student.note || "",
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
    if (!formValues.full_name) {
      alert("Vui lòng nhập họ tên học sinh");
      return;
    }

    if (!formValues.current_class_id) {
      alert("Vui lòng chọn lớp hiện tại");
      return;
    }

    const payload = {
      ...formValues,
    };

    if (editingStudent) {
      // không cho đổi mã HS khi edit
      const { id, ...rest } = payload;
      updateMutation.mutate({ id: editingStudent.id, payload: rest });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteStudent = (student) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa học sinh ${student.full_name} (${student.id})?`
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

      {/* Bộ lọc */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          label="Tìm kiếm (mã HS, tên, người giám hộ, SĐT)"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 260 }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Lọc theo lớp</InputLabel>
          <Select
            label="Lọc theo lớp"
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            {classes.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name} ({c.year_start}-{c.year_end})
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

        <Button variant="contained" onClick={handleOpenCreate}>
          Thêm học sinh
        </Button>
      </Box>

      {/* Bảng học sinh */}
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã HS</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Lớp</TableCell>
                <TableCell>Người giám hộ</TableCell>
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
                  <TableRow key={s.id}>
                    <TableCell>{s.id}</TableCell>
                    <TableCell>{s.full_name}</TableCell>
                    <TableCell>{clazz ? clazz.name : "-"}</TableCell>
                    <TableCell>{s.guardian_name}</TableCell>
                    <TableCell>{s.guardian_phone}</TableCell>
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
                        onClick={() => handleOpenEdit(s)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteStudent(s)}
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
                  value={formValues.full_name}
                  onChange={(e) =>
                    handleFormChange("full_name", e.target.value)
                  }
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
                  value={formValues.guardian_citizen_id}
                  onChange={(e) =>
                    handleFormChange("guardian_citizen_id", e.target.value)
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
    </AppLayout>
  );
}
