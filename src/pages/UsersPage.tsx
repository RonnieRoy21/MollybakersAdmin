import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useToast } from "../components/ToastProvider";
import type { NewUser, User } from "../types";

const emptyForm: NewUser = {
  email: "",
  phone_number: "",
  role: "",
  location: "",
};

export default function UsersPage() {
  const notify = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<NewUser>(emptyForm);

  useEffect(() => {
    api.users
      .list()
      .then(setUsers)
      .catch(() => setError("Unable to load users. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      location: user.location,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    // TODO: call your API here, then update state (or just refetch).
    setDialogOpen(false);
  };

  const handleDelete = async (user: User) => {
    if (deletingEmail) return;
    setDeletingEmail(user.email);
    setError(null);
    try {
      await api.users.remove(user.email);
      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.email !== user.email),
      );
      notify("User deleted successfully.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete user. Please try again.",
      );
    } finally {
      setDeletingEmail(null);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4">Users</Typography>
          <Typography variant="body2" color="text.secondary">
            Everyone with an account.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Add user
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined">
        <TableContainer>
          <Table sx={{ minWidth: 680 }}>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Phone number</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      Loading users...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No users yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.email} hover>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone_number || "—"}</TableCell>
                    <TableCell>{u.role || "—"}</TableCell>
                    <TableCell>{u.location || "—"}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(u)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => void handleDelete(u)}
                        disabled={deletingEmail !== null}
                        aria-label={`Delete ${u.email}`}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editing ? "Edit user" : "Add user"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone number"
              value={form.phone_number}
              onChange={(e) =>
                setForm({ ...form, phone_number: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              fullWidth
            />
            <TextField
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.email}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
