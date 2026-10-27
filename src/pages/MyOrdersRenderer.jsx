
import React, { useEffect, useState } from "react";

import {
    Alert,
    Box,
    CircularProgress,
    Paper,
    Typography,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getAuthToken } from "../utils/auth";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

export default function MyOrdersRenderer({ widget }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const token = getAuthToken();



    useEffect(() => {
        let cancelled = false;

        async function loadOrders() {
            try {
                setLoading(true);
                setError("");

               // const token = localStorage.getItem("access_token");

                if (!token) {
                    throw new Error(
                        "Please log in to view your orders."
                    );
                }

                const response = await fetch(
                    `${API_URL}/api/my-orders`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.status === 401) {
                    throw new Error(
                        "Your session has expired. Please log in again."
                    );
                }

                if (!response.ok) {
                    throw new Error(
                        `Failed to load orders (${response.status}).`
                    );
                }

                const data = await response.json();

                if (!cancelled) {
                    setOrders(
                        Array.isArray(data) ? data : []
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load orders.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadOrders();

        return () => {
            cancelled = true;
        };
    }, []);

    const formatDate = (value) => {
        if (!value) return "—";

        // Avoid shifting a date-only value because of time zones.
        const dateText = String(value).slice(0, 10);
        const parts = dateText.split("-");

        if (parts.length !== 3) return dateText;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const formatMoney = (value) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(Number(value) || 0);

    const statusColor = (status) => {
        const normalized =
            String(status || "").toLowerCase();

        if (normalized === "delivered") return "success";
        if (normalized === "cancelled") return "error";
        if (normalized === "shipped") return "info";
        if (normalized === "processing") return "warning";

        return "default";
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    p: 4
                }}
            >
                <CircularProgress size={24} />
                <Typography>Loading your orders...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%" }}>
            <Typography
                variant="h5"
                sx={{ mb: 2, fontWeight: 600 }}
            >
                {widget?.title || "My Orders"}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!error && orders.length === 0 && (
                <Alert severity="info">
                    You haven't placed any orders yet.
                </Alert>
            )}

            {!error && orders.map((order) => (
                <Paper
                    key={order.id}
                    variant="outlined"
                    sx={{ mb: 2, overflow: "hidden" }}
                >
                    <Box
                        sx={{
                            p: 2,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2,
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Order #{order.id}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Placed on {formatDate(order.order_date)}
                            </Typography>
                        </Box>

                        <Chip
                            label={order.status || "Pending"}
                            color={statusColor(order.status)}
                            size="small"
                        />

                        <Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Order total
                            </Typography>

                            <Typography fontWeight={600}>
                                {formatMoney(order.total)}
                            </Typography>
                        </Box>
                    </Box>

                    <Accordion
                        disableGutters
                        elevation={0}
                        sx={{
                            "&:before": { display: "none" },
                            borderTop: "1px solid",
                            borderColor: "divider"
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                        >
                            <Typography variant="body2">
                                View order items ({order.items?.length || 0})
                            </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell>SKU</TableCell>
                                        <TableCell align="right">
                                            Quantity
                                        </TableCell>
                                        <TableCell align="right">
                                            Amount
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {(order.items || []).map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {item.product_name || "Product"}
                                            </TableCell>

                                            <TableCell>
                                                {item.sku || "—"}
                                            </TableCell>

                                            <TableCell align="right">
                                                {item.quantity}
                                            </TableCell>

                                            <TableCell align="right">
                                                {formatMoney(item.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </AccordionDetails>
                    </Accordion>
                </Paper>
            ))}
        </Box>
    );
}
