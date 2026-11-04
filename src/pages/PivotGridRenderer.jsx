
import React, { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import { getAuthHeaders } from "../utils/auth";


const API_URL = import.meta.env.VITE_API_URL;


export default function PivotGridRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    const source = widget?.source || {};
    const pivot = widget?.pivot || {};

    const entity = source.entity;

    // ------------------------------------
    // Data state
    // ------------------------------------

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ------------------------------------
    // Pivot configuration
    // ------------------------------------

    const getInitialField = (configured, fallback = "") => {

        if (Array.isArray(configured)) {
            return configured[0] || fallback;
        }

        return configured || fallback;
    };

    const [rowField, setRowField] = useState(
        getInitialField(pivot.rows, pivot.rowField)
    );

    const [columnField, setColumnField] = useState(
        getInitialField(pivot.columns, pivot.columnField)
    );

    const [valueField, setValueField] = useState(
        getInitialField(
            pivot.values?.[0]?.field,
            pivot.valueField
        )
    );

    const [aggregation, setAggregation] = useState(
        pivot.values?.[0]?.aggregation ||
        pivot.aggregation ||
        "sum"
    );


    // ------------------------------------
    // Fetch data
    // ------------------------------------

    useEffect(() => {

        if (!entity) {
            setData([]);
            return;
        }

        let cancelled = false;

        const loadData = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/api/${entity}`,
                    {
                        headers: {
                            ...getAuthHeaders()
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load ${entity}: ${response.status}`
                    );
                }

                const result = await response.json();

                if (cancelled) return;

                const records = Array.isArray(result)
                    ? result
                    : result?.items || result?.data || [];

                const limit = source.limit;

                setData(
                    limit
                        ? records.slice(0, Number(limit))
                        : records
                );

            } catch (err) {

                if (!cancelled) {
                    setError(err.message || "Unable to load data");
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };

    }, [entity, source.limit, context.dataVersion]);


    // ------------------------------------
    // Discover available fields
    // ------------------------------------

    const fields = useMemo(() => {

        if (!data.length) return [];

        return Object.keys(data[0]).filter(field => {

            const value = data[0][field];

            return (
                value === null ||
                value === undefined ||
                ["string", "number", "boolean"].includes(
                    typeof value
                )
            );

        });

    }, [data]);


    // ------------------------------------
    // Keep selected fields valid
    // ------------------------------------

    useEffect(() => {

        if (!fields.length) return;

        if (!fields.includes(rowField)) {
            setRowField(fields[0]);
        }

        if (!fields.includes(columnField)) {
            setColumnField(
                fields.find(field => field !== rowField) ||
                fields[0]
            );
        }

        if (!fields.includes(valueField)) {

            const numericField = fields.find(field =>
                data.some(row =>
                    row[field] !== null &&
                    row[field] !== "" &&
                    Number.isFinite(Number(row[field]))
                )
            );

            setValueField(numericField || fields[0]);
        }

    }, [fields, data]);


    // ------------------------------------
    // Pivot calculation
    // ------------------------------------

    const pivotResult = useMemo(() => {

        if (
            !data.length ||
            !rowField ||
            !columnField ||
            !valueField
        ) {
            return {
                columns: [],
                rows: []
            };
        }

        const getLabel = value => {

            if (value === null || value === undefined || value === "") {
                return "(Blank)";
            }

            return String(value);
        };


        const rowGroups = [
            ...new Set(data.map(row => getLabel(row[rowField])))
        ];

        const columnGroups = [
            ...new Set(data.map(row => getLabel(row[columnField])))
        ];


        const aggregate = records => {

            if (aggregation === "count") {

                return records.filter(record =>
                    record[valueField] !== null &&
                    record[valueField] !== undefined &&
                    record[valueField] !== ""
                ).length;
            }

            const numbers = records
                .map(record => Number(record[valueField]))
                .filter(value => Number.isFinite(value));

            if (!numbers.length) return 0;

            const total = numbers.reduce(
                (sum, value) => sum + value,
                0
            );

            if (aggregation === "avg") {
                return Number((total / numbers.length).toFixed(2));
            }

            return Number(total.toFixed(2));
        };


        const resultRows = rowGroups.map((rowLabel, index) => {

            const matchingRows = data.filter(
                row => getLabel(row[rowField]) === rowLabel
            );

            const result = {
                id: index,
                _rowLabel: rowLabel
            };

            let rowTotal = 0;

            columnGroups.forEach((columnLabel, columnIndex) => {

                const cellRecords = matchingRows.filter(
                    row => getLabel(row[columnField]) === columnLabel
                );

                const cellValue = aggregate(cellRecords);

                result[`pivot_${columnIndex}`] = cellValue;

                rowTotal += cellValue;

            });

            result._rowTotal = Number(rowTotal.toFixed(2));

            return result;
        });


        // Column totals
        const columnTotals = {};

        columnGroups.forEach((columnLabel, columnIndex) => {

            const matchingRows = data.filter(
                row => getLabel(row[columnField]) === columnLabel
            );

            columnTotals[`pivot_${columnIndex}`] =
                aggregate(matchingRows);

        });


        // Grand total
        const grandTotal = aggregate(data);

        const showRowTotals = pivot.showRowTotals !== false;
        const showColumnTotals = pivot.showColumnTotals !== false;
        const showGrandTotal = pivot.showGrandTotal !== false;

        if (showColumnTotals || showGrandTotal) {

            const totalRow = {
                id: "pivot_total",
                _rowLabel: "Total",
                _isTotal: true,
                ...columnTotals
            };

            if (showRowTotals) {
                totalRow._rowTotal = grandTotal;
            }

            if (showGrandTotal) {
                resultRows.push(totalRow);
            }
        }

        const gridColumns = [

            {
                field: "_rowLabel",
                headerName: rowField,
                flex: 1,
                minWidth: 150
            },

            ...columnGroups.map((label, index) => ({

                field: `pivot_${index}`,
                headerName: label,
                type: "number",
                flex: 1,
                minWidth: 120

            }))

        ];

        if (showRowTotals) {

            gridColumns.push({

                field: "_rowTotal",
                headerName: "Row Total",
                type: "number",
                flex: 1,
                minWidth: 130

            });
        }

        return {
            columns: gridColumns,
            rows: resultRows
        };

    }, [
        data,
        rowField,
        columnField,
        valueField,
        aggregation,
        pivot.showRowTotals,
        pivot.showColumnTotals,
        pivot.showGrandTotal
    ]);


    // ------------------------------------
    // Render
    // ------------------------------------

    if (loading) {

        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 4
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }


    if (!data.length) {
        return (
            <Alert severity="info">
                No data available for pivot table.
            </Alert>
        );
    }


    return (

        <Paper sx={{ p: 2, width: "100%" }}>

            <Typography variant="h6" sx={{ mb: 2 }}>
                {widget.title || "Pivot Table"}
            </Typography>


            {/* Pivot configuration */}

            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    mb: 2
                }}
            >

                <FormControl size="small" sx={{ minWidth: 170 }}>

                    <InputLabel>Rows</InputLabel>

                    <Select
                        value={rowField}
                        label="Rows"
                        onChange={e => setRowField(e.target.value)}
                    >

                        {fields.map(field => (
                            <MenuItem key={field} value={field}>
                                {field}
                            </MenuItem>
                        ))}

                    </Select>

                </FormControl>


                <FormControl size="small" sx={{ minWidth: 170 }}>

                    <InputLabel>Columns</InputLabel>

                    <Select
                        value={columnField}
                        label="Columns"
                        onChange={e => setColumnField(e.target.value)}
                    >

                        {fields.map(field => (
                            <MenuItem key={field} value={field}>
                                {field}
                            </MenuItem>
                        ))}

                    </Select>

                </FormControl>


                <FormControl size="small" sx={{ minWidth: 170 }}>

                    <InputLabel>Values</InputLabel>

                    <Select
                        value={valueField}
                        label="Values"
                        onChange={e => setValueField(e.target.value)}
                    >

                        {fields.map(field => (
                            <MenuItem key={field} value={field}>
                                {field}
                            </MenuItem>
                        ))}

                    </Select>

                </FormControl>


                <FormControl size="small" sx={{ minWidth: 150 }}>

                    <InputLabel>Aggregation</InputLabel>

                    <Select
                        value={aggregation}
                        label="Aggregation"
                        onChange={e => setAggregation(e.target.value)}
                    >

                        <MenuItem value="sum">SUM</MenuItem>
                        <MenuItem value="count">COUNT</MenuItem>
                        <MenuItem value="avg">AVERAGE</MenuItem>

                    </Select>

                </FormControl>

            </Box>


            {/* Pivot DataGrid */}

            <Box sx={{ width: "100%" }}>

                <DataGrid
                    rows={pivotResult.rows}
                    columns={pivotResult.columns}
                    autoHeight
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                                page: 0
                            }
                        }
                    }}
                    getRowClassName={params =>
                        params.row._isTotal ? "pivot-total-row" : ""
                    }
                    sx={{
                        "& .pivot-total-row": {
                            fontWeight: "bold",
                            backgroundColor: "action.hover"
                        },
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontWeight: "bold"
                        }
                    }}
                />

            </Box>

        </Paper>
    );
}
