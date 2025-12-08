// src/pages/admin/subjects/SubjectsPage.jsx
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../../../components/layout/AppLayout";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../api/subjectsApi";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminSubjectsPage() {
  const queryClient = useQueryClient();

  // Filter & pagination
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    code: "",
    grade: "",
    is_optional: false,
    status: "ACTIVE",
  });

  // Query list subjects
  const subjectsQuery = useQuery({
    queryKey: ["subjects", { page, pageSize, search, gradeFilter }],
    queryFn: () =>
      getSubjects({
        page,
        pageSize,
        search,
        grade: gradeFilter,
      }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["subjects"]);
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateSubject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["subjects"]);
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["subjects"]);
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
    setEditingSubject(null);
    setFormValues({
      name: "",
      code: "",
      grade: "",
      is_optional: false,
      status: "ACTIVE",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (subject) => {
    setEditingSubject(subject);
    setFormValues({
      name: subject.name,
      code: subject.code,
      grade: subject.grade || "",
      is_optional: subject.is_optional,
      status: subject.status || "ACTIVE",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubject(null);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = () => {
    if (!formValues.name) {
      alert("Vui lòng nhập tên môn học");
      return;
    }

    const payload = {
      ...formValues,
      grade: formValues.grade ? parseInt(formValues.grade, 10) : null,
    };

    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteSubject = (subject) => {
    if (window.confirm(`Bạn có chắc muốn xóa môn ${subject.name}?`)) {
      deleteMutation.mutate(subject.id);
    }
  };

  const { data, isLoading } = subjectsQuery;
  const rows = data?.data || [];
  const total = data?.total || 0;

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Quản lý môn học
      </Typography>

      {/* Bộ lọc */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          label="Tìm kiếm (tên, mã môn)"
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
          Thêm môn học
        </Button>
      </Box>

      {/* Bảng môn học */}
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên môn</TableCell>
                <TableCell>Mã môn</TableCell>
                <TableCell>Khối</TableCell>
                <TableCell>Tự chọn</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.code}</TableCell>
                  <TableCell>{s.grade || "-"}</TableCell>
                  <TableCell>
                    {s.is_optional ? (
                      <Chip label="Tự chọn" size="small" />
                    ) : (
                      <Chip label="Bắt buộc" size="small" color="primary" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.status}
                      color={s.status === "ACTIVE" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(s)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteSubject(s)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Không có môn học nào
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

      {/* Dialog thêm/sửa môn học */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingSubject ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box mt={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tên môn học"
                  value={formValues.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mã môn (code)"
                  value={formValues.code}
                  onChange={(e) => handleFormChange("code", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Khối (ví dụ: 10, 11, 12)"
                  type="number"
                  value={formValues.grade}
                  onChange={(e) => handleFormChange("grade", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formValues.is_optional}
                      onChange={(e) =>
                        handleFormChange("is_optional", e.target.checked)
                      }
                    />
                  }
                  label="Môn tự chọn"
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
