import React, { useEffect, useState } from "react";

import {
    Paper,
    Typography
} from "@mui/material";

import {
    DataGrid
} from "@mui/x-data-grid";


export default function DataGridRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    const [rows, setRows] = useState([]);
    const [error, setError] = useState("");
    const dataVersion = context?.dataVersion || 0;
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
                        `Data Grid request failed: ${response.status}`
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
                    "Data Grid error:",
                    err
                );

                setError(err.message);

            }

        };

        loadData();

    }, [entity, limit, dataVersion]);


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