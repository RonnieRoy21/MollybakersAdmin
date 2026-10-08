import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { signInAdmin } from "../auth";
import { useToast } from "../components/ToastProvider";

interface AdminLoginPageProps {
  initialError?: string | null;
  onSignedIn: (session: Session) => void;
}

export default function AdminLoginPage({
  initialError = null,
  onSignedIn,
}: AdminLoginPageProps) {
  const navigate = useNavigate();
  const notify = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const session = await signInAdmin(email.trim(), password);
      onSignedIn(session);
      notify("Signed in successfully.");
      navigate("/users", { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Unable to sign in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: "100%", maxWidth: 420, p: { xs: 2.5, sm: 4 } }}
      >
        <Stack spacing={3}>
          <Stack spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h4" component="h1">
              Admin sign in
            </Typography>
            <Typography color="text.secondary" align="center">
              Use an administrator account to continue.
            </Typography>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
            autoComplete="email"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
