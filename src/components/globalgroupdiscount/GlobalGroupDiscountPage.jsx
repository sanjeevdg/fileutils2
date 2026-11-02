
import React, { useEffect, useMemo, useState } from "react";

import {
    Box,
    Paper,
    Typography,
    TextField,
    Checkbox,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Chip,
    RadioGroup,
    Radio,
    FormControlLabel,
    Divider,
    InputAdornment,
    Grid
} from "@mui/material";

import { getAuthHeaders } from "../../utils/auth";

const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function GlobalGroupDiscountPage() {

    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [searchText, setSearchText] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Discount settings
    const [discountType, setDiscountType] = useState("percentage");
    const [discountValue, setDiscountValue] = useState("");
    const [discountNote, setDiscountNote] = useState("");

    // Preview
    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Apply
    const [applying, setApplying] = useState(false);
    const [applyResult, setApplyResult] = useState(null);

    // --------------------------------------------
    // Load inventory
    // --------------------------------------------

    useEffect(() => {

        const loadProducts = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/api/inventory`,
                    {
                        headers: {
                            ...getAuthHeaders()
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to load inventory");
                }

                const data = await response.json();

                setProducts(
                    Array.isArray(data)
                        ? data
                        : data.rows || data.items || []
                );

            } catch (err) {

                console.error(err);
                setError(err.message);

            } finally {

                setLoading(false);

            }
        };

        loadProducts();

    }, []);

    // --------------------------------------------
    // Filter products
    // --------------------------------------------

    const filteredProducts = useMemo(() => {

        const search = searchText.toLowerCase();

        return products.filter(product =>
            `${product.name || ""} ${product.sku || ""}`
                .toLowerCase()
                .includes(search)
        );

    }, [products, searchText]);

    // --------------------------------------------
    // Product selection
    // --------------------------------------------

    const toggleProduct = (productId) => {

        setSelectedProducts(previous => {

            if (previous.includes(productId)) {
                return previous.filter(id => id !== productId);
            }

            return [...previous, productId];

        });

        setPreview(null);
        setApplyResult(null);
        setSuccess("");
    };

    const toggleSelectAll = () => {

        const visibleIds = filteredProducts.map(p => p.id);

        const allSelected = visibleIds.every(id =>
            selectedProducts.includes(id)
        );

        if (allSelected) {

            setSelectedProducts(previous =>
                previous.filter(id => !visibleIds.includes(id))
            );

        } else {

            setSelectedProducts(previous =>
                [...new Set([...previous, ...visibleIds])]
            );

        }

        setPreview(null);
        setApplyResult(null);
        setSuccess("");
    };

    // --------------------------------------------
    // Validation
    // --------------------------------------------

    const validateDiscount = () => {

        if (selectedProducts.length === 0) {
            return "Please select at least one product.";
        }

        const value = Number(discountValue);

        if (!discountValue || !Number.isFinite(value) || value <= 0) {
            return "Please enter a valid discount value greater than zero.";
        }

        if (discountType === "percentage" && value > 100) {
            return "Percentage discount cannot exceed 100%.";
        }

        return "";
    };

    const settingsValid = !validateDiscount();

    // --------------------------------------------
    // Common request payload
    // --------------------------------------------

    const getRequestData = () => ({
        product_ids: selectedProducts,
        discount_type: discountType,
        discount_value: Number(discountValue),
        discount_note: discountNote
    });

    // --------------------------------------------
    // Preview discount
    // --------------------------------------------

    const handlePreview = async () => {

        try {

            setError("");
            setSuccess("");
            setPreview(null);
            setApplyResult(null);

            const validationError = validateDiscount();

            if (validationError) {
                setError(validationError);
                return;
            }

            setPreviewLoading(true);

            const response = await fetch(
                `${API_URL}/api/orders/preview-global-discount`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify(getRequestData())
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "Unable to generate preview."
                );
            }

            setPreview(result);

        } catch (err) {

            console.error(err);
            setError(err.message);

        } finally {

            setPreviewLoading(false);

        }
    };

    // --------------------------------------------
    // Apply discount
    // --------------------------------------------

    const handleApplyDiscount = async () => {

        if (!preview) {
            setError("Please generate a preview first.");
            return;
        }

        const confirmed = window.confirm(
            `Apply this discount to ${preview.matching_items} order items across ${preview.affected_orders} orders?\n\n` +
            `Total discount: ${Number(preview.total_discount).toFixed(2)}`
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");
            setSuccess("");
            setApplying(true);

            const response = await fetch(
                `${API_URL}/api/orders/apply-global-discount`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify(getRequestData())
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "Unable to apply discount."
                );
            }

            setApplyResult(result);
            setSuccess(result.message || "Discount applied successfully.");

            // Clear preview so the same preview cannot be applied again.
            setPreview(null);

        } catch (err) {

            console.error(err);
            setError(err.message);

        } finally {

            setApplying(false);

        }
    };

    // --------------------------------------------
    // Currency/amount formatting
    // --------------------------------------------

    const formatAmount = value =>
        Number(value || 0).toFixed(2);

    // --------------------------------------------
    // Render
    // --------------------------------------------

    return (

        <Box sx={{ p: 3 }}>

            <Typography variant="h5" fontWeight="bold" mb={1}>
                Global Group Discount
            </Typography>

            <Typography color="text.secondary" mb={3}>
                Apply discounts across matching products in eligible orders.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {/* ================================== */}
            {/* PRODUCT SELECTION */}
            {/* ================================== */}

            <Paper sx={{ p: 2, mb: 3 }}>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={2}
                    mb={2}
                >

                    <Typography variant="h6">
                        1. Select Products
                    </Typography>

                    <Chip
                        label={`${selectedProducts.length} selected`}
                        color="primary"
                    />

                </Box>

                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by product name or SKU..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    sx={{ mb: 2 }}
                />

                {loading ? (

                    <Box display="flex" sx={{justifyContent:"center"}}  p={4}>
                        <CircularProgress />
                    </Box>

                ) : (

                    <TableContainer>

                        <Table size="small">

                            <TableHead>

                                <TableRow>

                                    <TableCell padding="checkbox">

                                        <Checkbox
                                            checked={
                                                filteredProducts.length > 0 &&
                                                filteredProducts.every(p =>
                                                    selectedProducts.includes(p.id)
                                                )
                                            }
                                            indeterminate={
                                                filteredProducts.some(p =>
                                                    selectedProducts.includes(p.id)
                                                ) &&
                                                !filteredProducts.every(p =>
                                                    selectedProducts.includes(p.id)
                                                )
                                            }
                                            onChange={toggleSelectAll}
                                        />

                                    </TableCell>

                                    <TableCell>SKU</TableCell>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="right">Stock</TableCell>

                                </TableRow>

                            </TableHead>

                            <TableBody>

                                {filteredProducts.map(product => (

                                    <TableRow
                                        key={product.id}
                                        hover
                                        selected={selectedProducts.includes(product.id)}
                                        onClick={() => toggleProduct(product.id)}
                                        sx={{ cursor: "pointer" }}
                                    >

                                        <TableCell padding="checkbox">

                                            <Checkbox
                                                checked={selectedProducts.includes(product.id)}
                                                onClick={e => e.stopPropagation()}
                                                onChange={() => toggleProduct(product.id)}
                                            />

                                        </TableCell>

                                        <TableCell>
                                            {product.sku}
                                        </TableCell>

                                        <TableCell>
                                            {product.name}
                                        </TableCell>

                                        <TableCell align="right">
                                            {formatAmount(product.price)}
                                        </TableCell>

                                        <TableCell align="right">
                                            {product.stock_quantity ?? "-"}
                                        </TableCell>

                                    </TableRow>

                                ))}

                                {filteredProducts.length === 0 && (

                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No products found.
                                        </TableCell>
                                    </TableRow>

                                )}

                            </TableBody>

                        </Table>

                    </TableContainer>

                )}

                <Box display="flex" justifyContent="flex-end" mt={2}>

                    <Button
                        variant="outlined"
                        onClick={() => {
                            setSelectedProducts([]);
                            setPreview(null);
                            setApplyResult(null);
                            setSuccess("");
                        }}
                        disabled={selectedProducts.length === 0}
                    >
                        Clear Selection
                    </Button>

                </Box>

            </Paper>

            {/* ================================== */}
            {/* DISCOUNT SETTINGS */}
            {/* ================================== */}

            <Paper sx={{ p: 2, mb: 3 }}>

                <Typography variant="h6" mb={2}>
                    2. Discount Settings
                </Typography>

                <RadioGroup
                    row
                    value={discountType}
                    onChange={e => {
                        setDiscountType(e.target.value);
                        setPreview(null);
                        setApplyResult(null);
                        setSuccess("");
                    }}
                >

                    <FormControlLabel
                        value="percentage"
                        control={<Radio />}
                        label="Percentage (%)"
                    />

                    <FormControlLabel
                        value="fixed"
                        control={<Radio />}
                        label="Fixed Amount"
                    />

                </RadioGroup>

                <TextField
                    label={
                        discountType === "percentage"
                            ? "Discount Percentage"
                            : "Discount Amount"
                    }
                    type="number"
                    value={discountValue}
                    onChange={e => {
                        setDiscountValue(e.target.value);
                        setPreview(null);
                        setApplyResult(null);
                        setSuccess("");
                    }}
                    sx={{ mt: 2, maxWidth: 350 }}
                    fullWidth
                    inputProps={{
                        min: 0,
                        max: discountType === "percentage" ? 100 : undefined,
                        step: "0.01"
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                {discountType === "percentage" ? "%" : "Amount"}
                            </InputAdornment>
                        )
                    }}
                />

                <TextField
                    label="Discount Note (Optional)"
                    value={discountNote}
                    onChange={e => {
                        setDiscountNote(e.target.value);
                        setPreview(null);
                        setApplyResult(null);
                        setSuccess("");
                    }}
                    fullWidth
                    multiline
                    rows={2}
                    sx={{ mt: 2 }}
                    placeholder="Example: November group promotion"
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2">
                    Products selected: {selectedProducts.length}
                </Typography>

                <Typography variant="body2">
                    Discount type: {
                        discountType === "percentage"
                            ? "Percentage"
                            : "Fixed Amount"
                    }
                </Typography>

                <Typography variant="body2">
                    Discount value: {discountValue || "Not entered"}
                    {discountType === "percentage" && discountValue ? "%" : ""}
                </Typography>

                <Button
                    variant="contained"
                    sx={{ mt: 3 }}
                    disabled={!settingsValid || previewLoading || applying}
                    onClick={handlePreview}
                >

                    {previewLoading ? (
                        <>
                            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                            Generating Preview...
                        </>
                    ) : (
                        "Generate Discount Preview"
                    )}

                </Button>

                {!settingsValid && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={1}
                    >
                        {validateDiscount()}
                    </Typography>
                )}

            </Paper>

            {/* ================================== */}
            {/* PREVIEW RESULTS */}
            {/* ================================== */}

            {preview && (

                <Paper sx={{ p: 3, mb: 3 }}>

                    <Typography variant="h6" mb={1}>
                        3. Discount Preview
                    </Typography>

                    <Typography color="text.secondary" variant="body2" mb={3}>
                        Only submitted and approved orders are included.
                        No database changes have been made yet.
                    </Typography>

                    <Grid container spacing={2}>

                        <Grid xs={12} sm={6} md={3}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Matching Order Items
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {preview.matching_items}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid xs={12} sm={6} md={3}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Affected Orders
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {preview.affected_orders}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid xs={12} sm={6} md={3}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Original Amount
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {formatAmount(preview.total_original_amount)}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid xs={12} sm={6} md={3}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Total Discount
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                    {formatAmount(preview.total_discount)}
                                </Typography>
                            </Paper>
                        </Grid>

                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                        Product-wise Breakdown
                    </Typography>

                    <TableContainer>

                        <Table size="small">

                            <TableHead>

                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="right">Items</TableCell>
                                    <TableCell align="right">Orders</TableCell>
                                    <TableCell align="right">Original</TableCell>
                                    <TableCell align="right">Discount</TableCell>
                                    <TableCell align="right">Final</TableCell>
                                </TableRow>

                            </TableHead>

                            <TableBody>

                                {preview.products.map(product => (

                                    <TableRow key={product.product_id}>

                                        <TableCell>
                                            {product.product_name}
                                        </TableCell>

                                        <TableCell align="right">
                                            {product.matching_items}
                                        </TableCell>

                                        <TableCell align="right">
                                            {product.affected_orders}
                                        </TableCell>

                                        <TableCell align="right">
                                            {formatAmount(product.original_amount)}
                                        </TableCell>

                                        <TableCell align="right">
                                            {formatAmount(product.discount_amount)}
                                        </TableCell>

                                        <TableCell align="right">
                                            {formatAmount(product.final_amount)}
                                        </TableCell>

                                    </TableRow>

                                ))}

                            </TableBody>

                        </Table>

                    </TableContainer>

                    <Divider sx={{ my: 3 }} />

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={2}
                    >

                        <Box>

                            <Typography variant="body2" color="text.secondary">
                                Final amount after discount
                            </Typography>

                            <Typography variant="h4" fontWeight="bold">
                                {formatAmount(preview.total_final_amount)}
                            </Typography>

                        </Box>

                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            onClick={handleApplyDiscount}
                            disabled={applying || preview.matching_items === 0}
                        >

                            {applying ? (
                                <>
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                        sx={{ mr: 1 }}
                                    />
                                    Applying...
                                </>
                            ) : (
                                "Confirm & Apply Discount"
                            )}

                        </Button>

                    </Box>

                </Paper>

            )}

            {/* ================================== */}
            {/* APPLICATION RESULT */}
            {/* ================================== */}

            {applyResult && (

                <Paper sx={{ p: 3, mb: 3 }}>

                    <Typography variant="h6" color="success.main" mb={2}>
                        Discount Application Completed
                    </Typography>

                    <Typography>
                        Discount Batch ID: {applyResult.discount_batch_id}
                    </Typography>

                    <Typography>
                        Updated Order Items: {applyResult.updated_items}
                    </Typography>

                    <Typography>
                        Affected Orders: {applyResult.affected_orders}
                    </Typography>

                    <Typography>
                        Total Discount: {formatAmount(applyResult.total_discount)}
                    </Typography>

                </Paper>

            )}

        </Box>

    );

}
