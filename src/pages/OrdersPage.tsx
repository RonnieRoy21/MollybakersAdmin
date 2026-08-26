import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { Order } from "../types";

const formatStatus = (status: string) =>
  status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const statusColor = (
  status: string,
): "default" | "success" | "warning" | "error" | "info" => {
  const normalized = status.toLowerCase();
  if (
    normalized.includes("paid") ||
    normalized.includes("complete") ||
    normalized.includes("delivered")
  ) {
    return "success";
  }
  if (normalized.includes("pending") || normalized.includes("process"))
    return "warning";
  if (normalized.includes("fail") || normalized.includes("cancel"))
    return "error";
  return "default";
};

const formatDescription = (description: unknown) =>
  typeof description === "string"
    ? description
    : JSON.stringify(description) || "—";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await api.orders.list());
    } catch {
      setError("Unable to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4">Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            Review customer orders and their current status.
          </Typography>
        </Box>
        <Tooltip title="Refresh orders">
          <span>
            <IconButton
              onClick={() => void loadOrders()}
              disabled={loading}
              aria-label="Refresh orders"
            >
              <RefreshOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {error && (
        <Alert
          severity="error"
          action={
            <IconButton
              size="small"
              onClick={() => void loadOrders()}
              aria-label="Retry loading orders"
            >
              <RefreshOutlinedIcon fontSize="small" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Processing</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      Loading orders...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No orders yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.orderId} hover>
                    <TableCell>#{order.orderId}</TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      {formatDescription(order.orderDescription)}
                    </TableCell>
                    <TableCell>
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      ${Number(order.orderTotalPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={formatStatus(order.orderPaymentStatus)}
                        color={statusColor(order.orderPaymentStatus)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={formatStatus(order.orderProcessingStatus)}
                        color={statusColor(order.orderProcessingStatus)}
                        variant="outlined"
                      />
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
