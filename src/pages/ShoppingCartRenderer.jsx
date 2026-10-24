
import React, { useState } from "react";

import {
    Badge,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    TextField,
    Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function ShoppingCartRenderer({
    widget,
    context = {},
    handlers = {}
}) {
    const props = widget?.props || {};
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const cartItems = context.cartItems || [];

    const updateCartQuantity = handlers.updateCartQuantity;
    const removeFromCart = handlers.removeFromCart;

    const currency = props.currency || "INR";

    const cartCount = cartItems.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    const cartTotal = cartItems.reduce(
        (total, item) =>
            total +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );

    const formatMoney = amount =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency
        }).format(amount);

    return (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton
                aria-label="Open shopping cart"
                onClick={() => setOpen(true)}
                color="inherit"
                sx={{ p: 1.5 }}
            >
                <Badge badgeContent={cartCount} color="error">
                    <ShoppingCartIcon fontSize="large" />
                </Badge>
            </IconButton>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
                fullScreen={false}
                sx={{
                    "& .MuiDialog-paper": {
                        m: { xs: 1, sm: 2 },
                        width: "100%",
                        maxWidth: { xs: "calc(100% - 16px)", sm: 600 }
                    }
                }}
            >
                <DialogTitle>
                    {props.title || "Shopping Cart"}
                </DialogTitle>

                <DialogContent>
                    {cartItems.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 3 }}>
                            Your cart is empty.
                        </Typography>
                    ) : (
                        <Box>
                            {cartItems.map(item => (
                                <Box
                                    key={item.id}
                                    sx={{ py: 2 }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {item.name || item.title || "Product"}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
                                    >
                                        {formatMoney(Number(item.price || 0))}
                                        {" "}each
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            mt: 1,
                                            flexWrap: "wrap"
                                        }}
                                    >
                                        <TextField
                                            type="number"
                                            label="Quantity"
                                            size="small"
                                            value={item.quantity}
                                            inputProps={{
                                                min: 1,
                                                step: 1
                                            }}
                                            sx={{ width: 110 }}
                                            onChange={event => {
                                                const quantity = Number(
                                                    event.target.value
                                                );

                                                if (
                                                    Number.isInteger(quantity) &&
                                                    quantity >= 1
                                                ) {
                                                    updateCartQuantity?.(
                                                        item.id,
                                                        quantity
                                                    );
                                                }
                                            }}
                                        />

                                        <Typography
                                            sx={{
                                                flexGrow: 1,
                                                textAlign: "right"
                                            }}
                                        >
                                            {formatMoney(
                                                Number(item.price || 0) *
                                                Number(item.quantity || 0)
                                            )}
                                        </Typography>

                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={() =>
                                                removeFromCart?.(item.id)
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </Box>

                                    <Divider sx={{ mt: 2 }} />
                                </Box>
                            ))}

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    py: 2
                                }}
                            >
                                <Typography variant="h6">
                                    Total
                                </Typography>

                                <Typography variant="h6">
                                    {formatMoney(cartTotal)}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>
                        Continue Shopping
                    </Button>

                    <Button
                        variant="contained"
                        disabled={cartItems.length === 0}
                        onClick={() => {
                            const checkoutItems = cartItems.map(item => ({
                                id: item.id,
                                quantity: item.quantity
                            }));

                            setOpen(false);

                            navigate(
                                `/dashboard/new_payment?cart=${encodeURIComponent(
                                    JSON.stringify(checkoutItems)
                                )}`
                            );
                        }}
                    >
                        Checkout
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
