// src/pages/admin/DashboardPage.jsx
import { useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import { getStudents } from "../../api/studentsApi";
import { getTeachers } from "../../api/teachersApi";
import { getClasses } from "../../api/classesApi";
import { getSubjects } from "../../api/subjectsApi";
import { getClassSubjects } from "../../api/classSubjectsApi";

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  // ===== FETCH DATA =====
  const studentsQuery = useQuery({
    queryKey: ["dashboard-students"],
    queryFn: () =>
      getStudents({
        page: 0,
        pageSize: 1000,
        search: "",
        classId: "ALL",
        status: "ALL",
      }),
  });

  const teachersQuery = useQuery({
    queryKey: ["dashboard-teachers"],
    queryFn: () =>
      getTeachers({
        page: 0,
        pageSize: 1000,
        search: "",
        subject: "ALL",
        status: "ALL",
      }),
  });

  const classesQuery = useQuery({
    queryKey: ["dashboard-classes"],
    queryFn: () =>
      getClasses({
        page: 0,
        pageSize: 1000,
        search: "",
        grade: "ALL",
        status: "ALL",
      }),
  });

  const subjectsQuery = useQuery({
    queryKey: ["dashboard-subjects"],
    queryFn: () =>
      getSubjects({
        page: 0,
        pageSize: 1000,
        search: "",
        grade: "ALL",
      }),
  });

  const classSubjectsQuery = useQuery({
    queryKey: ["dashboard-class-subjects"],
    queryFn: () =>
      getClassSubjects({
        page: 0,
        pageSize: 1000,
        classId: "ALL",
        subjectId: "ALL",
        teacherId: "ALL",
      }),
  });

  const loading =
    studentsQuery.isLoading ||
    teachersQuery.isLoading ||
    classesQuery.isLoading ||
    subjectsQuery.isLoading ||
    classSubjectsQuery.isLoading;

  const students = studentsQuery.data?.data || [];
  const totalStudents = studentsQuery.data?.total || 0;

  const teachers = teachersQuery.data?.data || [];
  const totalTeachers = teachersQuery.data?.total || 0;

  const classes = classesQuery.data?.data || [];
  const totalClasses = classesQuery.data?.total || 0;

  const totalSubjects = subjectsQuery.data?.total || 0;

  const classSubjects = classSubjectsQuery.data?.data || [];

  // ====== DERIVED STATS ======

  // Học sinh theo khối (dựa trên grade của lớp + total_students)
  const gradeStats = useMemo(() => {
    const map = {};
    classes.forEach((c) => {
      const grade = c.grade || "Khác";
      const count = c.total_students || 0;
      map[grade] = (map[grade] || 0) + count;
    });
    return map; // { '10': 120, '11': 130, ... }
  }, [classes]);

  // Tỉ lệ Nam / Nữ
  const genderStats = useMemo(() => {
    let male = 0;
    let female = 0;
    let other = 0;
    students.forEach((s) => {
      if (s.gender === "M") male++;
      else if (s.gender === "F") female++;
      else other++;
    });
    const total = male + female + other || 1;
    return {
      male,
      female,
      other,
      malePct: Math.round((male / total) * 100),
      femalePct: Math.round((female / total) * 100),
      otherPct: Math.round((other / total) * 100),
    };
  }, [students]);

  // Top lớp đông nhất
  const topClasses = useMemo(() => {
    const sorted = [...classes].sort(
      (a, b) => (b.total_students || 0) - (a.total_students || 0)
    );
    return sorted.slice(0, 5);
  }, [classes]);

  // Map teacher id -> info
  const teacherMap = useMemo(() => {
    const map = {};
    teachers.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teachers]);

  // Top giáo viên dạy nhiều lớp nhất (dựa trên classSubjects)
  const topTeachers = useMemo(() => {
    const countMap = {};
    classSubjects.forEach((cs) => {
      if (!cs.teacher_id) return;
      countMap[cs.teacher_id] = (countMap[cs.teacher_id] || 0) + 1;
    });

    const entries = Object.entries(countMap).map(([teacherId, count]) => ({
      teacherId,
      count,
      teacherName: teacherMap[teacherId]?.full_name || teacherId,
    }));

    entries.sort((a, b) => b.count - a.count);
    return entries.slice(0, 5);
  }, [classSubjects, teacherMap]);

  return (
    <AppLayout>
      <Box mb={2}>
        <Typography variant="h5" gutterBottom>
          Tổng quan hệ thống
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nhìn nhanh tình hình toàn trường: sĩ số, giáo viên, lớp học, phân công
          giảng dạy...
        </Typography>
      </Box>

      {loading && (
        <Box mb={3}>
          <LinearProgress />
        </Box>
      )}

      {/* ===== HÀNG 1: KPI CARDS ===== */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="Học sinh"
            value={totalStudents}
            subtitle={`${genderStats.male} nam, ${genderStats.female} nữ`}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="Giáo viên"
            value={totalTeachers}
            subtitle="Đang active"
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="Lớp học"
            value={totalClasses}
            subtitle="Đang hoạt động"
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            label="Môn học"
            value={totalSubjects}
            subtitle="Chính khóa & tự chọn"
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* ===== HÀNG 2: HỌC SINH THEO KHỐI + GIỚI TÍNH ===== */}
      <Grid container spacing={2} mb={2}>
        {/* Học sinh theo khối */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
              Sĩ số học sinh theo khối
            </Typography>
            {Object.keys(gradeStats).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Chưa có dữ liệu lớp.
              </Typography>
            ) : (
              <Stack spacing={1.5} mt={1}>
                {Object.entries(gradeStats).map(([grade, count]) => {
                  const max = Math.max(...Object.values(gradeStats));
                  const percent = max ? (count / max) * 100 : 0;
                  return (
                    <Box key={grade}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mb={0.3}
                      >
                        <Typography variant="body2">Khối {grade}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {count} HS
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          backgroundColor: "rgba(25,118,210,0.1)",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${percent}%`,
                            height: "100%",
                            borderRadius: 999,
                            background:
                              "linear-gradient(90deg,#42a5f5,#1e88e5)",
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Tỉ lệ giới tính */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
              Tỉ lệ giới tính học sinh
            </Typography>
            <Stack direction="row" spacing={2} mt={1}>
              <GenderBubble
                label="Nam"
                count={genderStats.male}
                pct={genderStats.malePct}
                color="#42a5f5"
              />
              <GenderBubble
                label="Nữ"
                count={genderStats.female}
                pct={genderStats.femalePct}
                color="#ec407a"
              />
              <GenderBubble
                label="Khác"
                count={genderStats.other}
                pct={genderStats.otherPct}
                color="#ab47bc"
              />
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={1.5}
            >
              Dựa trên tổng số học sinh hiện tại.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ===== HÀNG 3: TOP LỚP & TOP GIÁO VIÊN ===== */}
      <Grid container spacing={2} mb={2}>
        {/* Top lớp đông nhất */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
              Top lớp đông học sinh
            </Typography>
            {topClasses.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Chưa có dữ liệu lớp.
              </Typography>
            ) : (
              <List dense>
                {topClasses.map((c) => (
                  <ListItem key={c.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`${c.name} (${c.grade})`}
                      secondary={`Sĩ số: ${c.total_students || 0} | GVCN: ${
                        c.homeroom_teacher_name || c.homeroom_teacher_id || "-"
                      }`}
                    />
                    <Chip
                      label={`${c.total_students || 0} HS`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Top giáo viên dạy nhiều lớp */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
              Giáo viên dạy nhiều lớp nhất
            </Typography>
            {topTeachers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Chưa có dữ liệu phân công giảng dạy.
              </Typography>
            ) : (
              <List dense>
                {topTeachers.map((t) => (
                  <ListItem key={t.teacherId} sx={{ px: 0 }}>
                    <ListItemText
                      primary={t.teacherName}
                      secondary={`Mã GV: ${t.teacherId}`}
                    />
                    <Chip
                      label={`${t.count} lớp`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ===== HÀNG 4: SYSTEM STATUS + QUICK ACTIONS ===== */}
      <Grid container spacing={2}>
        {/* System status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
              Tình trạng hệ thống
            </Typography>
            <List dense>
              <StatusItem label="Database" status="OK" color="success" />
              <StatusItem label="API Server" status="Running" color="success" />
              <StatusItem
                label="Điểm danh"
                status="Đồng bộ theo ngày"
                color="info"
              />
              <StatusItem
                label="Cảnh báo"
                status="Không có vấn đề"
                color="primary"
              />
            </List>
          </Paper>
        </Grid>

        {/* Quick actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
              Thao tác nhanh
            </Typography>
            <Stack spacing={1.5} mt={1}>
              <Button
                variant="contained"
                onClick={() => navigate("/admin/students")}
              >
                Quản lý học sinh
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/admin/teachers")}
              >
                Quản lý giáo viên
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/admin/classes")}
              >
                Quản lý lớp học
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/admin/assign-teaching")}
              >
                Phân công giảng dạy
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </AppLayout>
  );
}

/* ===== COMPONENT PHỤ ===== */

function KpiCard({ label, value, subtitle, color }) {
  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: "bold", color, mt: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </Paper>
  );
}

function GenderBubble({ label, count, pct, color }) {
  return (
    <Box textAlign="center">
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          mx: "auto",
          backgroundColor: "rgba(0,0,0,0.04)",
          border: `3px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 0.5,
        }}
      >
        <Typography variant="subtitle1" sx={{ color }}>
          {pct}%
        </Typography>
      </Box>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="caption" color="text.secondary">
        {count} HS
      </Typography>
    </Box>
  );
}

function StatusItem({ label, status, color }) {
  return (
    <>
      <ListItem sx={{ px: 0 }}>
        <ListItemText
          primary={label}
          secondary={status}
          secondaryTypographyProps={{ variant: "caption" }}
        />
        <Chip size="small" color={color} />
      </ListItem>
      <Divider />
    </>
  );
}
