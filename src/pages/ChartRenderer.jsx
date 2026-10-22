
import React, { useEffect, useState } from "react";

import {
    Box,
    Paper,
    Typography
} from "@mui/material";

import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";


export default function ChartRenderer({
    chart,
    context = {},
    widget = {}
}) {

    const [data, setData] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!chart?.entity || !chart?.x || !chart?.y) {
            setData([]);
            return;
        }

        const loadChart = async () => {

            try {

                setError("");

                const params = new URLSearchParams({
                    entity: chart.entity,
                    x: chart.x,
                    y: chart.y
                });

                const filter = widget.filter;

                if (filter?.field && filter?.binding) {

                    const parts = filter.binding.split(".");
                    let filterValue = context;

                    for (const part of parts) {
                        if (
                            filterValue === null ||
                            filterValue === undefined
                        ) {
                            break;
                        }

                        filterValue = filterValue[part];
                    }

                    if (
                        filterValue !== null &&
                        filterValue !== undefined
                    ) {
                        params.set("filter_field", filter.field);
                        params.set("filter_value", filterValue);
                    }
                }

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/chart?${params}`
                );

                const responseText = await response.text();

                if (!response.ok) {
                    throw new Error(
                        `Chart request failed: ${response.status} - ${responseText}`
                    );
                }

                const result = JSON.parse(responseText);

                setData(result);

            } catch (err) {

                console.error("Chart error:", err);
                setError(err.message);

            }

        };

        loadChart();

    }, [chart, context, widget.filter]);


    if (error) {
        return (
            <Typography color="error">
                {error}
            </Typography>
        );
    }

    if (!data.length) {
        return (
            <Typography color="text.secondary">
                No chart data
            </Typography>
        );
    }


    // -----------------------------------------
    // DATA FOR LINE AND BAR CHARTS
    // -----------------------------------------

    const xData = data.map(item => item.x);
    const yData = data.map(item => item.y);


    // -----------------------------------------
    // DATA FOR PIE CHART
    // -----------------------------------------

    let pieData = [];

    if (chart.type === "pie") {

        const yIsNumeric = data.every(
            item =>
                item.y !== null &&
                item.y !== "" &&
                typeof item.y !== "boolean" &&
                Number.isFinite(Number(item.y))
        );

        if (yIsNumeric) {

            // Numeric Y: use X as labels and Y as slice values.
            pieData = data
                .map((item, index) => ({
                    id: index,
                    label: String(item.x),
                    value: Number(item.y)
                }))
                .filter(item => item.value > 0);

        } else {

            // Categorical Y: count occurrences of each category.
            const counts = new Map();

            data.forEach(item => {

                const label = String(item.y);

                counts.set(
                    label,
                    (counts.get(label) || 0) + 1
                );

            });

            pieData = Array.from(
                counts,
                ([label, value], index) => ({
                    id: index,
                    label,
                    value
                })
            );

        }
    }


    return (

        <Paper
            elevation={2}
            sx={{
                p: 3,
                mt: 3
            }}
        >

            <Typography
                variant="h6"
                gutterBottom
            >
                {widget.title || `${chart.y} by ${chart.x}`}
            </Typography>

            <Box
                sx={{
                    width: "100%",
                    overflow: "hidden"
                }}
            >

                {chart.type === "pie" ? (

                    pieData.length > 0 ? (

                        <PieChart
                            height={350}
                            series={[
                                {
                                    data: pieData,
                                    highlightScope: {
                                        faded: "global",
                                        highlighted: "item"
                                    },
                                    faded: {
                                        innerRadius: 30,
                                        additionalRadius: -30,
                                        color: "gray"
                                    }
                                }
                            ]}
                        />

                    ) : (

                        <Typography color="text.secondary">
                            No positive values available for the pie chart.
                        </Typography>

                    )

                ) : chart.type === "bar" ? (

                    <BarChart
                        height={350}
                        xAxis={[
                            {
                                scaleType: "band",
                                data: xData
                            }
                        ]}
                        series={[
                            {
                                data: yData,
                                label: chart.y
                            }
                        ]}
                        grid={{
                            vertical: false,
                            horizontal: true
                        }}
                    />

                ) : (

                    <LineChart
                        height={350}
                        xAxis={[
                            {
                                scaleType: "point",
                                data: xData
                            }
                        ]}
                        series={[
                            {
                                data: yData,
                                label: chart.y
                            }
                        ]}
                        grid={{
                            vertical: false,
                            horizontal: true
                        }}
                    />

                )}

            </Box>

        </Paper>
    );
}
