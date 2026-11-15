
import React, { useState } from "react";

import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    TextField
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { getAuthHeaders } from "../utils/auth";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";


export default function NestedDetailGrid({
    rows = [],
    columns = [],
    detailConfig = null,
    level = 2
}) {

    const [expandedRows, setExpandedRows] = useState({});
    const [detailState, setDetailState] = useState({});
    const [searchText, setSearchText] = useState("");

    // --------------------------------------------------
    // NORMALIZE ROWS
    // --------------------------------------------------

    const gridRows = rows.map((row, index) => ({
        ...row,
        _gridId: row.id ?? index
    }));

    // --------------------------------------------------
    // DETAIL CONFIGURATION
    // --------------------------------------------------

    const detailEntity = detailConfig?.entity || "";

    const foreignKey = detailConfig?.foreignKey || "";

    const parentKey = detailConfig?.parentKey || "id";

    const dataField = detailConfig?.dataField || "";

    const detailColumns = detailConfig?.columns || [];

    const detailEnabled = Boolean(
        (detailEntity && foreignKey) ||
        dataField
    );

    // --------------------------------------------------
    // COLUMN CONFIGURATION
    // --------------------------------------------------

    const visibleColumns = columns.length
        ? columns
        : gridRows.length
            ? Object.keys(gridRows[0])
                .filter(field => field !== "_gridId")
                .map(field => ({
                    field,
                    label: field
                }))
            : [];

    // --------------------------------------------------
    // GET DETAIL COLUMNS
    // --------------------------------------------------

    const getColumns = (detailRows) => {

        if (detailColumns.length) {
            return detailColumns;
        }

        if (detailRows.length) {
            return Object.keys(detailRows[0])
                .filter(field => field !== "_gridId")
                .map(field => ({
                    field,
                    label: field
                }));
        }

        return [];
    };

    // --------------------------------------------------
    // LOAD NEXT LEVEL DETAILS
    // --------------------------------------------------

    const toggleExpansion = async (row) => {

        const key = String(row._gridId);

        if (expandedRows[key]) {

            setExpandedRows(previous => ({
                ...previous,
                [key]: false
            }));

            return;
        }

        setExpandedRows(previous => ({
            ...previous,
            [key]: true
        }));

        if (detailState[key] || !detailEnabled) {
            return;
        }

        // Embedded detail data
        if (dataField) {

            const embeddedRows = row[dataField];

            setDetailState(previous => ({
                ...previous,
                [key]: {
                    loading: false,
                    rows: Array.isArray(embeddedRows)
                        ? embeddedRows
                        : [],
                    error: ""
                }
            }));

            return;
        }

        const parentValue = row[parentKey];

        if (parentValue == null) {

            setDetailState(previous => ({
                ...previous,
                [key]: {
                    loading: false,
                    rows: [],
                    error: `Missing master key: ${parentKey}`
                }
            }));

            return;
        }

        setDetailState(previous => ({
            ...previous,
            [key]: {
                loading: true,
                rows: [],
                error: ""
            }
        }));

        try {

            const params = new URLSearchParams();

            params.set(
                foreignKey,
                String(parentValue)
            );

            const url =
                `${API_URL}/api/${detailEntity}?${params.toString()}`;

            console.log(
                `NESTED DETAIL LEVEL ${level} FETCH:`,
                url
            );

            const response = await fetch(url, {
                headers: {
                    ...getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(
                    `Detail request failed: ${response.status}`
                );
            }

            const result = await response.json();

            setDetailState(previous => ({
                ...previous,
                [key]: {
                    loading: false,
                    rows: Array.isArray(result) ? result : [],
                    error: ""
                }
            }));

        } catch (err) {

            console.error(
                "Nested detail error:",
                err
            );

            setDetailState(previous => ({
                ...previous,
                [key]: {
                    loading: false,
                    rows: [],
                    error: err.message
                }
            }));
        }
    };

    // --------------------------------------------------
    // FILTER
    // --------------------------------------------------

    const filteredRows = gridRows.filter(row => {

        if (!searchText.trim()) {
            return true;
        }

        const search = searchText.toLowerCase();

        return visibleColumns.some(column => {

            const field =
                typeof column === "string"
                    ? column
                    : column.field;

            return String(row[field] ?? "")
                .toLowerCase()
                .includes(search);
        });
    });


    // Insert an expanded detail row immediately after its parent row
        const displayRows = filteredRows.flatMap(row => {

            const result = [row];

            if (expandedRows[String(row._gridId)]) {

                result.push({
                    _gridId: `detail-${row._gridId}`,
                    __isDetailRow: true,
                    __parentRow: row
                });
            }

            return result;
        });


    // --------------------------------------------------
    // BUILD GRID COLUMNS
    // --------------------------------------------------

    const gridColumns = [];

    if (detailEnabled) {

        gridColumns.push({

            field: "__expand",

            headerName: "",

            width: 50,

            minWidth: 50,

            maxWidth: 50,

            sortable: false,

            filterable: false,

            disableColumnMenu: true,

            colSpan: (value, row) => {
                return row.__isDetailRow
                    ? visibleColumns.length + 1
                    : 1;
            },

             renderCell: (params) => {

                const row = params.row;

                // This is an expanded detail row
                if (row.__isDetailRow) {
                    return renderExpandedContent(row.__parentRow);
                }

                const key = String(row._gridId);
                const isExpanded = Boolean(expandedRows[key]);

                return (
                    <Tooltip title={isExpanded ? "Collapse details" : "Expand details"}>
                        <IconButton
                            size="small"
                            onClick={(event) => {
                                event.stopPropagation();
                                toggleExpansion(row);
                            }}
                        >
                            {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </Tooltip>
                );
            }
        });
    }

    // --------------------------------------------------
    // NORMAL COLUMNS
    // --------------------------------------------------

    visibleColumns.forEach(column => {

        const field =
            typeof column === "string"
                ? column
                : column.field;

        const label =
            typeof column === "string"
                ? column
                : column.label || field;

        gridColumns.push({

            field,

            headerName: label,

            flex: 1,

            minWidth: 120

        });
    });

    // --------------------------------------------------
    // RENDER EXPANDED CONTENT
    // --------------------------------------------------

    const renderExpandedContent = (row) => {

        const key = String(row._gridId);

        const state = detailState[key] || {};

        const childRows = state.rows || [];

        const childColumns = getColumns(childRows);

        const childGridRows = childRows.map(
            (item, index) => ({
                ...item,
                _gridId: item.id ?? index
            })
        );

        return (

            <Box
                sx={{
                    width: "100%",
                    p: 2,
                    boxSizing: "border-box",
                    backgroundColor: "action.hover",
                    borderTop: 1,
                    borderColor: "divider"
                }}
            >

                <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ mb: 1.5 }}
                >
                    {detailConfig.title || detailEntity}
                </Typography>

                {state.loading ? (

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            py: 2
                        }}
                    >

                        <CircularProgress size={22} />

                        <Typography variant="body2">
                            Loading details...
                        </Typography>

                    </Box>

                ) : state.error ? (

                    <Alert severity="error">
                        {state.error}
                    </Alert>

                ) : !childRows.length ? (

                    <Typography color="text.secondary">
                        No detail records available.
                    </Typography>

                ) : (

                    <NestedDetailGrid
                        rows={childGridRows}
                        columns={childColumns}
                        detailConfig={detailConfig.detail || null}
                        level={level + 1}
                    />

                )}

            </Box>
        );
    };

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (

        <Box sx={{ width: "100%" }}>

            <TextField
                size="small"
                fullWidth
                placeholder="Search records..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ mb: 1.5 }}
            />

            <DataGrid

                rows={displayRows}

                columns={gridColumns}

                getRowId={(row) => row._gridId}

                autoHeight

                density="compact"

                getRowHeight={(params) => {
                    return params.model?.__isDetailRow ? "auto" : 48;
                }}

                disableRowSelectionOnClick

                pageSizeOptions={[5, 10, 25]}

                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 25,
                            page: 0
                        }
                    }
                }}

                sx={{

                    backgroundColor: "background.paper",

                    "& .MuiDataGrid-columnHeader": {
                        fontWeight: 600
                    },

                    "& .MuiDataGrid-cell": {
                        alignItems: "flex-start"
                    },

                    "& .MuiDataGrid-cell[data-field='__expand']": {
                        overflow: "visible",
                        whiteSpace: "normal"
                    }

                }}

            />

           

        </Box>
    );
}
