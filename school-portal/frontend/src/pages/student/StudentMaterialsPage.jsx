// src/pages/student/StudentMaterialsPage.jsx
import AppLayout from "../../components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Typography,
  Link,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@mui/material";
import { getStudentMaterials } from "../../api/studentPortalApi";
import { getClassSubjects } from "../../api/classSubjectsApi";

export default function StudentMaterialsPage() {
  const { user } = useAuth();

  const csQuery = useQuery({
    queryKey: ["student-material-class"],
    queryFn: () =>
      getClassSubjects({
        page: 0,
        pageSize: 100,
        classId: "ALL",
        subjectId: "ALL",
        teacherId: "ALL",
      }),
  });

  const cs = csQuery.data?.data?.[0];

  const materialsQuery = useQuery({
    queryKey: ["student-materials", cs?.id],
    enabled: !!cs,
    queryFn: () => getStudentMaterials(cs.id),
  });

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Tài liệu học tập
      </Typography>

      <Table size="small" sx={{ maxWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell>Tiêu đề</TableCell>
            <TableCell>Link</TableCell>
            <TableCell>Ngày</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {materialsQuery.data?.map((m) => (
            <TableRow>
              <TableCell>{m.title}</TableCell>
              <TableCell>
                <Link href={m.url} target="_blank">
                  Tải xuống
                </Link>
              </TableCell>
              <TableCell>{m.createdAt}</TableCell>
            </TableRow>
          ))}

          {!materialsQuery.data?.length && (
            <TableRow>
              <TableCell colSpan={3} align="center">
                Không có tài liệu
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AppLayout>
  );
}
