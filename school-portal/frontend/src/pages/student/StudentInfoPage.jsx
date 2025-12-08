// src/pages/student/StudentInfoPage.jsx

import AppLayout from "../../components/layout/AppLayout";
import { Box, Typography, Card, CardContent, Grid, Chip } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../../api/studentsApi";

export default function StudentInfoPage() {
  const { user } = useAuth();

  const studentQuery = useQuery({
    queryKey: ["student-info", user.username],
    queryFn: () =>
      getStudents({
        page: 0,
        pageSize: 1,
        search: user.username,
        classId: "ALL",
        status: "ALL",
      }),
  });

  const student = studentQuery.data?.data?.[0];

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Thông tin học sinh
      </Typography>

      {!student ? (
        <Typography>Đang tải...</Typography>
      ) : (
        <Card sx={{ maxWidth: 600, background: "#E3F2FD" }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{student.full_name}</Typography>
                <Chip
                  label={student.status}
                  color={student.status === "ACTIVE" ? "success" : "default"}
                />
              </Grid>
              <Grid item xs={6}>
                Mã HS: {student.id}
              </Grid>
              <Grid item xs={6}>
                Giới tính: {student.gender}
              </Grid>
              <Grid item xs={6}>
                Lớp: {student.current_class_id}
              </Grid>
              <Grid item xs={6}>
                Ngày sinh: {student.dob}
              </Grid>
              <Grid item xs={12}>
                Địa chỉ: {student.address}
              </Grid>
              <Grid item xs={6}>
                Người giám hộ: {student.guardian_name}
              </Grid>
              <Grid item xs={6}>
                SĐT: {student.guardian_phone}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
