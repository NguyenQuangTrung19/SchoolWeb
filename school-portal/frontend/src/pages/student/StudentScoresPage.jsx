// src/pages/student/StudentScoresPage.jsx

import AppLayout from "../../components/layout/AppLayout";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { getStudentScores } from "../../api/studentPortalApi";
import { getClassSubjects } from "../../api/classSubjectsApi";

export default function StudentScoresPage() {
  const { user } = useAuth();

  const classSubjectQuery = useQuery({
    queryKey: ["my-class-subject", user.username],
    queryFn: () =>
      getClassSubjects({
        page: 0,
        pageSize: 100,
        classId: "ALL",
        subjectId: "ALL",
        teacherId: "ALL",
      }),
  });

  const cs = classSubjectQuery.data?.data?.[0];

  const scoresQuery = useQuery({
    queryKey: ["student-scores", user.username],
    enabled: !!cs,
    queryFn: () => getStudentScores(user.username, cs?.id),
  });

  const scores = scoresQuery.data || {};

  const avg =
    ((scores.oral?.[0] || 0) +
      (scores.quiz?.[0] || 0) +
      (scores.mid?.[0] || 0) * 2 +
      (scores.final?.[0] || 0) * 3) /
    7;

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Điểm học tập
      </Typography>

      <Paper sx={{ maxWidth: 600, p: 2 }}>
        <Typography variant="h6">Môn: {cs?.subject_name}</Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Loại</TableCell>
              <TableCell>Điểm</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {["oral", "quiz", "mid", "final"].map((t) => (
              <TableRow key={t}>
                <TableCell>{t}</TableCell>
                <TableCell>{scores[t]?.[0] ?? "-"}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ background: "#E8F5E9" }}>
              <TableCell>
                <b>Trung bình</b>
              </TableCell>
              <TableCell>
                <b>{avg.toFixed(2)}</b>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </AppLayout>
  );
}
