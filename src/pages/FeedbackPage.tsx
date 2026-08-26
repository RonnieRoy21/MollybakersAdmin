import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { Feedback } from "../types";

export default function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [replyTarget, setReplyTarget] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = useMemo(
    () =>
      [...items].sort(
        (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
      ),
    [items],
  );

  useEffect(() => {
    void api.feedback
      .list()
      .then(setItems)
      .catch(() => setError("Unable to load feedback. Please try again."));
  }, []);

  const openReply = (item: Feedback) => {
    setReplyTarget(item);
    setReplyText(item.reviewReply ?? "");
  };

  const sendReply = async () => {
    if (!replyTarget) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.feedback.respond(
        String(replyTarget.reviewId),
        replyText.trim(),
      );
      setItems((current) =>
        current.map((item) =>
          item.reviewId === updated.reviewId ? updated : item,
        ),
      );
      setReplyTarget(null);
    } catch {
      setError("Unable to save the response. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4">Client feedback</Typography>
          <Typography variant="body2" color="text.secondary">
            Claims and suggestions from customers.
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {filtered.length === 0 ? (
        <Stack alignItems="center" py={6}>
          <Typography color="text.secondary">Nothing here.</Typography>
        </Stack>
      ) : (
        <Stack spacing={2}>
          {filtered.map((item) => (
            <Card key={item.reviewId} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1}
                >
                  <Typography fontWeight={600}>
                    Review #{item.reviewId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.created_at).toLocaleString()}
                  </Typography>
                </Stack>

                <Typography variant="body1" mt={1}>
                  {item.review_content}
                </Typography>

                {item.reviewReply && (
                  <Box mt={2} pl={2} sx={{ borderLeft: "3px solid #E7DFD8" }}>
                    <Typography variant="body2" color="text.secondary">
                      Your response
                    </Typography>
                    <Typography variant="body2">{item.reviewReply}</Typography>
                  </Box>
                )}

                <Box mt={2}>
                  <Button
                    size="small"
                    startIcon={<ReplyOutlinedIcon />}
                    onClick={() => openReply(item)}
                  >
                    {item.reviewReply ? "Edit response" : "Respond"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={!!replyTarget}
        onClose={() => setReplyTarget(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Respond to review #{replyTarget?.reviewId}</DialogTitle>
        <DialogContent>
          {replyTarget && (
            <Stack spacing={2} mt={1}>
              <Typography variant="body2" color="text.secondary">
                {replyTarget.review_content}
              </Typography>
              <TextField
                label="Your response"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                fullWidth
                multiline
                minRows={4}
                autoFocus
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={sendReply}
            disabled={!replyText.trim() || saving}
          >
            {saving ? "Saving..." : "Send response"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
