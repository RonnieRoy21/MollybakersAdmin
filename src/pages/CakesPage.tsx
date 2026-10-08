import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";
import { api } from "../api/client";
import { useToast } from "../components/ToastProvider";
import type { Cake, CakeOffer, NewCake, NewSpecialOffer } from "../types";

// UI shell only — no data fetching here. Populate `cakes` yourself and
// wire the handlers below to your real create/update/delete/offer calls.

type CakeForm = NewCake & { cake_image: File | null };

const formatCakePrice = (price: number) =>
  Number.isFinite(price) ? Math.trunc(price).toString() : "—";

const emptyForm: CakeForm = {
  cake_name: "",
  cake_description: "",
  cake_flavour: "",
  cake_price: 0,
  cake_size: 0,
  cake_image: null,
};

const emptyOfferForm = (cake: Cake): NewSpecialOffer => ({
  cake_id: String(cake.cake_id),
  cake_name: cake.cake_name,
  offer_price: cake.cake_price,
  original_price: cake.cake_price,
  description: "",
  starts_at: new Date().toISOString().slice(0, 10),
  ends_at: new Date().toISOString().slice(0, 10),
  active: true,
});

export default function CakesPage() {
  const notify = useToast();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [offers, setOffers] = useState<CakeOffer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cake | null>(null);
  const [form, setForm] = useState<CakeForm>(emptyForm);

  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerForm, setOfferForm] = useState<NewSpecialOffer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    void api.cakes.list().then(setCakes);
    void api.offers
      .list()
      .then(setOffers)
      .catch(() => notify("Unable to load active offers.", "error"));
  }, []);

  const activeOfferCakeIds = new Set(
    offers
      .filter((offer) => {
        const expiryTime = new Date(offer.expiry_date).getTime();
        return Number.isFinite(expiryTime) && expiryTime >= Date.now();
      })
      .map((offer) => offer.cake_id),
  );

  const refreshCakes = async () => {
    setCakes(await api.cakes.list());
  };

  const refreshOffers = async () => {
    setOffers(await api.offers.list());
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cake: Cake) => {
    setEditing(cake);
    setForm({
      cake_name: cake.cake_name,
      cake_description: cake.cake_description,
      cake_flavour: cake.cake_flavour,
      cake_price: cake.cake_price,
      cake_size: cake.cake_size,
      cake_image: null,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (editing) {
        const { cake_image, ...cakeChanges } = form;
        const response = await api.cakes.update(
          String(editing.cake_id),
          cakeChanges,
        );
        await refreshCakes();
        notify(response || "Cake updated successfully.");
      } else if (form.cake_image) {
        const { cake_image, ...cake } = form;
        await api.cakes.create(cake, cake_image);
        await refreshCakes();
        notify("Cake added successfully.");
      }
      setDialogOpen(false);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Request failed.",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (cake: Cake) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await api.cakes.remove(String(cake.cake_id));
      await refreshCakes();
      notify(response || "Cake deleted successfully.");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Request failed.",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const openOffer = (cake: Cake) => {
    setOfferForm(emptyOfferForm(cake));
    setOfferDialogOpen(true);
  };

  const handleSaveOffer = async () => {
    if (!offerForm || isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await api.offers.create(offerForm);
      await Promise.all([refreshCakes(), refreshOffers()]);
      notify(response || "Offer created successfully.");
      setOfferDialogOpen(false);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Request failed.",
        "error",
      );
    } finally {
      setIsProcessing(false);
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
          <Typography variant="h4">Cakes</Typography>
          <Typography variant="body2" color="text.secondary">
            What's on the menu.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          disabled={isProcessing}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Add cake
        </Button>
      </Stack>

      <Paper variant="outlined">
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Flavour</TableCell>
                <TableCell>Price (Ksh)</TableCell>
                <TableCell>Size (Kgs)</TableCell>
                <TableCell>Image</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cakes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No cakes on the menu yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                cakes.map((c) => (
                  <TableRow key={c.cake_id} hover>
                    <TableCell>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Typography fontWeight={600}>{c.cake_name}</Typography>
                        {activeOfferCakeIds.has(c.cake_id) && (
                          <Chip
                            size="small"
                            color="secondary"
                            label="Offer active"
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {c.cake_description || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>{c.cake_flavour || "—"}</TableCell>
                    <TableCell>{formatCakePrice(c.cake_price)}</TableCell>
                    <TableCell>{c.cake_size}</TableCell>
                    <TableCell>
                      {c.cake_url ? (
                        <Button
                          component="a"
                          href={c.cake_url}
                          target="_blank"
                          rel="noreferrer"
                          size="small"
                        >
                          View image
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => openOffer(c)}
                        disabled={isProcessing}
                        title="Create special offer"
                      >
                        <LocalOfferOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openEdit(c)}
                        disabled={isProcessing}
                        title="Edit"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(c)}
                        disabled={isProcessing}
                        title="Delete"
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
        <DialogTitle>{editing ? "Edit cake" : "Add cake"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={form.cake_name}
              onChange={(e) => setForm({ ...form, cake_name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={form.cake_description}
              onChange={(e) =>
                setForm({ ...form, cake_description: e.target.value })
              }
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Flavour"
              value={form.cake_flavour}
              onChange={(e) =>
                setForm({ ...form, cake_flavour: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={form.cake_price}
              onChange={(e) =>
                setForm({
                  ...form,
                  cake_price: parseFloat(e.target.value) || 0,
                })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Ksh</InputAdornment>
                ),
              }}
              fullWidth
            />
            <TextField
              label="Size (Kgs)"
              type="number"
              value={form.cake_size}
              onChange={(e) =>
                setForm({ ...form, cake_size: parseFloat(e.target.value) || 0 })
              }
              fullWidth
            />
            <TextField
              label="Cake image"
              type="file"
              inputProps={{ accept: "image/*" }}
              onChange={(e) => {
                const input = e.target as HTMLInputElement;
                setForm({ ...form, cake_image: input.files?.[0] ?? null });
              }}
              helperText={
                form.cake_image?.name ??
                (editing
                  ? "Leave empty to keep the current image."
                  : "Select an image file.")
              }
              fullWidth
              required={!editing}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              isProcessing || !form.cake_name || (!editing && !form.cake_image)
            }
          >
            {isProcessing ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={offerDialogOpen}
        onClose={() => setOfferDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          New special offer{offerForm ? ` — ${offerForm.cake_name}` : ""}
        </DialogTitle>
        <DialogContent>
          {offerForm && (
            <Stack spacing={2} mt={1}>
              <TextField
                label="Offer price"
                type="number"
                value={offerForm.offer_price}
                onChange={(e) =>
                  setOfferForm({
                    ...offerForm,
                    offer_price: parseFloat(e.target.value) || 0,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">Ksh</InputAdornment>
                  ),
                }}
                fullWidth
              />
              <TextField
                label="Original price"
                type="number"
                value={offerForm.original_price ?? 0}
                onChange={(e) =>
                  setOfferForm({
                    ...offerForm,
                    original_price: parseFloat(e.target.value) || 0,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">Ksh</InputAdornment>
                  ),
                }}
                fullWidth
              />
              <TextField
                label="Offer description"
                placeholder="e.g. 20% off for the weekend"
                value={offerForm.description ?? ""}
                onChange={(e) =>
                  setOfferForm({ ...offerForm, description: e.target.value })
                }
                fullWidth
                multiline
                minRows={2}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Starts"
                  type="date"
                  value={offerForm.starts_at}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, starts_at: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Ends"
                  type="date"
                  value={offerForm.ends_at}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, ends_at: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={offerForm.active}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, active: e.target.checked })
                  }
                />
                <Typography variant="body2">Active</Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOfferDialogOpen(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveOffer}
            disabled={isProcessing}
          >
            {isProcessing ? "Creating..." : "Create offer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
