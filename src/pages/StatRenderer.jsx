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

    // -----------------------------------------
    // GET DATA FROM CONTEXT
    // -----------------------------------------

    const rows = context[entity] || [];

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

    if (aggregate === "avg") {
        value = Number(value).toFixed(2);
    }

    if (aggregate === "sum") {
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