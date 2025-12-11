// src/pages/teacher/TeacherClassesPage.jsx
import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { getClassSubjects } from "../../api/classSubjectsApi";
import { getStudents } from "../../api/studentsApi";

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // MOCK: username "gv001" -> teacher_id "GV001"
  const teacherId = user?.username?.toUpperCase();

  const [selectedClass, setSelectedClass] = useState(null);

  const myClassesQuery = useQuery({
    queryKey: ["my-classes", teacherId],
    enabled: !!teacherId,
    queryFn: () =>
      getClassSubjects({
        page: 0,
        pageSize: 100,
        classId: "ALL",
        subjectId: "ALL",
        teacherId,
      }),
  });

  const studentsQuery = useQuery({
    queryKey: ["students-of-selected", selectedClass?.classId],
    enabled: !!selectedClass,
    queryFn: () =>
      getStudents({
        page: 0,
        pageSize: 200,
        search: "",
        classId: selectedClass.classId,
        status: "ALL",
      }),
  });

  const { data, isLoading } = myClassesQuery;
  const rows = data?.data || [];

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Lớp tôi dạy
      </Typography>

      {isLoading ? (
        <div>Đang tải...</div>
      ) : rows.length === 0 ? (
        <Typography>Hiện tại bạn chưa được phân công dạy lớp nào.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Lớp</TableCell>
              <TableCell>Môn</TableCell>
              <TableCell>Tiết/tuần</TableCell>
              <TableCell>Phòng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((cs) => (
              <TableRow key={cs.id}>
                <TableCell>{cs.class_name}</TableCell>
                <TableCell>{cs.subject_name}</TableCell>
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
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedClass(cs);
                      studentsQuery.refetch();
                    }}
                  >
                    Xem nhanh HS
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                    onClick={() => navigate(`/teacher/classes/${cs.id}`)}
                  >
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedClass && !studentsQuery.isLoading && (
        <Box mt={3}>
          <Typography variant="h6">
            Học sinh lớp {selectedClass.class_name} (
            {selectedClass.subject_name})
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã HS</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Người giám hộ</TableCell>
                <TableCell>SĐT giám hộ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentsQuery.data?.data?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.fullname}</TableCell>
                  <TableCell>{s.guardian_name}</TableCell>
                  <TableCell>{s.guardian_phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </AppLayout>
  );
}
