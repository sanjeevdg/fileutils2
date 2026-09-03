import React from "react";

import {
    Paper,
    Typography,
    Box
} from "@mui/material";


export default function DetailRenderer({
    widget,
    context = {}
}) {

    console.log("DETAIL RENDERER:", widget);
    console.log("DETAIL CONTEXT:", context);

    const title = widget.title || "Details";

    const source = widget.source || {};

    // -----------------------------------------
    // GET SELECTED RECORD
    // -----------------------------------------

    let record = null;

    if (source.binding) {

        const parts = source.binding.split(".");

        record = context;

        for (const part of parts) {

            if (
                record === null ||
                record === undefined
            ) {
                break;
            }

            record = record[part];
        }
    }

    // -----------------------------------------
    // NO RECORD SELECTED
    // -----------------------------------------

    if (!record) {

        return (
            <Paper
                elevation={2}
                sx={{
                    p: 3
                }}
            >

                <Typography
                    variant="h6"
                    gutterBottom
                >
                    {title}
                </Typography>

                <Typography color="text.secondary">
                    Select a customer
                </Typography>

            </Paper>
        );
    }

    // -----------------------------------------
    // RENDER FIELDS
    // -----------------------------------------

    const fields = widget.fields || [];

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3
            }}
        >

            <Typography
                variant="h6"
                gutterBottom
            >
                {title}
            </Typography>

            {fields.map((field, index) => (

                <Box
                    key={field.field || index}
                    sx={{
                        mb: 1
                    }}
                >

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {field.label || field.field}
                    </Typography>

                    <Typography>
                        {record[field.field] ?? ""}
                    </Typography>

                </Box>

            ))}

        </Paper>
    );
}