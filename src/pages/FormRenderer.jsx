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
    TEXTFIELD
    =====================================================
    */

    if (type === "textfield") {

        const value = binding
            ? getValue(
                context,
                binding
            )
            : "";


        return (
            <TextField

                label={
                    props.label
                }

                name={
                    props.name
                }

                type={
                    props.type ||
                    "text"
                }

                fullWidth={
                    props.fullWidth
                }

                disabled={
                    props.disabled
                }

                size={
                    props.size
                }

                required={
                    props.required
                }

                sx={
                    props.sx
                }

                value={
                    value === null ||
                    value === undefined
                        ? ""
                        : String(value)
                }

                onChange={
                    (event) => {

                        if (
                            handlers
                                ?.handleBindingChange &&
                            binding
                        ) {

                            handlers
                                .handleBindingChange(
                                    binding,
                                    event
                                        .target
                                        .value
                                );

                        }

                    }
                }

            />
        );
    }


    /*
    =====================================================
    SELECT
    =====================================================
    */

    if (type === "select") {

        const value = binding
            ? getValue(
                context,
                binding
            )
            : "";


        return (
            <FormControl
                fullWidth
                sx={
                    props.sx
                }
            >

                <InputLabel>
                    {props.label}
                </InputLabel>

                <Select
                    label={
                        props.label
                    }

                    name={
                        props.name
                    }

                    value={
                        value ??
                        ""
                    }

                    onChange={
                        (event) => {

                            if (
                                handlers
                                    ?.handleBindingChange &&
                                binding
                            ) {

                                handlers
                                    .handleBindingChange(
                                        binding,
                                        event
                                            .target
                                            .value
                                    );

                            }

                        }
                    }
                >

                    {options.map(
                        (
                            option,
                            index
                        ) => {

                            const label =
                                typeof option ===
                                "string"
                                    ? option
                                    : option.label;

                            const optionValue =
                                typeof option ===
                                "string"
                                    ? option
                                    : option.value;


                            return (
                                <MenuItem
                                    key={
                                        optionValue ??
                                        index
                                    }

                                    value={
                                        optionValue
                                    }
                                >
                                    {label}
                                </MenuItem>
                            );

                        }
                    )}

                </Select>

            </FormControl>
        );
    }


    /*
    =====================================================
    CHECKBOX
    =====================================================
    */

    if (type === "checkbox") {

        const value = binding
            ? getValue(
                context,
                binding
            )
            : false;


        return (
            <FormControlLabel

                label={
                    props.label
                }

                control={
                    <Checkbox

                        name={
                            props.name
                        }

                        checked={
                            Boolean(value)
                        }

                        onChange={
                            (event) => {

                                if (
                                    handlers
                                        ?.handleBindingChange &&
                                    binding
                                ) {

                                    handlers
                                        .handleBindingChange(
                                            binding,
                                            event
                                                .target
                                                .checked
                                        );

                                }

                            }
                        }

                    />
                }

            />
        );
    }


    /*
    =====================================================
    TABLE BODY
    =====================================================
    */

    if (type === "tableBody") {

        const rows =
            context[
                dataSource
            ] || [];


        return (
            <TableBody>

                {rows.map(
                    (
                        row,
                        index
                    ) => (

                        <FormRenderer
                            key={
                                row.id ??
                                index
                            }

                            node={
                                children[0]
                            }

                            context={{
                                ...context,
                                row
                            }}

                            handlers={
                                handlers
                            }

                        />

                    )
                )}

            </TableBody>
        );
    }


    /*
    =====================================================
    TABLE ROW
    =====================================================
    */

    if (type === "tableRow") {

        const row =
            context.row;


        const rowEventProps = {};


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

                    rowEventProps[
                        eventName
                    ] =
                        (event) => {

                            handlers[
                                handlerName
                            ](
                                event,
                                row
                            );

                        };

                }

            }
        );


        return (
            <TableRow
                {...props}
                {...rowEventProps}
            >

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

            </TableRow>
        );
    }


    /*
    =====================================================
    TABLE CELL
    =====================================================
    */

    if (type === "tableCell") {

        const value =
            field
                ? getValue(
                    context.row,
                    field
                )
                : text;


        return (
            <TableCell>
                {
                    typeof value ===
                    "boolean"
                        ? value
                            ? "Yes"
                            : "No"
                        : value
                }
            </TableCell>
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