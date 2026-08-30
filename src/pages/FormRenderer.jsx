import React from "react";
import ChildTableRenderer from "./ChildTableRenderer";
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

import EntityFormRenderer from "./EntityFormRenderer";
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

            {(node.fields || []).map(fieldName => {

                const fieldConfig =
                    formEntity.fields?.find(
                        field =>
                            field.name === fieldName
                    );

                if (!fieldConfig) {
                    return null;
                }

                const fieldValue =
                    record?.[fieldName] ?? "";

                const fieldType =
                    fieldConfig.type || "text";


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
                {
                    fieldConfig.label ||
                    fieldName
                }
            </InputLabel>

            <Select
                label={
                    fieldConfig.label ||
                    fieldName
                }

                value={
                    fieldValue ?? ""
                }

                onChange={(event) => {

                    updateField?.(
                        binding,
                        fieldName,
                        event.target.value
                    );

                }}

                disabled={
                    fieldConfig.readonly ||
                    fieldConfig.name === "id"
                }
            >

                {referenceData.map(
                    record => {

                        const value =
                            record[
                                reference.valueField
                            ];

                        const label =
                            record[
                                reference.labelField
                            ];

                        return (
                            <MenuItem
                                key={value}
                                value={value}
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
    
////////////////////////
if (fieldType === "date") {

    return (
        <TextField
            key={fieldName}

            label={
                fieldConfig.label ||
                fieldName
            }

            type="date"

            value={
                fieldValue ?? ""
            }

            onChange={(event) => {

                updateField?.(
                    binding,
                    fieldName,
                    event.target.value
                );

            }}

            fullWidth

            margin="normal"

            InputLabelProps={{
                shrink: true
            }}

            disabled={
                fieldConfig.readonly
            }
        />
    );
}
/////////////////////////////
if (fieldType === "currency") {

    return (
        <TextField
            key={fieldName}

            label={
                fieldConfig.label ||
                fieldName
            }

            type="number"

            value={
                fieldValue ?? ""
            }

            onChange={(event) => {

                updateField?.(
                    binding,
                    fieldName,
                    event.target.value
                );

            }}

            fullWidth

            margin="normal"

            inputProps={{
                min: 0,
                step: "0.01"
            }}

            disabled={
                fieldConfig.readonly
            }
        />
    );
}
////////////////////////

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
                                {fieldConfig.label || fieldName}
                            </InputLabel>

                            <Select
                                label={
                                    fieldConfig.label ||
                                    fieldName
                                }

                                value={
                                    fieldValue ?? ""
                                }

                                onChange={(event) => {

                                    updateField?.(
                                        binding,
                                        fieldName,
                                        event.target.value
                                    );

                                }}

                                disabled={
                                    fieldConfig.readonly ||
                                    fieldConfig.name === "id"
                                }
                            >

                                {(fieldConfig.options || []).map(
                                    (option, index) => {

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
                                                    optionValue ??
                                                    index
                                                }
                                                value={
                                                    optionValue
                                                }
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
                CHECKBOX
                =========================================
                */

                if (fieldType === "checkbox" ||
                    fieldType === "boolean") {

                    return (
                        <FormControlLabel
                            key={fieldName}

                            label={
                                fieldConfig.label ||
                                fieldName
                            }

                            control={
                                <Checkbox
                                    checked={
                                        Boolean(fieldValue)
                                    }

                                    onChange={(event) => {

                                        updateField?.(
                                            binding,
                                            fieldName,
                                            event.target.checked
                                        );

                                    }}

                                    disabled={
                                        fieldConfig.readonly ||
                                        fieldConfig.name === "id"
                                    }
                                />
                            }
                        />
                    );
                }


                /*
                =========================================
                NORMAL TEXT / EMAIL / NUMBER
                =========================================
                */

                return (
                    <TextField
                        key={fieldName}

                        label={
                            fieldConfig.label ||
                            fieldName
                        }

                        value={
                            fieldValue
                        }

                        onChange={(event) => {

                            updateField?.(
                                binding,
                                fieldName,
                                event.target.value
                            );

                        }}

                        fullWidth
                        margin="normal"

                        disabled={
                            fieldConfig.readonly ||
                            fieldConfig.name === "id"
                        }

                        type={
                            fieldType === "email"
                                ? "email"
                                : fieldType === "number"
                                    ? "number"
                                    : "text"
                        }
                    />
                );

            })}

        </Box>
    );
}

    if (type === "entityForm") {

    const entity =
        context?.config?.entities?.[node.entity];

    const record = binding
        ? getValue(context, binding)
        : {};

    const entityFields =
        node.fields || [];
console.log("mycontext:",context);

    return (
       <EntityFormRenderer
    entity={entity}
    record={record}
    fields={entityFields}
    readonly={props.readonly}
    context={context}
    onChange={(fieldName, value) => {

                if (binding === "selectedOrder") {

                    handlers?.updateOrderField?.(
                        fieldName,
                        value
                    );

                } else {

                    handlers?.updateField?.(
                        binding,
                        fieldName,
                        value
                    );

                }

            }}

    onSave={
        events?.onSave
            ? handlers?.[events.onSave]
            : undefined
    }

    onDelete={
        events?.onDelete
            ? handlers?.[events.onDelete]
            : undefined
    }
/>
    );
}

 

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
CHILD TABLE
=====================================================
*/

if (type === "childTable") {

    const childEntity =
        context?.config?.entities?.[node.entity];

    const parentValue =
        node.parentBinding
            ? getValue(
                context,
                node.parentBinding
            )
            : null;

    const childData =
        context?.[
            node.dataSource ||
            node.entity
        ] || [];


    const rowClickHandler =
        node.events?.onClick
            ? handlers?.[
                node.events.onClick
            ]
            : undefined;


    return (
        <ChildTableRenderer
            entity={childEntity}

            data={childData}

            parentValue={parentValue}

            relationship={
                node.relationship
            }

            columns={
                node.columns || []
            }

            onRowClick={
                rowClickHandler
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