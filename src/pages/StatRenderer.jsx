import React from "react";

import {
    Card,
    CardContent,
    Typography
} from "@mui/material";


export default function StatRenderer({
    widget,
    context = {}
}) {

    console.log("STAT RENDERER:", widget);
    console.log("STAT CONTEXT:", context);

    const title = widget.title || "Stat";

    const source = widget.source || {};

    const entity = source.entity;
    const aggregate = source.aggregate || "count";
    const field = source.field;
    const sourceValue = source.value;

    // -----------------------------------------
    // GET DATA FROM CONTEXT
    // -----------------------------------------

    let rows = context[entity] || [];

    // -----------------------------------------
    // APPLY FILTER
    // -----------------------------------------

    const filter = widget.filter;

    if (filter?.field) {

        let filterValue = null;

        // Resolve binding such as:
        // selectedUser.id
        if (filter.binding) {

            const parts = filter.binding.split(".");

            filterValue = context;

            for (const part of parts) {

                if (
                    filterValue === null ||
                    filterValue === undefined
                ) {
                    break;
                }

                filterValue = filterValue[part];
            }
        }

        // Apply filter only when we have a value
        if (
            filterValue !== null &&
            filterValue !== undefined
        ) {

            rows = rows.filter(row =>
                String(row[filter.field]) ===
                String(filterValue)
            );

        }
    }

    // -----------------------------------------
    // APPLY SOURCE VALUE FILTER
    //
    // Example:
    //
    // field: status
    // value: submitted
    //
    // -----------------------------------------

    if (
        field &&
        sourceValue !== undefined &&
        sourceValue !== null
    ) {

        rows = rows.filter(row =>
            String(row[field]) ===
            String(sourceValue)
        );

    }

    // -----------------------------------------
    // CALCULATE VALUE
    // -----------------------------------------

    let value = 0;

    if (aggregate === "count") {

        value = rows.length;

    } else if (aggregate === "sum") {

        value = rows.reduce(
            (total, row) =>
                total + Number(row[field] || 0),
            0
        );

    } else if (aggregate === "avg") {

        if (rows.length > 0) {

            const total = rows.reduce(
                (sum, row) =>
                    sum + Number(row[field] || 0),
                0
            );

            value = total / rows.length;

        } else {

            value = 0;

        }

    } else if (aggregate === "min") {

        if (rows.length > 0) {

            value = Math.min(
                ...rows.map(row =>
                    Number(row[field] || 0)
                )
            );

        }

    } else if (aggregate === "max") {

        if (rows.length > 0) {

            value = Math.max(
                ...rows.map(row =>
                    Number(row[field] || 0)
                )
            );

        }

    }

    // -----------------------------------------
    // FORMAT
    // -----------------------------------------

    if (
        aggregate === "avg" ||
        aggregate === "sum"
    ) {

        value = Number(value).toFixed(2);

    }

    // -----------------------------------------
    // RENDER
    // -----------------------------------------

    return (
        <Card>

            <CardContent>

                <Typography
                    color="text.secondary"
                    gutterBottom
                >
                    {title}
                </Typography>

                <Typography variant="h4">
                    {value}
                </Typography>

            </CardContent>

        </Card>
    );
}