// src/pages/admin/assign/AssignTeachingPage.jsx
import { useState } from "react";
import {
  Box,
  Button,
  Typography,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Chip,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import AppLayout from "../../../components/layout/AppLayout";
import { getClasses } from "../../../api/classesApi";
import { getAllTeachers } from "../../../api/teachersApi";
import { getSubjects } from "../../../api/subjectsApi";
import {
  getClassSubjects,
  createClassSubject,
  updateClassSubject,
  deleteClassSubject,
} from "../../../api/classSubjectsApi";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminAssignTeachingPage() {
  const queryClient = useQueryClient();

  // Filter & pagination
  const [classFilter, setClassFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [teacherFilter, setTeacherFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssign, setEditingAssign] = useState(null);
  const [formValues, setFormValues] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    weekly_lessons: "",
    room: "",
    status: "ACTIVE",
  });

  // Load classes (dùng để filter + chọn trong form)
  const classesQuery = useQuery({
    queryKey: [
      "classes",
      { page: 0, pageSize: 100, search: "", gradeFilter: "ALL" },
    ],
    queryFn: () =>
      getClasses({ page: 0, pageSize: 100, search: "", grade: "ALL" }),
  });

  // Load subjects
  const subjectsQuery = useQuery({
    queryKey: [
      "subjects",
      { page: 0, pageSize: 100, search: "", gradeFilter: "ALL" },
    ],
    queryFn: () =>
      getSubjects({ page: 0, pageSize: 100, search: "", grade: "ALL" }),
  });

  // Load teachers
  const teachersQuery = useQuery({
    queryKey: ["teachers", "all"],
    queryFn: () => getAllTeachers(),
    // đảm bảo data luôn là mảng
    select: (res) => {
      // nếu backend trả { data, total } thì lấy res.data
      if (res && Array.isArray(res.data)) return res.data;
      // nếu getAllTeachers đã trả sẵn array thì dùng luôn
      if (Array.isArray(res)) return res;
      return [];
    },
  });

  // Load assignments
  const classSubjectsQuery = useQuery({
    queryKey: [
      "class-subjects",
      { page, pageSize, classFilter, subjectFilter, teacherFilter },
    ],
    queryFn: () =>
      getClassSubjects({
        page,
        pageSize,
        classId: classFilter,
        subjectId: subjectFilter,
        teacherId: teacherFilter,
      }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createClassSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["class-subjects"]);
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateClassSubject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["class-subjects"]);
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteClassSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["class-subjects"]);
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
    setEditingAssign(null);
    setFormValues({
      classId: "",
      subjectId: "",
      teacherId: "",
      weekly_lessons: "",
      room: "",
      status: "ACTIVE",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (assign) => {
    setEditingAssign(assign);
    setFormValues({
      classId: assign.classId,
      subjectId: assign.subjectId,
      teacherId: assign.teacherId,
      weekly_lessons: assign.weekly_lessons || "",
      room: assign.room || "",
      status: assign.status || "ACTIVE",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAssign(null);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = () => {
    if (!formValues.classId || !formValues.subjectId || !formValues.teacherId) {
      alert("Vui lòng chọn Lớp, Môn và Giáo viên");
      return;
    }

    const classes = classesQuery.data?.data || [];
    const subjects = subjectsQuery.data?.data || [];
    const teachers = teachersQuery.data || [];

    const clazz = classes.find(
      (c) => String(c.id) === String(formValues.classId)
    );
    const subject = subjects.find(
      (s) => String(s.id) === String(formValues.subjectId)
    );
    const teacher = teachers.find(
      (t) => String(t.id) === String(formValues.teacherId)
    );

    const payload = {
      classId: clazz ? clazz.id : null,
      class_name: clazz ? clazz.name : "",
      subjectId: subject ? subject.id : null,
      subject_name: subject ? subject.name : "",
      teacherId: teacher ? teacher.id : "",
      teacher_name: teacher ? teacher.fullname : "",
      weekly_lessons: formValues.weekly_lessons
        ? parseInt(formValues.weekly_lessons, 10)
        : null,
      room: formValues.room || "",
      status: formValues.status || "ACTIVE",
    };

    if (editingAssign) {
      updateMutation.mutate({ id: editingAssign.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteAssign = (assign) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa phân công: ${assign.class_name} - ${assign.subject_name} - ${assign.teacher_name}?`
      )
    ) {
      deleteMutation.mutate(assign.id);
    }
  };

  // Data for table
  const { data, isLoading } = classSubjectsQuery;
  const rows = data?.data || [];
  const total = data?.total || 0;

  const classes = classesQuery.data?.data || [];
  const subjects = subjectsQuery.data?.data || [];
  const teachers = teachersQuery.data || [];

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Phân công giảng dạy (Lớp – Môn – Giáo viên)
      </Typography>

      {/* Bộ lọc */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
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

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Lọc theo môn</InputLabel>
          <Select
            label="Lọc theo môn"
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            {subjects.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Lọc theo giáo viên</InputLabel>
          <Select
            label="Lọc theo giáo viên"
            value={teacherFilter}
            onChange={(e) => {
              setTeacherFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            {teachers.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.id} - {t.fullname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box flexGrow={1} />

        <Button variant="contained" onClick={handleOpenCreate}>
          Thêm phân công
        </Button>
      </Box>

      {/* Bảng phân công */}
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Lớp</TableCell>
                <TableCell>Môn</TableCell>
                <TableCell>Giáo viên</TableCell>
                <TableCell>Tiết/tuần</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((cs) => (
                <TableRow key={cs.id}>
                  <TableCell>{cs.id}</TableCell>
                  <TableCell>{cs.class_name}</TableCell>
                  <TableCell>{cs.subject_name}</TableCell>
                  <TableCell>{cs.teacher_name}</TableCell>
                  <TableCell>{cs.weekly_lessons || "-"}</TableCell>
                  <TableCell>{cs.room || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={cs.status}
                      color={cs.status === "ACTIVE" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(cs)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAssign(cs)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có phân công nào
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

      {/* Dialog thêm/sửa phân công */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingAssign ? "Chỉnh sửa phân công" : "Thêm phân công mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box mt={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Lớp</InputLabel>
                  <Select
                    label="Lớp"
                    value={formValues.classId}
                    onChange={(e) =>
                      handleFormChange("classId", e.target.value)
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

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Môn</InputLabel>
                  <Select
                    label="Môn"
                    value={formValues.subjectId}
                    onChange={(e) =>
                      handleFormChange("subjectId", e.target.value)
                    }
                  >
                    {subjects.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name} {s.grade ? `(Khối ${s.grade})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Giáo viên</InputLabel>
                  <Select
                    label="Giáo viên"
                    value={formValues.teacherId}
                    onChange={(e) =>
                      handleFormChange("teacherId", e.target.value)
                    }
                  >
                    {teachers.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.id} - {t.fullname} ({t.mainsubject})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Tiết/tuần"
                  type="number"
                  value={formValues.weekly_lessons}
                  onChange={(e) =>
                    handleFormChange("weekly_lessons", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Phòng học"
                  value={formValues.room}
                  onChange={(e) => handleFormChange("room", e.target.value)}
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
