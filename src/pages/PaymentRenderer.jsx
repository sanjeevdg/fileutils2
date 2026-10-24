
import React, { useEffect, useState } from "react";

import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    TextField,
    MenuItem,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { getAuthHeaders } from "../utils/auth";


export default function PaymentRenderer({
    widget,
    context = {}
}) {
    const props = widget?.props || {};

    const mode = props.mode || "inventory";
    const entity = props.entity || "inventory";
    const productField = props.productField || "name";
    const priceField = props.priceField || "price";
    const currency = props.currency || "INR";

    const apiUrl =
        import.meta.env.VITE_API_URL ||
        "http://127.0.0.1:8000";

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [selectedId, setSelectedId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [customAmount, setCustomAmount] = useState(
        String(props.amount ?? 500)
    );
    const [open, setOpen] = useState(false);


    const [searchParams] = useSearchParams();

    const productId = searchParams.get("productId");
    const cartParam = searchParams.get("cart");

    let checkoutItems = [];

    if (cartParam) {
        try {
            const parsed = JSON.parse(cartParam);

            if (Array.isArray(parsed)) {
                checkoutItems = parsed.filter(
                    item =>
                        item.id !== undefined &&
                        Number(item.quantity) > 0
                );
            }
        } catch (error) {
            console.error("Invalid cart data:", error);
        }
    }





    useEffect(() => {
        if (mode !== "inventory") return;

        let cancelled = false;

        async function loadInventory() {
            setLoading(true);
            setLoadError("");

            try {
                const response = await fetch(
                    `${apiUrl}/api/${entity}`, {
                        headers: {
                            ...getAuthHeaders()
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Unable to load ${entity}: HTTP ${response.status}`
                    );
                }

                const result = await response.json();

                const rows = Array.isArray(result)
                    ? result
                    : Array.isArray(result.data)
                        ? result.data
                        : Array.isArray(result.items)
                            ? result.items
                            : [];

                if (!cancelled) {
                    setRecords(rows);

                    if (rows.length > 0) {
                        const requestedId = searchParams.get("productId");

                        const matchingProduct = rows.find(
                            record => String(record.id) === requestedId
                        );

                        setSelectedId(
                            String(
                                (matchingProduct || rows[0]).id ?? ""
                            )
                        );
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    setLoadError(error.message);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadInventory();

        return () => {
            cancelled = true;
        };
    }, [mode, entity, apiUrl, context.dataVersion, searchParams]);

    const selectedProduct = records.find(
        record => String(record.id) === selectedId
    );

    const unitPrice = mode === "inventory"
        ? Number(selectedProduct?.[priceField])
        : Number(customAmount);

    const total = unitPrice * (
        mode === "inventory" ? quantity : 1
    );

    const validAmount =
        Number.isFinite(total) &&
        total > 0 &&
        Number.isFinite(unitPrice) &&
        unitPrice > 0;
/*
    const formatMoney = amount =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency
        }).format(amount);

*/


    const formatMoney = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency
        }).format(amount);

    const checkoutProducts = checkoutItems.map(item => {
        const product = records.find(
            record => String(record.id) === String(item.id)
        );

        if (!product) {
            return null;
        }

        const price = Number(product[priceField]) || 0;
        const quantity = Number(item.quantity);

        return {
            id: product.id,
            name: product[productField] || product.name || "Product",
            price,
            quantity,
            subtotal: price * quantity
        };
    });

    const validCheckoutProducts = checkoutProducts.filter(Boolean);

    const checkoutTotal = validCheckoutProducts.reduce(
        (total, item) => total + item.subtotal,
        0
    );    




if (cartParam) {
    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>
                    Loading your order...
                </Typography>
            </Box>
        );
    }

    if (loadError) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{loadError}</Alert>
            </Box>
        );
    }

    if (checkoutItems.length === 0 || validCheckoutProducts.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning">
                    No valid products were found in your cart.
                    Please return to the shop and try again.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
                Order Summary
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Review your items before proceeding.
            </Typography>

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {validCheckoutProducts.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>

                                <TableCell align="right">
                                    {formatMoney(item.price)}
                                </TableCell>

                                <TableCell align="right">
                                    {item.quantity}
                                </TableCell>

                                <TableCell align="right">
                                    {formatMoney(item.subtotal)}
                                </TableCell>
                            </TableRow>
                        ))}

                        <TableRow>
                            <TableCell colSpan={3} align="right">
                                <Typography variant="h6">
                                    Order Total
                                </Typography>
                            </TableCell>

                            <TableCell align="right">
                                <Typography variant="h6">
                                    {formatMoney(checkoutTotal)}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Alert severity="info" sx={{ mt: 3, mb: 2 }}>
                Test mode: payment processing has not been connected yet.
                No payment will be taken.
            </Alert>

            <Button
                variant="outlined"
                onClick={() => window.history.back()}
            >
                Back
            </Button>
        </Box>
    );
}







    return (
        <Box sx={{ width: "100%", minWidth: 0 }}>
            {mode === "inventory" ? (
                <>
                    {loading && (
                        <Typography color="text.secondary">
                            Loading products...
                        </Typography>
                    )}

                    {loadError && (
                        <Typography color="error">
                            {loadError}
                        </Typography>
                    )}

                    {!loading && !loadError && records.length === 0 && (
                        <Typography color="text.secondary">
                            No products available.
                        </Typography>
                    )}

                    {!loading && records.length > 0 && (
                        <Box sx={{ display: "grid", gap: 2 }}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Select Product"
                                value={selectedId}
                                onChange={event => {
                                    setSelectedId(event.target.value);
                                    setQuantity(1);
                                }}
                            >
                                {records.map((record, index) => (
                                    <MenuItem
                                        key={record.id ?? index}
                                        value={String(record.id ?? "")}
                                    >
                                        {record[productField] || "Product"}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Typography variant="h6">
                                {selectedProduct &&
                                Number.isFinite(unitPrice) &&
                                unitPrice > 0
                                    ? formatMoney(unitPrice)
                                    : "Price unavailable"}
                            </Typography>

                            {props.quantityEnabled !== false && (
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Quantity"
                                    value={quantity}
                                    onChange={event => {
                                        const value = Number(
                                            event.target.value
                                        );

                                        setQuantity(
                                            Number.isInteger(value) &&
                                            value > 0
                                                ? value
                                                : 1
                                        );
                                    }}
                                    inputProps={{ min: 1, step: 1 }}
                                />
                            )}
                        </Box>
                    )}
                </>
            ) : (
                <Box sx={{ display: "grid", gap: 2 }}>
                    {props.description && (
                        <Typography>
                            {props.description}
                        </Typography>
                    )}

                    {props.allowAmountEdit !== false ? (
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label={`Amount (${currency})`}
                            value={customAmount}
                            onChange={event =>
                                setCustomAmount(event.target.value)
                            }
                            inputProps={{ min: 0, step: "0.01" }}
                        />
                    ) : (
                        <Typography variant="h6">
                            {formatMoney(Number(customAmount))}
                        </Typography>
                    )}
                </Box>
            )}

            <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={
                    loading ||
                    Boolean(loadError) ||
                    (mode === "inventory" &&
                        (!selectedProduct || !validAmount)) ||
                    (mode === "custom" && !validAmount)
                }
                onClick={() => setOpen(true)}
            >
                {props.label || "Buy Now"}
            </Button>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
                fullScreen={false}
                slotProps={{
                    paper: {
                        sx: {
                            width: "100%",
                            m: { xs: 1, sm: 2 },
                            maxWidth: { xs: "calc(100% - 16px)", sm: 600 }
                        }
                    }
                }}
            >
                <DialogTitle>Checkout</DialogTitle>

                <DialogContent>
                    <Typography sx={{ mb: 1 }}>
                        {mode === "inventory"
                            ? selectedProduct?.[productField]
                            : props.description || "Custom payment"}
                    </Typography>

                    {mode === "inventory" && (
                        <Typography color="text.secondary" sx={{ mb: 1 }}>
                            Quantity: {quantity}
                        </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6">
                        Total: {formatMoney(total)}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ mt: 2 }}
                    >
                        Test mode only. No payment will be collected.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setOpen(false)}
                    >
                        Cancel Checkout
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
