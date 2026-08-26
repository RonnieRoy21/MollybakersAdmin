import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { CakeOffer } from "../types";

const formatPrice = (price: number) =>
  Number.isFinite(price) ? `Ksh ${price.toFixed(2)}` : "—";

export default function OffersPage() {
  const [offers, setOffers] = useState<CakeOffer[]>([]);

  useEffect(() => {
    void api.offers.list().then(setOffers);
  }, []);

  return (
    <Box>
      <Stack mb={3}>
        <Typography variant="h4">Special offers</Typography>
        <Typography variant="body2" color="text.secondary">
          Offers currently stored in the database.
        </Typography>
      </Stack>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cake</TableCell>
                <TableCell>Offer price</TableCell>
                <TableCell>Expiry date</TableCell>
                <TableCell>Add-ons</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No special offers yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                offers.map((offer) => (
                  <TableRow key={`${offer.cake_id}-${offer.expiry_date}`} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {offer.cake_name || `Cake #${offer.cake_id}`}
                      </Typography>
                      {offer.cake_url && (
                        <Button
                          component="a"
                          href={offer.cake_url}
                          target="_blank"
                          rel="noreferrer"
                          size="small"
                        >
                          View image
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{formatPrice(offer.cake_price)}</TableCell>
                    <TableCell>
                      {new Date(offer.expiry_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{offer.add_ons || "—"}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" title="Delete offer">
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
    </Box>
  );
}
