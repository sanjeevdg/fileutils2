import React, { useEffect, useState } from "react";

import {
    Paper,
    Typography,IconButton,
    Tooltip,Box
} from "@mui/material";

import {
    DataGrid
} from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function DataGridRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    const [rows, setRows] = useState([]);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const dataVersion = context?.dataVersion || 0;
    const source = widget?.source || {};

    const entity = source.entity;

    const columns = source.columns || [];

    const limit = source.limit || 10;
    const filter = source.filter || {};


    const filterValue =
    filter.valueFrom === "formData.id"
        ? context?.formData?.id
        : filter.valueFrom?.startsWith("formData.")
            ? context?.formData?.[
                filter.valueFrom.substring(
                    "formData.".length
                )
            ]
            : undefined;


    useEffect(() => {

            if (!entity) {
                setRows([]);
                return;
            }

            const loadData = async () => {

                try {

                    setError("");

                    let url =
                        `${import.meta.env.VITE_API_URL}/api/${entity}`;

                    if (
                        filter.field &&
                        filter.valueFrom
                    ) {

                        let value;

                        if (
                            filter.valueFrom ===
                            "formData.id"
                        ) {

                            value =
                                context?.formData?.id;

                        } else if (
                            filter.valueFrom.startsWith(
                                "formData."
                            )
                        ) {

                            const field =
                                filter.valueFrom.substring(
                                    "formData.".length
                                );

                            value =
                                context?.formData?.[field];
                        }

                        // -------------------------------------------------
                        // If a filter is configured but its value is not
                        // available yet, don't load any data.
                        //
                        // Example:
                        // filter:
                        //   field: order_id
                        //   valueFrom: formData.id
                        //
                        // Before an order is selected, formData.id is empty.
                        // Therefore the grid should remain empty.
                        // -------------------------------------------------

                        if (filter.field && filter.valueFrom) {

                            if (
                                filterValue === undefined ||
                                filterValue === null ||
                                filterValue === ""
                            ) {
                                setRows([]);
                                return;
                            }

                            const params =
                                new URLSearchParams();

                            params.set(
                                filter.field,
                                filterValue
                            );

                            url += `?${params.toString()}`;
                        }
                    }

                    console.log(
                        "DATAGRID FETCH:",
                        url
                    );

                    const response =
                        await fetch(url);

                    if (!response.ok) {

                        throw new Error(
                            `Data Grid request failed: ${response.status}`
                        );
                    }

                    const result =
                        await response.json();

                    setRows(
                        Array.isArray(result)
                            ? result.slice(0, limit)
                            : []
                    );

                } catch (err) {

                    console.error(
                        "Data Grid error:",
                        err
                    );

                    setError(err.message);
                }

            };

            loadData();

        }, [
            entity,
            limit,
            dataVersion,
            refreshKey,
            filter.field,
            filter.valueFrom,
            filterValue
        ]);


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
                Select an entity for this Data Grid.
            </Typography>
        );
    }


    if (!rows.length) {

        return (
            <Typography color="text.secondary">
                No data available for {entity}.
            </Typography>
        );
    }


    /*
     * If columns have been selected
     * in PropertyPanel, use them.
     *
     * Otherwise derive columns from
     * the first returned row.
     */

    const visibleColumns =
        columns.length > 0
            ? columns
            : Object.keys(rows[0]).map(
                field => ({
                    field,
                    label: field
                })
            );


    const gridColumns =
        visibleColumns.map(column => {

            const field =
                typeof column === "string"
                    ? column
                    : column.field;

            const label =
                typeof column === "string"
                    ? column
                    : column.label || column.field;

            return {
                field,
                headerName: label,
                flex: 1,
                minWidth: 120
            };

        });


    /*
     * Give every row a guaranteed
     * DataGrid-compatible ID.
     */

    const gridRows =
        rows.map((row, index) => ({
            ...row,
            _gridId:
                row.id ??
                index
        }));


    return (

        <Paper
            elevation={2}
            sx={{
                p: 2,
                mt: 3
            }}
        >

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1
                }}
            >
                <Typography variant="h6">
                    {widget.title || entity}
                </Typography>

                <Tooltip title="Refresh">
                    <IconButton
                        onClick={() =>
                            setRefreshKey(
                                previous => previous + 1
                            )
                        }
                        size="small"
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>


            <DataGrid
                rows={gridRows}
                columns={gridColumns}

                getRowId={(row) =>
                    row._gridId
                }

                autoHeight

                checkboxSelection={
                    source.checkboxSelection || false
                }

                disableRowSelectionOnClick

                onRowClick={(params) => {

                    console.log(
                        "DATAGRID ROW SELECTED:",
                        params.row
                    );

                    if (handlers.selectRecord) {

                        handlers.selectRecord(
                            params.row
                        );

                    }

                }}

                pageSizeOptions={[
                    5,
                    10,
                    25,
                    50
                ]}

                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize:
                                Math.min(
                                    source.pageSize || 10,
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