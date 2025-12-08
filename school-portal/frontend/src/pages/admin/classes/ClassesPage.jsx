// src/pages/admin/classes/ClassesPage.jsx
import { useState } from "react";
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
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} from "../../../api/classesApi";
import { getAllTeachers } from "../../../api/teachersApi";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminClassesPage() {
  const queryClient = useQueryClient();

  // Filter & pagination
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    grade: "",
    year_start: "",
    year_end: "",
    homeroom_teacher_id: "",
    capacity: "",
    total_students: "",
    boys_count: "",
    girls_count: "",
    status: "ACTIVE",
  });

  // Fetch teachers for dropdown GVCN
  const teachersQuery = useQuery({
    queryKey: ["teachers", "all"],
    queryFn: () => getAllTeachers(),
  });

  // Fetch classes
  const classesQuery = useQuery({
    queryKey: ["classes", { page, pageSize, search, gradeFilter }],
    queryFn: () =>
      getClasses({
        page,
        pageSize,
        search,
        grade: gradeFilter,
      }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["classes"]);
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateClass(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["classes"]);
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["classes"]);
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
    setEditingClass(null);
    setFormValues({
      name: "",
      grade: "",
      year_start: "",
      year_end: "",
      homeroom_teacher_id: "",
      capacity: "",
      total_students: "",
      boys_count: "",
      girls_count: "",
      status: "ACTIVE",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (clazz) => {
    setEditingClass(clazz);
    setFormValues({
      name: clazz.name,
      grade: clazz.grade,
      year_start: clazz.year_start,
      year_end: clazz.year_end,
      homeroom_teacher_id: clazz.homeroom_teacher_id || "",
      capacity: clazz.capacity || "",
      total_students: clazz.total_students || "",
      boys_count: clazz.boys_count || "",
      girls_count: clazz.girls_count || "",
      status: clazz.status || "ACTIVE",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClass(null);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = () => {
    if (
      !formValues.name ||
      !formValues.grade ||
      !formValues.year_start ||
      !formValues.year_end
    ) {
      alert("Vui lòng nhập đầy đủ Tên lớp, Khối, Năm bắt đầu, Năm kết thúc");
      return;
    }

    // tìm tên GVCN để lưu kèm
    const teacher = teachersQuery.data?.find(
      (t) => t.id === formValues.homeroom_teacher_id
    );

    const payload = {
      ...formValues,
      grade: parseInt(formValues.grade, 10),
      year_start: parseInt(formValues.year_start, 10),
      year_end: parseInt(formValues.year_end, 10),
      capacity: formValues.capacity ? parseInt(formValues.capacity, 10) : null,
      total_students: formValues.total_students
        ? parseInt(formValues.total_students, 10)
        : 0,
      boys_count: formValues.boys_count
        ? parseInt(formValues.boys_count, 10)
        : 0,
      girls_count: formValues.girls_count
        ? parseInt(formValues.girls_count, 10)
        : 0,
      homeroom_teacher_name: teacher ? teacher.full_name : "",
    };

    if (editingClass) {
      updateMutation.mutate({ id: editingClass.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteClass = (clazz) => {
    if (window.confirm(`Bạn có chắc muốn xóa lớp ${clazz.name}?`)) {
      deleteMutation.mutate(clazz.id);
    }
  };

  const { data, isLoading } = classesQuery;
  const rows = data?.data || [];
  const total = data?.total || 0;

  const teachers = teachersQuery.data || [];

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Quản lý lớp học
      </Typography>

      {/* Bộ lọc */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          label="Tìm kiếm (tên lớp, năm)"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 260 }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Khối</InputLabel>
          <Select
            label="Khối"
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            <MenuItem value="10">10</MenuItem>
            <MenuItem value="11">11</MenuItem>
            <MenuItem value="12">12</MenuItem>
          </Select>
        </FormControl>

        <Box flexGrow={1} />

        <Button variant="contained" onClick={handleOpenCreate}>
          Thêm lớp
        </Button>
      </Box>

      {/* Bảng lớp học */}
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên lớp</TableCell>
                <TableCell>Khối</TableCell>
                <TableCell>Năm học</TableCell>
                <TableCell>GVCN</TableCell>
                <TableCell>Sĩ số</TableCell>
                <TableCell>Nam/Nữ</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.grade}</TableCell>
                  <TableCell>
                    {c.year_start} - {c.year_end}
                  </TableCell>
                  <TableCell>{c.homeroom_teacher_name || "-"}</TableCell>
                  <TableCell>
                    {c.total_students}/{c.capacity || "-"}
                  </TableCell>
                  <TableCell>
                    {c.boys_count}/{c.girls_count}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.status}
                      color={c.status === "ACTIVE" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(c)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClass(c)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Không có lớp nào
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

      {/* Dialog thêm/sửa lớp */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingClass ? "Chỉnh sửa lớp" : "Thêm lớp mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box mt={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Tên lớp (ví dụ: 10A1)"
                  value={formValues.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Khối"
                  type="number"
                  value={formValues.grade}
                  onChange={(e) => handleFormChange("grade", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Năm bắt đầu"
                  type="number"
                  value={formValues.year_start}
                  onChange={(e) =>
                    handleFormChange("year_start", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Năm kết thúc"
                  type="number"
                  value={formValues.year_end}
                  onChange={(e) => handleFormChange("year_end", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Giáo viên chủ nhiệm</InputLabel>
                  <Select
                    label="Giáo viên chủ nhiệm"
                    value={formValues.homeroom_teacher_id}
                    onChange={(e) =>
                      handleFormChange("homeroom_teacher_id", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>Chưa gán</em>
                    </MenuItem>
                    {teachers.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.id} - {t.full_name} ({t.main_subject})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Sĩ số tối đa"
                  type="number"
                  value={formValues.capacity}
                  onChange={(e) => handleFormChange("capacity", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Sĩ số hiện tại"
                  type="number"
                  value={formValues.total_students}
                  onChange={(e) =>
                    handleFormChange("total_students", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Số nam"
                  type="number"
                  value={formValues.boys_count}
                  onChange={(e) =>
                    handleFormChange("boys_count", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Số nữ"
                  type="number"
                  value={formValues.girls_count}
                  onChange={(e) =>
                    handleFormChange("girls_count", e.target.value)
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
                    <MenuItem value="ARCHIVED">ARCHIVED</MenuItem>
                  </Select>
                </FormControl>
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
