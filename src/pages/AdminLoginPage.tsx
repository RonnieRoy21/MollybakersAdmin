import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";
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
import { signInAdmin, signInWithGoogleAdmin } from "../auth";

interface AdminLoginPageProps {
  initialError?: string | null;
}

export default function AdminLoginPage({
  initialError = null,
}: AdminLoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithGoogleAdmin();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Unable to sign in.",
      );
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signInAdmin(email.trim(), password);
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
        sx={{ width: "100%", maxWidth: 420, p: 4 }}
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
          <Button
            type="button"
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={() => void handleGoogleSignIn()}
            disabled={isSubmitting}
          >
            Continue with Google
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
