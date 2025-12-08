// src/pages/admin/users/UsersPage.jsx
import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
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
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
} from "../../../api/usersApi";
import AppLayout from "../../../components/layout/AppLayout";
import EditIcon from "@mui/icons-material/Edit";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  // Bộ lọc & phân trang
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Dialog create/update user
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formValues, setFormValues] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    role: "STUDENT",
  });

  // Query list users
  const usersQuery = useQuery({
    queryKey: ["users", { page, pageSize, search, roleFilter }],
    queryFn: () => getUsers({ page, pageSize, search, role: roleFilter }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      handleCloseDialog();
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
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
    setEditingUser(null);
    setFormValues({
      username: "",
      full_name: "",
      email: "",
      phone: "",
      role: "STUDENT",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormValues({
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = () => {
    if (!formValues.username || !formValues.full_name) {
      alert("Vui lòng nhập username và họ tên");
      return;
    }

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, payload: formValues });
    } else {
      createMutation.mutate(formValues);
    }
  };

  const handleToggleStatus = (user) => {
    toggleStatusMutation.mutate(user.id);
  };

  const { data, isLoading } = usersQuery;
  const rows = data?.data || [];
  const total = data?.total || 0;

  return (
    <AppLayout>
      <Typography variant="h5" gutterBottom>
        Quản lý Users
      </Typography>

      {/* Bộ lọc */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          label="Tìm kiếm (tên, username, email)"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 260 }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="TEACHER">TEACHER</MenuItem>
            <MenuItem value="STUDENT">STUDENT</MenuItem>
          </Select>
        </FormControl>

        <Box flexGrow={1} />

        <Button variant="contained" onClick={handleOpenCreate}>
          Thêm user
        </Button>
      </Box>

      {/* Bảng */}
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role}
                      color={
                        u.role === "ADMIN"
                          ? "error"
                          : u.role === "TEACHER"
                          ? "primary"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.status === "ACTIVE" ? "ACTIVE" : "LOCKED"}
                      color={u.status === "ACTIVE" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(u)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(u)}
                    >
                      {u.status === "ACTIVE" ? (
                        <LockIcon fontSize="small" />
                      ) : (
                        <LockOpenIcon fontSize="small" />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có user nào
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

      {/* Dialog thêm/sửa user */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingUser ? "Chỉnh sửa user" : "Thêm user mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Username"
              value={formValues.username}
              onChange={(e) => handleFormChange("username", e.target.value)}
              fullWidth
            />
            <TextField
              label="Họ tên"
              value={formValues.full_name}
              onChange={(e) => handleFormChange("full_name", e.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              value={formValues.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formValues.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={formValues.role}
                onChange={(e) => handleFormChange("role", e.target.value)}
              >
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="TEACHER">TEACHER</MenuItem>
                <MenuItem value="STUDENT">STUDENT</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmitForm}
            variant="contained"
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
