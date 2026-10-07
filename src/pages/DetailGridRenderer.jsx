import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

const API_URL =
    import.meta.env.VITE_API_URL;

export default function DetailGridRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    const props = widget?.props || {};

    const detailField =
        props.detailField || "orderItems";

    const source =
        props.source || {};

    const productEntity =
        source.entity || "inventory";

    const [products, setProducts] =
        useState([]);

    const [items, setItems] =
        useState(
            context?.formData?.[detailField] || []
        );


    /*
     * Load products
     */
    useEffect(() => {

        const loadProducts = async () => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/${productEntity}`
                    );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load ${productEntity}: ${response.status}`
                    );
                }

                const result =
                    await response.json();

                setProducts(
                    Array.isArray(result)
                        ? result
                        : []
                );

            } catch (err) {

                console.error(
                    "DETAIL GRID PRODUCT ERROR:",
                    err
                );

            }

        };

        loadProducts();

    }, [productEntity]);


    /*
     * Keep local items synchronized
     * with formData when needed.
     */
    useEffect(() => {

        setItems(
            context?.formData?.[detailField] || []
        );

    }, [
        context?.formData?.[detailField],
        detailField
    ]);


    /*
     * Update parent formData
     */
    const updateItems = (
        newItems
    ) => {

        setItems(newItems);

        handlers?.updateField?.(
            detailField,
            newItems
        );

    };


    /*
     * Add a new blank item
     */
    const addItem = () => {

        updateItems([
            ...items,
            {
                product_id: "",
                quantity: 1,
                amount: 0
            }
        ]);

    };


    /*
     * Remove item
     */
    const removeItem = (index) => {

        updateItems(
            items.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );

    };


    /*
     * Change product
     */
    const changeProduct = (
        index,
        productId
    ) => {

        const product =
            products.find(
                p =>
                    String(p.id) ===
                    String(productId)
            );

        const quantity =
            Number(
                items[index]?.quantity || 1
            );

        const price =
            Number(
                product?.price || 0
            );

        const amount =
            price * quantity;

        const newItems =
            items.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                            ...item,
                            product_id:
                                productId,
                            amount
                        }
                        : item
            );

        updateItems(newItems);

    };


    /*
     * Change quantity
     */
    const changeQuantity = (
        index,
        quantityValue
    ) => {

        const quantity =
            Number(quantityValue);

        const productId =
            items[index]?.product_id;

        const product =
            products.find(
                p =>
                    String(p.id) ===
                    String(productId)
            );

        const price =
            Number(
                product?.price || 0
            );

        const amount =
            price * quantity;

        const newItems =
            items.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                            ...item,
                            quantity,
                            amount
                        }
                        : item
            );

        updateItems(newItems);

    };


    const total =
        items.reduce(
            (sum, item) =>
                sum +
                Number(item.amount || 0),
            0
        );


    return (

        <Paper
            elevation={2}
            sx={{
                p: 2,
                mt: 2
            }}
        >

            <Typography
                variant="h6"
                gutterBottom
            >
                {widget.title ||
                    "Order Items"}
            </Typography>


            {items.map(
                (item, index) => (

                    <Box
                        key={index}
                        sx={{
                            display: "grid",
                            gridTemplateColumns:
                                "2fr 1fr 1fr auto",
                            gap: 2,
                            mb: 2,
                            alignItems:
                                "center"
                        }}
                    >

                        <TextField
                            select
                            fullWidth
                            label="Product"
                            value={
                                item.product_id ??
                                ""
                            }
                            onChange={(event) =>
                                changeProduct(
                                    index,
                                    event.target.value
                                )
                            }
                        >

                            {products.map(
                                product => (

                                    <MenuItem
                                        key={
                                            product.id
                                        }
                                        value={
                                            product.id
                                        }
                                    >
                                        {product.name}
                                    </MenuItem>

                                )
                            )}

                        </TextField>


                        <TextField
                            type="number"
                            label="Quantity"
                            value={
                                item.quantity ??
                                ""
                            }
                            onChange={(event) =>
                                changeQuantity(
                                    index,
                                    event.target.value
                                )
                            }
                        />


                        <TextField
                            label="Amount"
                            value={
                                item.amount ?? 0
                            }
                            slotProps={{
                                htmlInput: {
                                    readOnly: true
                                }
                            }}
                        />


                        <Button
                            color="error"
                            variant="outlined"
                            onClick={() =>
                                removeItem(index)
                            }
                        >
                            Remove
                        </Button>

                    </Box>

                )
            )}


            <Button
                variant="outlined"
                onClick={addItem}
            >
                Add Item
            </Button>


            <Typography
                variant="h6"
                sx={{
                    mt: 2,
                    textAlign: "right"
                }}
            >
                Total: {total.toFixed(2)}
            </Typography>

        </Paper>
    );
}