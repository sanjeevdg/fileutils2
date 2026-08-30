import React from "react";

import {
    Box,
    Button,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";

export default function ListRenderer({
    page,
    entity,
    data = [],
    onNavigate,
    onDelete
}) {

    const columns =
        page.columns ||
        entity.list?.columns ||
        entity.fields
            ?.filter(field => !field.hidden)
            .map(field => field.name);

    const fields = entity.fields || [];

    const getField = (name) =>
        fields.find(field => field.name === name);

    const formatValue = (field, value) => {

        if (value === null || value === undefined) {
            return "";
        }

        if (field?.type === "date") {
            return new Date(value).toLocaleDateString();
        }

        if (field?.type === "datetime") {
            return new Date(value).toLocaleString();
        }

        if (field?.type === "currency") {
            return Number(value).toLocaleString(undefined, {
                style: "currency",
                currency: "USD"
            });
        }

        if (field?.type === "select") {
            const option = field.options?.find(
                option => option.value === value
            );

            return option?.label || value;
        }

        return value;
    };

    const handleView = (row) => {

        if (onNavigate) {
            onNavigate({
                page: `${page.entity}-detail`,
                id: row[entity.key]
            });
        }
    };

    return (
        <Box sx={{ width: "100%" }}>

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
            >

                <Typography variant="h5">
                    {page.title || entity.label}
                </Typography>

                <Stack direction="row" spacing={1}>

                    {page.actions
                        ?.filter(action => action.type === "create")
                        .map(action => (
                            <Button
                                key={action.type}
                                variant="contained"
                                onClick={() =>
                                    onNavigate?.({
                                        page: `${page.entity}-form`
                                    })
                                }
                            >
                                {action.label}
                            </Button>
                        ))}

                </Stack>

            </Stack>

            <TableContainer component={Paper}>

                <Table>

                    <TableHead>

                        <TableRow>

                            {columns.map(column => {

                                const field = getField(column);

                                return (
                                    <TableCell key={column}>
                                        {field?.label || column}
                                    </TableCell>
                                );
                            })}

                            <TableCell>
                                Actions
                            </TableCell>

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {data.map(row => (

                            <TableRow
                                key={row[entity.key]}
                                hover
                            >

                                {columns.map(column => {

                                    const field = getField(column);

                                    return (
                                        <TableCell key={column}>
                                            {formatValue(
                                                field,
                                                row[column]
                                            )}
                                        </TableCell>
                                    );

                                })}

                                <TableCell>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                    >

                                        <Button
                                            size="small"
                                            onClick={() =>
                                                handleView(row)
                                            }
                                        >
                                            View
                                        </Button>

                                        <Button
                                            size="small"
                                            onClick={() =>
                                                onNavigate?.({
                                                    page: `${page.entity}-form`,
                                                    id: row[entity.key]
                                                })
                                            }
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                                onDelete?.(
                                                    entity,
                                                    row
                                                )
                                            }
                                        >
                                            Delete
                                        </Button>

                                    </Stack>

                                </TableCell>

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </TableContainer>

        </Box>
    );
}