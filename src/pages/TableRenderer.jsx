import React, { useEffect, useState } from "react";

import {
    Paper,
    Typography
} from "@mui/material";

import {
    DataGrid
} from "@mui/x-data-grid";


export default function TableRenderer({
    widget,
    context = {},
    handlers = {}

}) {

    const [rows, setRows] = useState([]);
    const [error, setError] = useState("");

    const source = widget?.source || {};

    const entity = source.entity;

    const columns = source.columns || [];

    const limit = source.limit || 10;


    useEffect(() => {

        if (!entity) {
            setRows([]);
            return;
        }

        const loadData = async () => {

            try {

                setError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/${entity}`
                );

                if (!response.ok) {

                    throw new Error(
                        `Table request failed: ${response.status}`
                    );
                }

                const result = await response.json();

                setRows(
                    Array.isArray(result)
                        ? result.slice(0, limit)
                        : []
                );

            } catch (err) {

                console.error(
                    "Table error:",
                    err
                );

                setError(err.message);

            }

        };

        loadData();

    }, [entity, limit]);


    if (error) {

        return (
            <Typography color="error">
                {error}
            </Typography>
        );
    }


    if (!entity) {

        return (
            <Typography color="text.secondary">
                No table entity selected
            </Typography>
        );
    }


    /*
     * If no columns have been explicitly selected,
     * derive them from the first row.
     */

    const visibleColumns =
    columns.length > 0
        ? columns
        : rows.length > 0
            ? Object.keys(rows[0]).map(
                field => ({
                    field,
                    label: field
                })
            )
            : [];


    const gridColumns = visibleColumns.map(
                column => {

                    const field =
                        typeof column === "string"
                            ? column
                            : column.field;

                    const label =
                        typeof column === "string"
                            ? column
                            : column.label || column.field;

                    const format =
                        typeof column === "string"
                            ? "none"
                            : column.format || "none";

                    return {
                        field,
                        headerName: label,
                        flex: 1,
                        minWidth: 120,

                        valueFormatter: (value) => {

                            if (
                                value === null ||
                                value === undefined ||
                                value === ""
                            ) {
                                return "";
                            }

                            switch (format) {

                                case "number":
                                    return Number(value)
                                        .toLocaleString();

                                case "currency":
                                    return Number(value)
                                        .toLocaleString(
                                            undefined,
                                            {
                                                style: "currency",
                                                currency: "USD"
                                            }
                                        );

                                case "date":
                                    return new Date(value)
                                        .toLocaleDateString();

                                case "none":
                                default:
                                    return value;
                            }
                        }
                    };
                }
            );


    const gridRows = rows.map(
        (row, index) => ({
            ...row,
            _gridId:
                row.id ??
                index
        })
    );


    return (

        <Paper
            elevation={2}
            sx={{
                p: 2,
                mt: 3
            }}
        >

            <Typography
                variant="h6"
                gutterBottom
            >
                {widget.title || entity}
            </Typography>


            <DataGrid
                rows={gridRows}
                columns={gridColumns}
                getRowId={(row) =>
                    row._gridId
                }
                autoHeight
                onRowClick={(params) => {

                     console.log("TABLE ROW SELECTED:", params.row);
    console.log("TABLE ENTITY:", entity);
    console.log("SELECT RECORD HANDLER:", handlers.selectRecord);

                    if (handlers.selectRecord) {

                        handlers.selectRecord(
                            params.row
                        );

                    }

                }}
                pageSizeOptions={[
                    5,
                    10,
                    25
                ]}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: Math.min(
                                limit,
                                10
                            ),
                            page: 0
                        }
                    }
                }}
            />

        </Paper>
    );
}