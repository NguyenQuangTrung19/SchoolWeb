// src/pages/student/StudentAttendancePage.jsx

import AppLayout from "../../components/layout/AppLayout";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@mui/material";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudentAttendance } from "../../api/studentPortalApi";
import { useAuth } from "../../context/AuthContext";

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo] = useState("2025-12-31");

  const attQuery = useQuery({
    queryKey: ["student-attendance", from, to],
    queryFn: () => getStudentAttendance(user.username, from, to),
  });

  const rows = attQuery.data || [];

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Lịch sử điểm danh
      </Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          type="date"
          label="Từ ngày"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="Đến ngày"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Table size="small" sx={{ maxWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell>Ngày</TableCell>
            <TableCell>Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.date}</TableCell>
              <TableCell>{r.status}</TableCell>
            </TableRow>
          ))}

          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} align="center">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AppLayout>
  );
}
