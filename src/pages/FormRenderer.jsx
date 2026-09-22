import React from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";

function getValue(object, path) {

    if (!object || !path) {
        return undefined;
    }

    return path
        .split(".")
        .reduce(
            (value, key) =>
                value?.[key],
            object
        );
}


export default function FormRenderer({
    node,
    context,
    handlers
}) {

    if (!node) {
        return null;
    }

    // Conditional rendering
    if (node.visibleWhen) {

        const value = getValue(
            context,
            node.visibleWhen
        );

        if (!value) {
            return null;
        }
    }

    const {
        type,
        props = {},
        children = [],
        text,
        field,
        binding,
        dataSource,
        events = {},
        options = []
    } = node;



/*
=====================================================
ENTITY FORM
=====================================================
*/

if (type === "form") {

    const formEntity =
        context?.config?.entities?.[node.entity];

    if (!formEntity) {
        return (
            <Typography color="error">
                Entity "{node.entity}" not found
            </Typography>
        );
    }

    const record =
        binding
            ? getValue(context, binding)
            : {};

    const updateField =
        handlers?.updateField;

    return (
        <Box>

            {(node.fields || []).map((fieldName) => {

                const fieldConfig =
                    formEntity.fields?.find(
                        (field) =>
                            field.name === fieldName
                    );

                if (!fieldConfig) {
                    return null;
                }

                const fieldValue =
                    record?.[fieldName] ?? "";

                const fieldType =
                    fieldConfig.type || "text";

                const label =
                    fieldConfig.label || fieldName;

                const disabled =
                    fieldConfig.readonly ||
                    fieldConfig.name === "id";


                /*
                =========================================
                REFERENCE
                =========================================
                */

                if (fieldType === "reference") {

                    const reference =
                        fieldConfig.reference;

                    const referenceEntity =
                        reference?.entity;

                    const referenceData =
                        context?.[
                            referenceEntity
                        ] || [];

                    return (
                        <FormControl
                            key={fieldName}
                            fullWidth
                            margin="normal"
                        >

                            <InputLabel>
                                {label}
                            </InputLabel>

                            <Select
                                label={label}
                                value={fieldValue ?? ""}
                                disabled={disabled}

                                onChange={(event) => {

                                    updateField?.(
                                        binding,
                                        fieldName,
                                        event.target.value
                                    );

                                }}
                            >

                                {referenceData.map(
                                    (option) => {

                                        const value =
                                            option[
                                                reference.valueField
                                            ];

                                        const optionLabel =
                                            option[
                                                reference.labelField
                                            ];

                                        return (
                                            <MenuItem
                                                key={value}
                                                value={value}
                                            >
                                                {optionLabel}
                                            </MenuItem>
                                        );

                                    }
                                )}

                            </Select>

                        </FormControl>
                    );
                }


                /*
                =========================================
                SELECT
                =========================================
                */

                if (fieldType === "select") {

                    return (
                        <FormControl
                            key={fieldName}
                            fullWidth
                            margin="normal"
                        >

                            <InputLabel>
                                {label}
                            </InputLabel>

                            <Select
                                label={label}
                                value={fieldValue ?? ""}
                                disabled={disabled}

                                onChange={(event) => {

                                    updateField?.(
                                        binding,
                                        fieldName,
                                        event.target.value
                                    );

                                }}
                            >

                                {(fieldConfig.options || [])
                                    .map((option, index) => {

                                        const optionLabel =
                                            typeof option === "string"
                                                ? option
                                                : option.label;

                                        const optionValue =
                                            typeof option === "string"
                                                ? option
                                                : option.value;

                                        return (
                                            <MenuItem
                                                key={
                                                    optionValue ?? index
                                                }
                                                value={
                                                    optionValue
                                                }
                                            >
                                                {optionLabel}
                                            </MenuItem>
                                        );

                                    })}

                            </Select>

                        </FormControl>
                    );
                }


                /*
                =========================================
                CHECKBOX / BOOLEAN
                =========================================
                */

                if (
                    fieldType === "checkbox" ||
                    fieldType === "boolean"
                ) {

                    return (
                        <FormControlLabel
                            key={fieldName}
                            label={label}

                            control={
                                <Checkbox
                                    checked={
                                        Boolean(fieldValue)
                                    }

                                    disabled={disabled}

                                    onChange={(event) => {

                                        updateField?.(
                                            binding,
                                            fieldName,
                                            event.target.checked
                                        );

                                    }}
                                />
                            }
                        />
                    );
                }


                /*
                =========================================
                DATE
                =========================================
                */

                if (fieldType === "date") {

                    return (
                        <TextField
                            key={fieldName}
                            label={label}
                            type="date"

                            value={
                                fieldValue ?? ""
                            }

                            fullWidth
                            margin="normal"

                            InputLabelProps={{
                                shrink: true
                            }}

                            disabled={disabled}

                            onChange={(event) => {

                                updateField?.(
                                    binding,
                                    fieldName,
                                    event.target.value
                                );

                            }}
                        />
                    );
                }


                /*
                =========================================
                CURRENCY / NUMBER
                =========================================
                */

                if (
                    fieldType === "currency" ||
                    fieldType === "number"
                ) {

                    return (
                        <TextField
                            key={fieldName}
                            label={label}
                            type="number"

                            value={
                                fieldValue ?? ""
                            }

                            fullWidth
                            margin="normal"

                            disabled={disabled}

                            inputProps={
                                fieldType === "currency"
                                    ? {
                                        min: 0,
                                        step: "0.01"
                                    }
                                    : undefined
                            }

                            onChange={(event) => {

                                updateField?.(
                                    binding,
                                    fieldName,
                                    event.target.value
                                );

                            }}
                        />
                    );
                }


                /*
                =========================================
                TEXT / EMAIL
                =========================================
                */

                return (
                    <TextField
                        key={fieldName}

                        label={label}

                        type={
                            fieldType === "email"
                                ? "email"
                                : "text"
                        }

                        value={
                            fieldValue ?? ""
                        }

                        fullWidth
                        margin="normal"

                        disabled={disabled}

                        onChange={(event) => {

                            updateField?.(
                                binding,
                                fieldName,
                                event.target.value
                            );

                        }}
                    />
                );

            })}

        </Box>
    );
}




    /*
    =====================================================
    NORMAL MUI COMPONENT
    =====================================================
    */

    const componentMap = {

        container:
            Container,

        box:
            Box,

        grid:
            Grid,

        paper:
            Paper,

        typography:
            Typography,

        button:
            Button,

        table:
            Table,

        tableHead:
            TableHead,

        tableBody:
            TableBody,

        tableRow:
            TableRow,

        tableCell:
            TableCell

    };


    const Component =
        componentMap[type];


    if (!Component) {

        console.warn(
            `Unknown component type: ${type}`
        );

        return null;
    }


    const eventProps = {};


    Object.entries(
        events
    ).forEach(
        (
            [
                eventName,
                handlerName
            ]
        ) => {

            if (
                handlers?.[
                    handlerName
                ]
            ) {

                eventProps[
                    eventName
                ] =
                    handlers[
                        handlerName
                    ];

            }

        }
    );


    return (
        <Component
            {...props}
            {...eventProps}
        >

            {text}

            {children.map(
                (
                    child,
                    index
                ) => (

                    <FormRenderer
                        key={
                            index
                        }

                        node={
                            child
                        }

                        context={
                            context
                        }

                        handlers={
                            handlers
                        }

                    />

                )
            )}

        </Component>
    );
}