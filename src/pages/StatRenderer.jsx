import React, { useEffect, useState } from "react";

import {
    Card,
    CardContent,
    Typography
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

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

    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!entity || !aggregate) {
            setValue(0);
            return;
        }

        async function loadStat() {

            try {

                setLoading(true);
                setError("");

                const stat = {
                    title,
                    entity,
                    aggregate
                };

                /*
                 * SUM/AVG/MIN/MAX require a field.
                 */
                if (field) {
                    stat.field = field;
                }

                /*
                 * Optional YAML value filter.
                 */
                if (
                    field &&
                    sourceValue !== undefined &&
                    sourceValue !== null
                ) {
                    stat.value = sourceValue;
                }

                /*
                 * Optional widget filter.
                 */
                if (widget.filter) {
                    stat.filter = widget.filter;
                }

                console.log(
                    "STAT API REQUEST:",
                    stat
                );

                const response = await fetch(
                    `${API_URL}/api/stats`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            stats: [stat],
                            selectedCustomerId:
                                context?.selectedRecord?.id ?? null
                        })
                    }
                );

                if (!response.ok) {

                    const errorData =
                        await response.json()
                            .catch(() => null);

                    throw new Error(
                        errorData?.detail ||
                        `Stats request failed: ${response.status}`
                    );
                }

                const result =
                    await response.json();

                console.log(
                    "STAT API RESPONSE:",
                    result
                );

                const statResult =
                    result?.[0];

                setValue(
                    statResult?.value ?? 0
                );

            } catch (err) {

                console.error(
                    "STAT API ERROR:",
                    err
                );

                setError(err.message);
                setValue(0);

            } finally {

                setLoading(false);
            }
        }

        loadStat();

    }, [
        entity,
        aggregate,
        field,
        sourceValue,
        widget.filter,
        context?.selectedRecord?.id,
        title
    ]);

    // -----------------------------------------
    // FORMAT
    // -----------------------------------------

    let displayValue = value;

    if (
        aggregate === "sum" ||
        aggregate === "avg"
    ) {

        displayValue =
            Number(value || 0).toFixed(2);
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

                    {loading
                        ? "..."
                        : displayValue}

                </Typography>

                {error && (
                    <Typography
                        variant="caption"
                        color="error"
                    >
                        {error}
                    </Typography>
                )}

            </CardContent>

        </Card>
    );
}