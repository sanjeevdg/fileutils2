import React from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Checkbox
} from "@mui/material";

export default function PropertyPanel({
    widget,
    onChange,
    onDelete,
    entityMetadata = {}
}) {

    if (!widget) {
        return (
            <Box
                sx={{
                    p: 2,
                    borderLeft: "1px solid #ddd",
                    height: "100%"
                }}
            >
                <Typography variant="h6">
                    Properties
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                >
                    Select a widget on the canvas.
                </Typography>
            </Box>
        );
    }

    const source = widget.source || {};
    const chart = widget.chart || {};

const availableEntities =
    Object.keys(entityMetadata);


const defaultEntity =
    availableEntities[0] || "";

const widgetProps =
    widget.props || {};

const availableEntityFields =
    entityMetadata[widgetProps.entity || defaultEntity] || [];


const tableFields =
    entityMetadata[source.entity] || [];


const chartEntity =
    chart.entity || availableEntities[0] || "";


const availableFields =
    entityMetadata[chartEntity] || [];


const layout = widget.layout || {
    xs: 12,
    md: 6
};

const updateLayout = (property, value) => {
    onChange("layout", {
        ...layout,
        [property]: Number(value)
    });
};





    /*
     * STAT-specific values
     */

  //  const source = widget.source || {};

    const updateSource = (property, value) => {
        onChange("source", {
            ...source,
            [property]: value
        });
    };

  //  const chart = widget.chart || {};

    const updateChart = (property, value) => {
        onChange("chart", {
            ...chart,
            [property]: value
        });
    };

//console.log("DESIGNER CONFIG:", designerConfig);
console.log("ENTITY METADATA:", entityMetadata);
//console.log("DESIGNER SELECTED RECORD:", selectedRecord);

//console.log("PROPERTY PANEL WIDGET:", selectedWidget);
console.log("PROPERTY PANEL ENTITY METADATA:", entityMetadata);
console.log(
    "PROPERTY PANEL ENTITY NAMES:",
    Object.keys(entityMetadata || {})
);

    return (
        <Box
            sx={{
                p: 2,
                borderLeft: "1px solid #ddd",
                height: "100%",
                overflow: "auto"
            }}
        >

            <Typography variant="h6" gutterBottom>
                Properties
            </Typography>


            {/* TYPE */}

            <Typography
                variant="caption"
                color="text.secondary"
            >
                Type
            </Typography>

            <Typography sx={{ mb: 2 }}>
                {widget.type}
            </Typography>


            {/* TITLE */}

            <TextField
                label="Title"
                value={widget.title || ""}
                fullWidth
                size="small"
                onChange={(e) =>
                    onChange("title", e.target.value)
                }
                sx={{ mb: 2 }}
            />


            {/* ID */}

            <TextField
                label="ID"
                value={widget.id || ""}
                fullWidth
                size="small"
                disabled
                sx={{ mb: 3 }}
            />

            {/* -------------------------------- */}
            {/* TYPOGRAPHY PROPERTIES */}
            {/* -------------------------------- */}

            {widget.type === "typography" && (
                <>
                    <Typography
                        variant="subtitle2"
                        sx={{ mb: 1 }}
                    >
                        Typography Properties
                    </Typography>

                    {/* TEXT */}

                    <TextField
                        label="Text"
                        value={widget.text || ""}
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                        onChange={(e) =>
                            onChange("text", e.target.value)
                        }
                        sx={{ mb: 2 }}
                    />

                    {/* VARIANT */}

                    <TextField
                        select
                        label="Variant"
                        value={widget.props?.variant || "body1"}
                        fullWidth
                        size="small"
                        onChange={(e) =>
                            onChange("props", {
                                ...(widget.props || {}),
                                variant: e.target.value
                            })
                        }
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="h1">h1</MenuItem>
                        <MenuItem value="h2">h2</MenuItem>
                        <MenuItem value="h3">h3</MenuItem>
                        <MenuItem value="h4">h4</MenuItem>
                        <MenuItem value="h5">h5</MenuItem>
                        <MenuItem value="h6">h6</MenuItem>
                        <MenuItem value="subtitle1">subtitle1</MenuItem>
                        <MenuItem value="subtitle2">subtitle2</MenuItem>
                        <MenuItem value="body1">body1</MenuItem>
                        <MenuItem value="body2">body2</MenuItem>
                        <MenuItem value="caption">caption</MenuItem>
                    </TextField>

                    {/* ALIGNMENT */}

                    <TextField
                        select
                        label="Alignment"
                        value={widget.props?.align || "left"}
                        fullWidth
                        size="small"
                        onChange={(e) =>
                            onChange("props", {
                                ...(widget.props || {}),
                                align: e.target.value
                            })
                        }
                        sx={{ mb: 3 }}
                    >
                        <MenuItem value="left">Left</MenuItem>
                        <MenuItem value="center">Center</MenuItem>
                        <MenuItem value="right">Right</MenuItem>
                    </TextField>
                </>
            )}


            {/* -------------------------------- */}
            {/* BUTTON PROPERTIES */}
            {/* -------------------------------- */}

            {widget.type === "button" && (
                <>
                    <Typography
                        variant="subtitle2"
                        sx={{ mb: 1 }}
                    >
                        Button Properties
                    </Typography>

                    {/* TEXT */}

                    <TextField
                        label="Text"
                        value={widget.text || ""}
                        fullWidth
                        size="small"
                        onChange={(e) =>
                            onChange("text", e.target.value)
                        }
                        sx={{ mb: 2 }}
                    />

                    {/* VARIANT */}

                    <TextField
                        select
                        label="Variant"
                        value={widget.props?.variant || "contained"}
                        fullWidth
                        size="small"
                        onChange={(e) =>
                            onChange("props", {
                                ...(widget.props || {}),
                                variant: e.target.value
                            })
                        }
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="contained">
                            contained
                        </MenuItem>

                        <MenuItem value="outlined">
                            outlined
                        </MenuItem>

                        <MenuItem value="text">
                            text
                        </MenuItem>
                    </TextField>

                    {/* SIZE */}

                    <TextField
                        select
                        label="Size"
                        value={widget.props?.size || "medium"}
                        fullWidth
                        size="small"
                        onChange={(e) =>
                            onChange("props", {
                                ...(widget.props || {}),
                                size: e.target.value
                            })
                        }
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="small">
                            small
                        </MenuItem>

                        <MenuItem value="medium">
                            medium
                        </MenuItem>

                        <MenuItem value="large">
                            large
                        </MenuItem>
                    </TextField>

                    {/* FULL WIDTH */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 3
                        }}
                    >
                        <Checkbox
                            checked={widget.props?.fullWidth || false}
                            onChange={(e) =>
                                onChange("props", {
                                    ...(widget.props || {}),
                                    fullWidth: e.target.checked
                                })
                            }
                        />

                        <Typography variant="body2">
                            Full Width
                        </Typography>
                    </Box>



                    {/* ACTION */}

                    <TextField
                        select
                        label="Action"
                        value={widget.events?.onClick || ""}
                        fullWidth
                        size="small"
                        onChange={(e) =>
                            onChange("events", {
                                ...(widget.events || {}),
                                onClick: e.target.value
                            })
                        }
                        sx={{ mb: 3 }}
                    >
                        <MenuItem value="">
                            None
                        </MenuItem>

                        <MenuItem value="save">
                            Save
                        </MenuItem>

                        <MenuItem value="new">
                            New
                        </MenuItem>

                        <MenuItem value="edit">
                            Edit
                        </MenuItem>

                        <MenuItem value="delete">
                            Delete
                        </MenuItem>
                    </TextField>

                    {/* SUCCESS MESSAGE */}

                    <TextField
                        label="Success Message"
                        value={widget.feedback?.success || ""}
                        fullWidth
                        size="small"
                        onChange={(e) =>
                            onChange("feedback", {
                                ...(widget.feedback || {}),
                                success: e.target.value
                            })
                        }
                        sx={{ mb: 2 }}
                    />
                    {/* ERROR MESSAGE */}

                    <TextField
                        label="Error Message"
                        value={widget.feedback?.error || ""}
                        fullWidth
                        size="small"
                        onChange={(e) =>
                            onChange("feedback", {
                                ...(widget.feedback || {}),
                                error: e.target.value
                            })
                        }
                        sx={{ mb: 2 }}
                    />
                </>
            )}












            {/* -------------------------------- */}
            {/* STAT PROPERTIES */}
            {/* -------------------------------- */}

          {widget.type === "stat" && (

    <>

        <Typography
            variant="subtitle2"
            sx={{ mb: 1 }}
        >
            Data Source
        </Typography>

        {/* ENTITY */}

        <TextField
            select
            label="Entity"
            value={source.entity || ""}
            fullWidth
            size="small"
            onChange={(e) => {

                const entity = e.target.value;

                    onChange("source", {
                        ...source,
                        entity,
                        field: ""
                    });

            }}
            sx={{ mb: 2 }}
        >

            {availableEntities.map((entity) => (

                <MenuItem
                    key={entity}
                    value={entity}
                >
                    {entity}
                </MenuItem>

            ))}

        </TextField>


        {/* AGGREGATE */}

        <TextField
            select
            label="Aggregate"
            value={source.aggregate || "count"}
            fullWidth
            size="small"
            onChange={(e) => {

                const aggregate = e.target.value;

                 onChange("source", {
                    ...source,
                    aggregate,
                    field: aggregate === "count"
                        ? ""
                        : source.field || ""
                });

            }}
            sx={{ mb: 2 }}
        >

            <MenuItem value="count">
                count
            </MenuItem>

            <MenuItem value="sum">
                sum
            </MenuItem>

            <MenuItem value="avg">
                average
            </MenuItem>

            <MenuItem value="min">
                minimum
            </MenuItem>

            <MenuItem value="max">
                maximum
            </MenuItem>

        </TextField>


        {/* FIELD */}

        {source.aggregate !== "count" && (

            <TextField
                select
                label="Field"
                value={source.field || ""}
                fullWidth
                size="small"
                onChange={(e) =>
                    updateSource(
                        "field",
                        e.target.value
                    )
                }
                sx={{ mb: 3 }}
            >

                {(
                    entityMetadata?.[source.entity] || []
                ).map((field) => (

                    <MenuItem
                        key={field.name}
                        value={field.name}
                    >
                        {field.label || field.name}
                    </MenuItem>

                ))}

            </TextField>

        )}

    </>
)}

        {widget.type === "chart" && (
            <>
                <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, mb: 1 }}
                >
                    Chart Properties
                </Typography>

                {/* Entity */}
                <TextField
                    select
                    fullWidth
                    label="Entity"
                    value={chart.entity || "orders"}
                    onChange={(e) =>
                        updateChart(
                            "entity",
                            e.target.value
                        )
                    }
                    sx={{ mb: 2 }}
                >
                    {availableEntities.map((entity) => (
                        <MenuItem
                            key={entity}
                            value={entity}
                        >
                            {entity}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Chart Type */}
                <TextField
                    select
                    fullWidth
                    label="Chart Type"
                    value={chart.type || "bar"}
                    onChange={(e) =>
                        updateChart(
                            "type",
                            e.target.value
                        )
                    }
                    sx={{ mb: 2 }}
                >
                    <MenuItem value="bar">
                        Bar
                    </MenuItem>

                    <MenuItem value="line">
                        Line
                    </MenuItem>
                </TextField>

                {/* X Axis */}
                <TextField
                    select
                    fullWidth
                    label="X Axis"
                    value={chart.x || availableFields[0] || ""}
                    onChange={(e) =>
                        updateChart("x", e.target.value)
                    }
                    sx={{ mb: 2 }}
                >
                    {availableFields.map((field) => (
                        <MenuItem
                            key={field.name}
                            value={field.name}
                        >
                            {field.label}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Y Axis */}
                <TextField
                    select
                    fullWidth
                    label="Y Axis"
                    value={chart.y || availableFields[0] || ""}
                    onChange={(e) =>
                        updateChart("y", e.target.value)
                    }
                >
                    {availableFields.map((field) => (
                        <MenuItem
                            key={field.name}
                            value={field.name}
                        >
                            {field.label}
                        </MenuItem>
                    ))}
                </TextField>
            </>
        )}


        {widget.type === "table" && (
            <>
                <Typography
                    variant="subtitle1"
                    sx={{
                        mt: 3,
                        mb: 1
                    }}
                >
                    Table Properties
                </Typography>

                {/* Entity */}

                <TextField
                    select
                    fullWidth
                    label="Entity"
                    value={source.entity || "orders"}
                    onChange={(e) => {

                        const entity =
                            e.target.value;

                        const defaultColumns =
                            entity === "customers"
                                ? [
                                    {
                                        field: "id",
                                        label: "Customer ID",
                                        format: "number"
                                    },
                                    {
                                        field: "first_name",
                                        label: "First Name",
                                        format: "none"
                                    },
                                    {
                                        field: "age",
                                        label: "Age",
                                        format: "number"
                                    }
                                ]
                                : [
                                    {
                                        field: "id",
                                        label: "Order ID",
                                        format: "number"
                                    },
                                    {
                                        field: "order_date",
                                        label: "Order Date",
                                        format: "date"
                                    },
                                    {
                                        field: "amount",
                                        label: "Amount",
                                        format: "currency"
                                    }
                                ];

                        onChange("source", {
                            ...source,
                            entity,
                            columns: defaultColumns
                        });

                    }}
                    sx={{ mb: 2 }}
                >
                    {availableEntities.map((entity) => (
                        <MenuItem
                            key={entity}
                            value={entity}
                        >
                            {entity}
                        </MenuItem>
                    ))}
                </TextField>


                {/* Columns */}

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                >
                    Columns
                </Typography>

                {tableFields.map((field) => {

                    const column =
                        (source.columns || []).find(
                            item =>
                                typeof item === "string"
                                    ? item === field.name
                                    : item.field === field.name
                        );

                    const checked = Boolean(column);

                    return (
                        <Box
                            key={field.name}
                            sx={{
                                mb: 1
                            }}
                        >

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center"
                                }}
                            >

                                <Checkbox
                                    checked={checked}
                                    onChange={(e) => {

                                        const currentColumns =
                                            source.columns || [];

                                        let newColumns;

                                        if (e.target.checked) {

                                            newColumns = [
                                                ...currentColumns,
                                                {
                                                    field: field.name,
                                                    label: field.label
                                                }
                                            ];

                                        } else {

                                            newColumns =
                                                currentColumns.filter(
                                                    item =>
                                                        typeof item === "string"
                                                            ? item !== field.name
                                                            : item.field !== field.name
                                                );
                                        }

                                        onChange("source", {
                                            ...source,
                                            columns: newColumns
                                        });

                                    }}
                                />

                                <Typography>
                                    {field.label}
                                </Typography>

                            </Box>


                            {checked && (
                                <>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Column Label"
                                    value={
                                        typeof column === "string"
                                            ? column
                                            : column.label || field
                                    }
                                    onChange={(e) => {

                                        const newColumns =
                                            (source.columns || []).map(
                                                item => {

                                                    if (
                                                        typeof item === "string"
                                                    ) {
                                                        if (item === field) {
                                                            return {
                                                                field,
                                                                label:
                                                                    e.target.value
                                                            };
                                                        }

                                                        return item;
                                                    }

                                                    if (
                                                        item.field === field
                                                    ) {
                                                        return {
                                                            ...item,
                                                            label:
                                                                e.target.value
                                                        };
                                                    }

                                                    return item;
                                                }
                                            );

                                        onChange("source", {
                                            ...source,
                                            columns: newColumns
                                        });

                                    }}
                                    sx={{
                                        ml: 6,
                                        mb: 1
                                    }}
                                />

                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    label="Format"
                                    value={
                                        typeof column === "string"
                                            ? "none"
                                            : column.format || "none"
                                    }
                                    onChange={(e) => {

                                        const newColumns =
                                            (source.columns || []).map(
                                                item => {

                                                    if (
                                                        typeof item === "string"
                                                    ) {
                                                        if (item === field) {
                                                            return {
                                                                field,
                                                                label: item,
                                                                format:
                                                                    e.target.value
                                                            };
                                                        }

                                                        return item;
                                                    }

                                                    if (
                                                        item.field === field
                                                    ) {
                                                        return {
                                                            ...item,
                                                            format:
                                                                e.target.value
                                                        };
                                                    }

                                                    return item;
                                                }
                                            );

                                        onChange("source", {
                                            ...source,
                                            columns: newColumns
                                        });

                                    }}
                                    sx={{
                                        ml: 6,
                                        mb: 1
                                    }}
                                >
                                    <MenuItem value="none">
                                        None
                                    </MenuItem>

                                    <MenuItem value="number">
                                        Number
                                    </MenuItem>

                                    <MenuItem value="currency">
                                        Currency
                                    </MenuItem>

                                    <MenuItem value="date">
                                        Date
                                    </MenuItem>
                                </TextField>    

                                  </>

                            )}

                        </Box>
                    );
                })}


                {/* Rows */}

                <TextField
                    select
                    fullWidth
                    label="Rows"
                    value={source.limit || 10}
                    onChange={(e) =>
                        updateSource(
                            "limit",
                            Number(e.target.value)
                        )
                    }
                    sx={{ mt: 2 }}
                >
                    <MenuItem value={5}>
                        5
                    </MenuItem>

                    <MenuItem value={10}>
                        10
                    </MenuItem>

                    <MenuItem value={25}>
                        25
                    </MenuItem>

                    <MenuItem value={50}>
                        50
                    </MenuItem>
                </TextField>
            </>
        )}





            {widget.type === "datagrid" && (
                            <>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        mt: 3,
                                        mb: 1
                                    }}
                                >
                                    Data Grid Properties
                                </Typography>

                                {/* Entity */}

                                <TextField
                                    select
                                    fullWidth
                                    label="Entity"
                                    value={source.entity || ""}
                                    onChange={(e) => {

                                        const entity = e.target.value;

                                        const fields =
                                            entityMetadata[entity] || [];

                                        const defaultColumns =
                                            fields.map(field => ({
                                                field: field.name,
                                                label:
                                                    field.label ||
                                                    field.name
                                            }));

                                        onChange("source", {
                                            ...source,
                                            entity,
                                            columns: defaultColumns
                                        });

                                    }}
                                    sx={{ mb: 2 }}
                                >
                                    {availableEntities.map((entity) => (
                                        <MenuItem
                                            key={entity}
                                            value={entity}
                                        >
                                            {entity}
                                        </MenuItem>
                                    ))}
                                </TextField>


                                {/* Columns */}

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1 }}
                                >
                                    Columns
                                </Typography>

                                {tableFields.map((field) => {

                                    const column =
                                        (source.columns || []).find(
                                            item =>
                                                typeof item === "string"
                                                    ? item === field.name
                                                    : item.field === field.name
                                        );

                                    const checked = Boolean(column);

                                    return (
                                        <Box
                                            key={field.name}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mb: 1
                                            }}
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onChange={(e) => {

                                                    const currentColumns =
                                                        source.columns || [];

                                                    let newColumns;

                                                    if (e.target.checked) {

                                                        newColumns = [
                                                            ...currentColumns,
                                                            {
                                                                field: field.name,
                                                                label:
                                                                    field.label ||
                                                                    field.name
                                                            }
                                                        ];

                                                    } else {

                                                        newColumns =
                                                            currentColumns.filter(
                                                                item =>
                                                                    typeof item === "string"
                                                                        ? item !== field.name
                                                                        : item.field !== field.name
                                                            );
                                                    }

                                                    onChange("source", {
                                                        ...source,
                                                        columns: newColumns
                                                    });

                                                }}
                                            />

                                            <Typography>
                                                {field.label || field.name}
                                            </Typography>

                                        </Box>
                                    );
                                })}


                                {/* Page Size */}

                                <TextField
                                    select
                                    fullWidth
                                    label="Page Size"
                                    value={source.pageSize || 10}
                                    onChange={(e) =>
                                        updateSource(
                                            "pageSize",
                                            Number(e.target.value)
                                        )
                                    }
                                    sx={{ mt: 2, mb: 2 }}
                                >
                                    <MenuItem value={5}>
                                        5
                                    </MenuItem>

                                    <MenuItem value={10}>
                                        10
                                    </MenuItem>

                                    <MenuItem value={25}>
                                        25
                                    </MenuItem>

                                    <MenuItem value={50}>
                                        50
                                    </MenuItem>
                                </TextField>


                                {/* Checkbox Selection */}

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                >
                                    <Checkbox
                                        checked={source.checkboxSelection || false}
                                        onChange={(e) =>
                                            updateSource(
                                                "checkboxSelection",
                                                e.target.checked
                                            )
                                        }
                                    />

                                    <Typography>
                                        Checkbox Selection
                                    </Typography>
                                </Box>

                            </>
                        )}




            {widget.type === "textfield" && (
                    <>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                mt: 3,
                                mb: 1
                            }}
                        >
                            Text Field Properties
                        </Typography>


                        <TextField
                            fullWidth
                            label="Label"
                            value={
                                widget.props?.label || ""
                            }
                            onChange={(e) =>
                                onChange("props", {
                                    ...(widget.props || {}),
                                    label: e.target.value
                                })
                            }
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            select
                            label="Field"
                            value={widget.props?.field || ""}
                            fullWidth
                            size="small"
                            onChange={(e) =>
                                onChange("props", {
                                    ...(widget.props || {}),
                                    field: e.target.value
                                })
                            }
                            sx={{ mb: 2 }}
                        >
                            {availableEntityFields.map((field) => (
                                <MenuItem
                                    key={field.name}
                                    value={field.name}
                                >
                                    {field.label || field.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Placeholder"
                            value={
                                widget.props?.placeholder || ""
                            }
                            onChange={(e) =>
                                onChange("props", {
                                    ...(widget.props || {}),
                                    placeholder: e.target.value
                                })
                            }
                            sx={{ mb: 2 }}
                        />


                        <TextField
                            fullWidth
                            label="Default Value"
                            value={
                                widget.props?.defaultValue || ""
                            }
                            onChange={(e) =>
                                onChange("props", {
                                    ...(widget.props || {}),
                                    defaultValue: e.target.value
                                })
                            }
                            sx={{ mb: 2 }}
                        />


                        <TextField
                            select
                            fullWidth
                            label="Variant"
                            value={
                                widget.props?.variant ||
                                "outlined"
                            }
                            onChange={(e) =>
                                onChange("props", {
                                    ...(widget.props || {}),
                                    variant: e.target.value
                                })
                            }
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="outlined">
                                Outlined
                            </MenuItem>

                            <MenuItem value="filled">
                                Filled
                            </MenuItem>

                            <MenuItem value="standard">
                                Standard
                            </MenuItem>
                        </TextField>


                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1
                            }}
                        >
                            <Checkbox
                                checked={
                                    widget.props?.required ||
                                    false
                                }
                                onChange={(e) =>
                                    onChange("props", {
                                        ...(widget.props || {}),
                                        required:
                                            e.target.checked
                                    })
                                }
                            />

                            <Typography>
                                Required
                            </Typography>
                        </Box>


                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1
                            }}
                        >
                            <Checkbox
                                checked={
                                    widget.props?.multiline ||
                                    false
                                }
                                onChange={(e) =>
                                    onChange("props", {
                                        ...(widget.props || {}),
                                        multiline:
                                            e.target.checked
                                    })
                                }
                            />

                            <Typography>
                                Multiline
                            </Typography>
                        </Box>


                        {widget.props?.multiline && (
                            <TextField
                                select
                                fullWidth
                                label="Rows"
                                value={
                                    widget.props?.rows || 3
                                }
                                onChange={(e) =>
                                    onChange("props", {
                                        ...(widget.props || {}),
                                        rows: Number(
                                            e.target.value
                                        )
                                    })
                                }
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value={2}>
                                    2
                                </MenuItem>

                                <MenuItem value={3}>
                                    3
                                </MenuItem>

                                <MenuItem value={4}>
                                    4
                                </MenuItem>

                                <MenuItem value={5}>
                                    5
                                </MenuItem>
                            </TextField>
                        )}
                    </>
                )}








                {widget.type === "select" && (
                    <>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                mt: 3,
                                mb: 1
                            }}
                        >
                            Select Properties
                        </Typography>

                        <TextField
                            select
                            label="Field"
                            value={widget.props?.field || ""}
                            fullWidth
                            size="small"
                            onChange={(e) =>
                                onChange("props", {
                                    ...(widget.props || {}),
                                    field: e.target.value
                                })
                            }
                            sx={{ mb: 2 }}
                        >
                            {availableEntityFields.map((field) => (
                                <MenuItem
                                    key={field.name}
                                    value={field.name}
                                >
                                    {field.label || field.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Label"
                            value={
                                widget.props?.label || ""
                            }
                            onChange={(e) =>
                                onChange("props", {
                                    ...(widget.props || {}),
                                    label: e.target.value
                                })
                            }
                            sx={{ mb: 2 }}
                        />


                        <TextField
                            fullWidth
                            label="Default Value"
                            value={
                                widget.props?.defaultValue || ""
                            }
                            onChange={(e) =>
                                onChange("props", {
                                    ...(widget.props || {}),
                                    defaultValue:
                                        e.target.value
                                })
                            }
                            sx={{ mb: 2 }}
                        />


                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            Options
                        </Typography>


                        {(widget.props?.options || []).map(
                            (option, index) => {

                                const optionValue =
                                    typeof option === "string"
                                        ? option
                                        : option.value;

                                const optionLabel =
                                    typeof option === "string"
                                        ? option
                                        : option.label ||
                                          option.value;

                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            gap: 1,
                                            mb: 1
                                        }}
                                    >

                                        <TextField
                                            size="small"
                                            label="Value"
                                            value={
                                                optionValue || ""
                                            }
                                            onChange={(e) => {

                                                const options = [
                                                    ...(widget.props?.options || [])
                                                ];

                                                options[index] = {
                                                    value:
                                                        e.target.value,
                                                    label:
                                                        optionLabel
                                                };

                                                onChange("props", {
                                                    ...(widget.props || {}),
                                                    options
                                                });

                                            }}
                                            sx={{
                                                flex: 1
                                            }}
                                        />


                                        <TextField
                                            size="small"
                                            label="Label"
                                            value={
                                                optionLabel || ""
                                            }
                                            onChange={(e) => {

                                                const options = [
                                                    ...(widget.props?.options || [])
                                                ];

                                                options[index] = {
                                                    value:
                                                        optionValue,
                                                    label:
                                                        e.target.value
                                                };

                                                onChange("props", {
                                                    ...(widget.props || {}),
                                                    options
                                                });

                                            }}
                                            sx={{
                                                flex: 1
                                            }}
                                        />


                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => {

                                                const options = [
                                                    ...(widget.props?.options || [])
                                                ];

                                                options.splice(
                                                    index,
                                                    1
                                                );

                                                onChange("props", {
                                                    ...(widget.props || {}),
                                                    options
                                                });

                                            }}
                                        >
                                            ×
                                        </Button>

                                    </Box>
                                );

                            }
                        )}


                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 1 }}
                            onClick={() => {

                                const options = [
                                    ...(widget.props?.options || [])
                                ];

                                options.push({
                                    value: "",
                                    label: ""
                                });

                                onChange("props", {
                                    ...(widget.props || {}),
                                    options
                                });

                            }}
                        >
                            + Add Option
                        </Button>

                    </>
                )}







                {widget.type === "checkbox" && (
                        <>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    mt: 3,
                                    mb: 1
                                }}
                            >
                                Checkbox Properties
                            </Typography>

                            <TextField
                                select
                                label="Field"
                                value={widget.props?.field || ""}
                                fullWidth
                                size="small"
                                onChange={(e) =>
                                    onChange("props", {
                                        ...(widget.props || {}),
                                        field: e.target.value
                                    })
                                }
                                sx={{ mb: 2 }}
                            >
                                {availableEntityFields.map((field) => (
                                    <MenuItem
                                        key={field.name}
                                        value={field.name}
                                    >
                                        {field.label || field.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                label="Label"
                                value={
                                    widget.props?.label || ""
                                }
                                onChange={(e) =>
                                    onChange("props", {
                                        ...(widget.props || {}),
                                        label: e.target.value
                                    })
                                }
                                sx={{ mb: 2 }}
                            />


                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 1
                                }}
                            >

                                <Checkbox
                                    checked={
                                        widget.props?.defaultChecked ||
                                        false
                                    }

                                    onChange={(e) =>
                                        onChange("props", {
                                            ...(widget.props || {}),
                                            defaultChecked:
                                                e.target.checked
                                        })
                                    }
                                />

                                <Typography>
                                    Default Checked
                                </Typography>

                            </Box>


                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 1
                                }}
                            >

                                <Checkbox
                                    checked={
                                        widget.props?.required ||
                                        false
                                    }

                                    onChange={(e) =>
                                        onChange("props", {
                                            ...(widget.props || {}),
                                            required:
                                                e.target.checked
                                        })
                                    }
                                />

                                <Typography>
                                    Required
                                </Typography>

                            </Box>

                        </>
                    )}






                    {widget.type === "radio" && (
                        <>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    mt: 3,
                                    mb: 1
                                }}
                            >
                                Radio Properties
                            </Typography>


                            <TextField
                                fullWidth
                                label="Label"
                                value={
                                    widget.props?.label || ""
                                }
                                onChange={(e) =>
                                    onChange("props", {
                                        ...(widget.props || {}),
                                        label: e.target.value
                                    })
                                }
                                sx={{ mb: 2 }}
                            />


                            <TextField
                                select
                                fullWidth
                                label="Orientation"
                                value={
                                    widget.props?.orientation ||
                                    "column"
                                }
                                onChange={(e) =>
                                    onChange("props", {
                                        ...(widget.props || {}),
                                        orientation:
                                            e.target.value
                                    })
                                }
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="column">
                                    Vertical
                                </MenuItem>

                                <MenuItem value="row">
                                    Horizontal
                                </MenuItem>
                            </TextField>


                            <TextField
                                fullWidth
                                label="Default Value"
                                value={
                                    widget.props?.defaultValue || ""
                                }
                                onChange={(e) =>
                                    onChange("props", {
                                        ...(widget.props || {}),
                                        defaultValue:
                                            e.target.value
                                    })
                                }
                                sx={{ mb: 2 }}
                            />


                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                Options
                            </Typography>


                            {(widget.props?.options || []).map(
                                (option, index) => {

                                    const optionValue =
                                        typeof option === "string"
                                            ? option
                                            : option.value;

                                    const optionLabel =
                                        typeof option === "string"
                                            ? option
                                            : option.label ||
                                              option.value;

                                    return (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                mb: 1
                                            }}
                                        >

                                            <TextField
                                                size="small"
                                                label="Value"
                                                value={
                                                    optionValue || ""
                                                }
                                                onChange={(e) => {

                                                    const options = [
                                                        ...(widget.props?.options || [])
                                                    ];

                                                    options[index] = {
                                                        value:
                                                            e.target.value,
                                                        label:
                                                            optionLabel
                                                    };

                                                    onChange("props", {
                                                        ...(widget.props || {}),
                                                        options
                                                    });

                                                }}
                                                sx={{
                                                    flex: 1
                                                }}
                                            />


                                            <TextField
                                                size="small"
                                                label="Label"
                                                value={
                                                    optionLabel || ""
                                                }
                                                onChange={(e) => {

                                                    const options = [
                                                        ...(widget.props?.options || [])
                                                    ];

                                                    options[index] = {
                                                        value:
                                                            optionValue,
                                                        label:
                                                            e.target.value
                                                    };

                                                    onChange("props", {
                                                        ...(widget.props || {}),
                                                        options
                                                    });

                                                }}
                                                sx={{
                                                    flex: 1
                                                }}
                                            />


                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => {

                                                    const options = [
                                                        ...(widget.props?.options || [])
                                                    ];

                                                    options.splice(
                                                        index,
                                                        1
                                                    );

                                                    onChange("props", {
                                                        ...(widget.props || {}),
                                                        options
                                                    });

                                                }}
                                            >
                                                ×
                                            </Button>

                                        </Box>
                                    );

                                }
                            )}


                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 1 }}
                                onClick={() => {

                                    const options = [
                                        ...(widget.props?.options || [])
                                    ];

                                    options.push({
                                        value: "",
                                        label: ""
                                    });

                                    onChange("props", {
                                        ...(widget.props || {}),
                                        options
                                    });

                                }}
                            >
                                + Add Option
                            </Button>

                        </>
                    )}












            {widget.type === "detail" && (
                <>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mt: 3,
                            mb: 1
                        }}
                    >
                        Detail Properties
                    </Typography>

                    {/* Entity */}

                    <TextField
                        select
                        fullWidth
                        label="Entity"
                        value={source.entity || ""}
                        onChange={(e) => {

                            const entity = e.target.value;

                            const fields =
                                entityMetadata[entity] || [];

                            const defaultFields =
                                fields
                                    .slice(0, 4)
                                    .map(field => ({
                                        field: field.name,
                                        label:
                                            field.label ||
                                            field.name
                                    }));

                            onChange("source", {
                                ...source,
                                entity,
                                binding: "selectedRecord"
                            });

                            onChange(
                                "fields",
                                defaultFields
                            );

                        }}
                        sx={{ mb: 2 }}
                    >
                        {availableEntities.map((entity) => (
                            <MenuItem
                                key={entity}
                                value={entity}
                            >
                                {entity}
                            </MenuItem>
                        ))}
                    </TextField>


                    {/* Fields */}

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                    >
                        Fields
                    </Typography>

                    {(entityMetadata[source.entity] || []).map(
                        (field) => {

                            const selectedFields =
                                widget.fields || [];

                            const checked =
                                selectedFields.some(
                                    item =>
                                        typeof item === "string"
                                            ? item === field.name
                                            : item.field === field.name
                                );

                            return (
                                <Box
                                    key={field.name}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1
                                    }}
                                >

                                    <Checkbox
                                        checked={checked}
                                        onChange={(e) => {

                                            let newFields;

                                            if (e.target.checked) {

                                                newFields = [
                                                    ...selectedFields,
                                                    {
                                                        field:
                                                            field.name,
                                                        label:
                                                            field.label ||
                                                            field.name
                                                    }
                                                ];

                                            } else {

                                                newFields =
                                                    selectedFields.filter(
                                                        item =>
                                                            typeof item === "string"
                                                                ? item !== field.name
                                                                : item.field !== field.name
                                                    );
                                            }

                                            onChange(
                                                "fields",
                                                newFields
                                            );

                                        }}
                                    />

                                    <Typography>
                                        {field.label}
                                    </Typography>

                                </Box>
                            );
                        }
                    )}
                </>
            )}






            {/* Layout */}
            <Typography
                variant="subtitle1"
                sx={{ mt: 3, mb: 1 }}
            >
                Layout
            </Typography>

            <TextField
                select
                fullWidth
                label="Width"
                value={layout.md || 12}
                onChange={(e) =>
                    updateLayout("md", e.target.value)
                }
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(
                    (columns) => (
                        <MenuItem
                            key={columns}
                            value={columns}
                        >
                            {columns} columns
                        </MenuItem>
                    )
                )}
            </TextField>

            {/* DELETE */}

            <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={onDelete}
            >
                Delete Widget
            </Button>

        </Box>
    );
}