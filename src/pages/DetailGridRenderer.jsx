import React, {
    useEffect,
    useState
} from "react";

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

    const props =
        widget?.props || {};

    const config = context?.config || {};

    const entities = config?.entities || {};    

    const detailField =
        props.detailField ||
        "orderItems";

    const source =
        props.source || {};

    const entity =
        source.entity || "";

    const columns =
        props.columns || [];

    // -------------------------------------------------
    // Reference data
    //
    // For the moment we retain the existing behavior:
    // product_id -> inventory
    //
    // We will make this generic in the next step.
    // -------------------------------------------------

    //const [products, setProducts] =   useState([]);

    const [referenceOptions, setReferenceOptions] = useState({});    

    const [items, setItems] =
        useState(
            context?.formData?.[detailField] || []
        );


            // -------------------------------------------------
            // Load reference data
            //
            // Temporary compatibility with the existing
            // Order Items implementation.
            // -------------------------------------------------

            
        useEffect(() => {
            const entityFields =
                context?.config?.entities?.[entity]?.fields || [];
            console.log("DETAIL GRID ENTITY:", entity);
            console.log("DETAIL GRID ENTITY FIELDS:", entityFields);
            console.log("DETAIL GRID COLUMNS:", columns);    
            const referenceFields = columns
                .map(column =>
                    typeof column === "string"
                        ? column
                        : column.field
                )
                .map(fieldName =>
                    entityFields.find(
                        field => field.name === fieldName
                    )
                )
                .filter(field => field?.type === "reference");

            let cancelled = false;

            const loadReferenceOptions = async () => {
                const optionsByField = {};

                await Promise.all(
                    referenceFields.map(async field => {
                        const reference = field.reference || {};
                        const referenceEntity = reference.entity;

                        if (!referenceEntity) return;

                        try {
                            const response = await fetch(
                                `${API_URL}/api/${referenceEntity}`
                            );

                            if (!response.ok) {
                                throw new Error(
                                    `Failed to load ${referenceEntity}: ${response.status}`
                                );
                            }

                            const records = await response.json();

                            optionsByField[field.name] = {
                                valueField: reference.valueField || "id",
                                labelField:
                                    reference.labelField ||
                                    reference.valueField ||
                                    "id",
                                records: Array.isArray(records)
                                    ? records
                                    : []
                            };
                        } catch (err) {
                            console.error(
                                `REFERENCE OPTIONS ERROR (${field.name}):`,
                                err
                            );
                        }
                    })
                );
                console.log("DETAIL GRID REFERENCE OPTIONS:", optionsByField);
                if (!cancelled) {
                    setReferenceOptions(optionsByField);
                }
            };

            loadReferenceOptions();

            return () => {
                cancelled = true;
            };
        }, [entity, columns, context?.config?.entities]);


    // -------------------------------------------------
    // Keep local items synchronized with formData
    // -------------------------------------------------

    useEffect(() => {

        setItems(
            context?.formData?.[detailField] || []
        );

    }, [
        context?.formData?.[detailField],
        detailField
    ]);


    // -------------------------------------------------
    // Update detail records
    // -------------------------------------------------

    const updateItems = (newItems) => {

        setItems(newItems);

        handlers?.updateField?.(
            detailField,
            newItems
        );

    };


    // -------------------------------------------------
    // Add detail record
    // -------------------------------------------------

    const addItem = () => {

        const newItem = {};

        columns.forEach(column => {

            const field =
                typeof column === "string"
                    ? column
                    : column.field;

            if (!field) {
                return;
            }

            if (field === "quantity") {

                newItem[field] = 1;

            } else if (field === "amount") {

                newItem[field] = 0;

            } else {

                newItem[field] = "";

            }

        });


        updateItems([
            ...items,
            newItem
        ]);

    };


    // -------------------------------------------------
    // Remove detail record
    // -------------------------------------------------

    const removeItem = (index) => {

        updateItems(
            items.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );

    };


    // -------------------------------------------------
    // Product change
    //
    // Temporary compatibility with the existing
    // product_id / inventory relationship.
    // -------------------------------------------------

            
        const changeReference = (index, field, value) => {
            const options = referenceOptions[field];

            const selectedRecord = options?.records.find(
                record =>
                    String(record[options.valueField]) === String(value)
            );

            const newItems = items.map((item, itemIndex) => {
                if (itemIndex !== index) return item;

                const updatedItem = {
                    ...item,
                    [field]: value
                };

                // Preserve the existing product amount calculation.
                if (field === "product_id") {
                    const quantity = Number(item.quantity || 1);
                    const price = Number(selectedRecord?.price || 0);

                    updatedItem.amount = price * quantity;
                }

                return updatedItem;
            });

            updateItems(newItems);
        };


    // -------------------------------------------------
    // Quantity change
    // -------------------------------------------------

    const changeQuantity = (
        index,
        quantityValue
    ) => {

        const quantity =
            Number(quantityValue);


       
        const productId = items[index]?.product_id;
        const productOptions = referenceOptions.product_id;

        const product = productOptions?.records.find(
            record =>
                String(record[productOptions.valueField]) ===
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


    // -------------------------------------------------
    // Total
    // -------------------------------------------------

    const total =
        items.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.amount || 0
                ),
            0
        );


    // -------------------------------------------------
    // Nothing configured
    // -------------------------------------------------

    if (!columns.length) {

        return (
            <Typography
                color="text.secondary"
            >
                No Detail Grid columns configured.
            </Typography>
        );

    }


    // -------------------------------------------------
    // Render a column
    // -------------------------------------------------

    const renderField = (
        column,
        item,
        index
    ) => {

        const field =
            typeof column === "string"
                ? column
                : column.field;


        const label =
            typeof column === "string"
                ? column
                : column.label ||
                  column.field;


        // ---------------------------------------------
        // Product reference
        //
        // Temporary compatibility with current
        // order_items configuration.
        // ---------------------------------------------

        
            const reference = referenceOptions[field];

            if (reference) {
                return (
                    <TextField
                        key={field}
                        select
                        fullWidth
                        label={label}
                        value={item[field] ?? ""}
                        onChange={event =>
                            changeReference(
                                index,
                                field,
                                event.target.value
                            )
                        }
                    >
                        {reference.records.map(record => (
                            <MenuItem
                                key={record[reference.valueField]}
                                value={record[reference.valueField]}
                            >
                                {record[reference.labelField]}
                            </MenuItem>
                        ))}
                    </TextField>
                );
            }


        // ---------------------------------------------
        // Quantity
        // ---------------------------------------------

        if (field === "quantity") {

            return (
                <TextField
                    key={field}
                    type="number"
                    label={label}
                    value={
                        item[field] ?? ""
                    }
                    onChange={(event) =>
                        changeQuantity(
                            index,
                            event.target.value
                        )
                    }
                />
            );

        }


        // ---------------------------------------------
        // Amount
        // ---------------------------------------------

        if (field === "amount") {

            return (
                <TextField
                    key={field}
                    label={label}
                    value={
                        item[field] ?? 0
                    }
                    slotProps={{
                        htmlInput: {
                            readOnly: true
                        }
                    }}
                />
            );

        }


        // ---------------------------------------------
        // Generic field
        // ---------------------------------------------

        return (
            <TextField
                key={field}
                fullWidth
                label={label}
                value={
                    item[field] ?? ""
                }
                onChange={(event) => {

                    const value =
                        event.target.value;

                    const newItems =
                        items.map(
                            (currentItem,
                                itemIndex) =>
                                itemIndex === index
                                    ? {
                                        ...currentItem,
                                        [field]:
                                            value
                                    }
                                    : currentItem
                        );

                    updateItems(newItems);

                }}
            />
        );

    };


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
                    "Detail Grid"}
            </Typography>


            {items.map(
                (item, index) => (

                    <Box
                        key={index}
                        sx={{
                            display: "grid",
                            gridTemplateColumns:
                                `repeat(
                                    ${Math.min(
                                        columns.length,
                                        4
                                    )},
                                    1fr
                                ) auto`,
                            gap: 2,
                            mb: 2,
                            alignItems:
                                "center"
                        }}
                    >

                        {columns.map(
                            column =>
                                renderField(
                                    column,
                                    item,
                                    index
                                )
                        )}


                        <Button
                            color="error"
                            variant="outlined"
                            onClick={() =>
                                removeItem(
                                    index
                                )
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
                Total:{" "}
                {total.toFixed(2)}
            </Typography>

        </Paper>

    );

}
