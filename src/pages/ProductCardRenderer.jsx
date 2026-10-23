
import React, { useEffect, useState } from "react";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Grid
} from "@mui/material";

import ProductImageGallery from "./ProductImageGallery";

export default function ProductCardRenderer({
    widget,
    context = {}
}) {
    const props = widget?.props || {};

    const entity = props.entity || "inventory";

    const titleField = props.titleField || "name";
    const descriptionField = props.descriptionField || "description";
    const priceField = props.priceField || "price";
    const imageField = props.imageField || "images";
    const skuField = props.skuField || "sku";
    const stockField = props.stockField || "stock_quantity";

    const columns = Number(props.columns) || 3;

    const [fetchedRecords, setFetchedRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadRecords = async () => {
            setLoading(true);
            setLoadError("");

            try {
                const apiUrl =
                    import.meta.env.VITE_API_URL ||
                    "http://127.0.0.1:8000";

                const response = await fetch(
                    `${apiUrl}/api/${entity}`
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load ${entity}: HTTP ${response.status}`
                    );
                }

                const result = await response.json();

                // Support either a direct array or an object containing data.
                const rows = Array.isArray(result)
                    ? result
                    : Array.isArray(result.data)
                        ? result.data
                        : Array.isArray(result.items)
                            ? result.items
                            : [];

                if (!cancelled) {
                    setFetchedRecords(rows);
                }
            } catch (error) {
                if (!cancelled) {
                    setLoadError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadRecords();

        return () => {
            cancelled = true;
        };
    }, [entity, context.dataVersion]);




    const records = Array.isArray(context[entity])
        ? context[entity]
        : fetchedRecords;




    if (loading) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">
                    Loading {entity} products...
                </Typography>
            </Box>
        );
    }

    if (loadError) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="error">
                    {loadError}
                </Typography>
            </Box>
        );
    }    









    if (records.length === 0) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">
                    No {entity} records available.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%" }}>
            {widget.title && (
                <Typography variant="h5" sx={{ mb: 2 }}>
                    {widget.title}
                </Typography>
            )}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: `repeat(${Math.min(columns, 2)}, minmax(0, 1fr))`,
                        md: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))`
                    },
                    gap: 2,
                    width: "100%"
                }}
            >









                {records.map((record, index) => {
                    const stock = Number(record[stockField] || 0);

                    return (
                        <Box
                            key={record.id ?? index}
                            sx={{ minWidth: 0 }}
                        >
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column"
                                }}
                            >
                                <Box sx={{ p: 1 }}>
                                    <ProductImageGallery
                                        images={record[imageField]}
                                        productName={
                                            record[titleField] || "Product"
                                        }
                                        height={220}
                                    />
                                </Box>

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                    >
                                        {record[titleField] || "Untitled"}
                                    </Typography>

                                    {props.showSku !== false &&
                                        record[skuField] != null && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 1 }}
                                            >
                                                SKU: {record[skuField]}
                                            </Typography>
                                        )}

                                    {record[descriptionField] && (
                                        <Typography
                                            variant="body2"
                                            sx={{ mb: 2 }}
                                        >
                                            {record[descriptionField]}
                                        </Typography>
                                    )}

                                    {props.showPrice !== false && (
                                        <Typography
                                            variant="h6"
                                            sx={{ mb: 1 }}
                                        >
                                            {record[priceField] != null
                                                ? `₹${Number(
                                                    record[priceField]
                                                ).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}`
                                                : "Price unavailable"}
                                        </Typography>
                                    )}

                                    {props.showStock !== false && (
                                        <Chip
                                            size="small"
                                            label={
                                                stock > 0
                                                    ? `${stock} in stock`
                                                    : "Out of stock"
                                            }
                                            color={
                                                stock > 0
                                                    ? "success"
                                                    : "default"
                                            }
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
