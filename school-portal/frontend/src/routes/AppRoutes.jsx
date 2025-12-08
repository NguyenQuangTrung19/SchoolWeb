import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import AdminDashboardPage from "../pages/admin/DashboardPage";
import AdminUsersPage from "../pages/admin/users/UsersPage";
import AdminClassesPage from "../pages/admin/classes/ClassesPage";
import AdminSubjectsPage from "../pages/admin/subjects/SubjectsPage";
import AdminAssignTeachingPage from "../pages/admin/assign/AssignTeachingPage";
import AdminTeachersPage from "../pages/admin/teachers/TeachersPage";
import AdminStudentsPage from "../pages/admin/students/StudentsPage";

import TeacherDashboardPage from "../pages/teacher/DashboardPage";
import TeacherClassDetailPage from "../pages/teacher/TeacherClassDetailPage";
import TeacherClassesPage from "../pages/teacher/TeacherClassesPage";

import StudentDashboardPage from "../pages/student/DashboardPage";
import StudentInfoPage from "../pages/student/StudentInfoPage";
import StudentScoresPage from "../pages/student/StudentScoresPage";
import StudentAttendancePage from "../pages/student/StudentAttendancePage";
import StudentMaterialsPage from "../pages/student/StudentMaterialsPage";
import ProtectedRoute from "../components/common/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ADMIN */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
            <AdminTeachersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
            <AdminStudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminSubjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assign-teaching"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminAssignTeachingPage />
          </ProtectedRoute>
        }
      />

      {/* TEACHER */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classes"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherClassesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/classes/:id"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherClassDetailPage />
          </ProtectedRoute>
        }
      />

      {/* STUDENT */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/info"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentInfoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/scores"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentScoresPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentAttendancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/materials"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentMaterialsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<div>404 - Not found</div>} />
    </Routes>
  );
}
