import React from "react";

import {
    Paper,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from "@mui/material";


export default function TableRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    console.log("TABLE RENDERER:", widget);
    console.log("TABLE CONTEXT:", context);

    const title = widget.title || "Table";

    const source = widget.source || {};

    const entity = source.entity;
    const limit = source.limit || 10;
    const columns = source.columns || [];

    // -----------------------------------------
    // GET DATA
    // -----------------------------------------

    let rows = context[entity] || [];

    // -----------------------------------------
    // APPLY FILTER
    // -----------------------------------------

    const filter = widget.filter;

    if (filter?.field) {

        let filterValue = null;

        // Example:
        // binding: selectedUser.id

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
    // LIMIT
    // -----------------------------------------

    rows = rows.slice(0, limit);

    // -----------------------------------------
    // RENDER
    // -----------------------------------------

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

            <Table size="small">

                <TableHead>

                    <TableRow>

                        {columns.map((column, index) => (

                            <TableCell
                                key={
                                    column.field ||
                                    index
                                }
                            >
                                {column.label ||
                                    column.field}
                            </TableCell>

                        ))}

                    </TableRow>

                </TableHead>


                <TableBody>

                    {rows.map((row, rowIndex) => (

                        <TableRow
                            key={row.id ?? rowIndex}
                            hover
                            selected={
                                context.selectedUser?.id === row.id
                            }
                            onClick={() => {

                                const action =
                                    widget.select?.action;

                                if (
                                    action &&
                                    handlers[action]
                                ) {
                                    handlers[action](row);
                                }

                            }}
                            sx={{
                                cursor:
                                    widget.select?.action
                                        ? "pointer"
                                        : "default"
                            }}
                        >

                            {columns.map(
                                (column, columnIndex) => (

                                    <TableCell
                                        key={
                                            column.field ||
                                            columnIndex
                                        }
                                    >
                                        {row[column.field]}
                                    </TableCell>

                                )
                            )}

                        </TableRow>

                    ))}

                </TableBody>

            </Table>

        </Paper>
    );
}