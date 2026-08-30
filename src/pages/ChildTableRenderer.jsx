import React from "react";

import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";


export default function ChildTableRenderer({
    entity,
    data = [],
    parentValue,
    relationship,
    columns = [],
    onRowClick
}) {

    if (!entity) {
        return (
            <Typography color="error">
                Child entity configuration not found.
            </Typography>
        );
    }


    if (!relationship) {
        return (
            <Typography color="error">
                Child table relationship not configured.
            </Typography>
        );
    }


    const childKey =
        relationship.childKey;


    const filteredData =
        data.filter(row => {

            if (
                parentValue === undefined ||
                parentValue === null
            ) {
                return false;
            }

            return (
                row?.[childKey] ===
                parentValue
            );
        });


    const formatValue = (
        value,
        column
    ) => {

        if (
            value === undefined ||
            value === null
        ) {
            return "";
        }


        if (
            column.type === "currency"
        ) {
            return Number(value)
                .toLocaleString(
                    undefined,
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );
        }


        if (
            column.type === "date"
        ) {

            const date =
                new Date(value);

            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {
                return date.toLocaleDateString();
            }
        }


        if (
            typeof value === "boolean"
        ) {
            return value
                ? "Yes"
                : "No";
        }


        return String(value);
    };


    return (
        <TableContainer
            component={Paper}
            variant="outlined"
        >

            <Table size="small">

                <TableHead>

                    <TableRow>

                        {columns.map(
                            column => (

                                <TableCell
                                    key={
                                        column.field
                                    }
                                >
                                    {
                                        column.label ||
                                        column.field
                                    }
                                </TableCell>

                            )
                        )}

                    </TableRow>

                </TableHead>


                <TableBody>

                    {filteredData.length === 0 ? (

                        <TableRow>

                            <TableCell
                                colSpan={
                                    columns.length || 1
                                }
                                align="center"
                            >
                                No records found
                            </TableCell>

                        </TableRow>

                    ) : (

                        filteredData.map(
                            (row, index) => (

                                <TableRow
                                    key={
                                        row?.[
                                            entity.key
                                        ] ??
                                        index
                                    }
                                    hover
                                    onClick={
                                        onRowClick
                                            ? event =>
                                                onRowClick(
                                                    event,
                                                    row
                                                )
                                            : undefined
                                    }
                                    sx={{
                                        cursor:
                                            onRowClick
                                                ? "pointer"
                                                : "default"
                                    }}
                                >

                                    {columns.map(
                                        column => (

                                            <TableCell
                                                key={
                                                    column.field
                                                }
                                            >
                                                {
                                                    formatValue(
                                                        row?.[
                                                            column.field
                                                        ],
                                                        column
                                                    )
                                                }
                                            </TableCell>

                                        )
                                    )}

                                </TableRow>

                            )
                        )

                    )}

                </TableBody>

            </Table>

        </TableContainer>
    );
}