
import React, { useEffect, useState } from "react";

import {
    Paper,
    Typography,
    IconButton,
    Tooltip,
    Box,
    CircularProgress,
    Alert,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell, TextField
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { getAuthHeaders } from "../utils/auth";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";


export default function DataGridRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    const [rows, setRows] = useState([]);
    const [error, setError] = useState("");

    const [refreshKey, setRefreshKey] = useState(0);

    const [expandedRows, setExpandedRows] = useState({});

    const [detailState, setDetailState] = useState({});

    const dataVersion = context?.dataVersion || 0;

    const source = widget?.source || {};

    const entity = source.entity;

    const columns = source.columns || [];

    const limit = source.limit || 10;

    const filter = source.filter || {};

    // --------------------------------------------------
    // DETAIL CONFIGURATION
    // --------------------------------------------------

    const detailConfig = source.detail || {};

    const detailEntity = detailConfig.entity || "";

    const foreignKey = detailConfig.foreignKey || "";

    const parentKey = detailConfig.parentKey || "id";

    const detailColumns = detailConfig.columns || [];

    const detailEnabled =
        Boolean(detailEntity && foreignKey);


    const [searchText, setSearchText] = useState("");    

    // --------------------------------------------------
    // FILTER VALUE
    // --------------------------------------------------

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


    // --------------------------------------------------
    // LOAD MASTER RECORDS
    // --------------------------------------------------

    useEffect(() => {

        let cancelled = false;

        const loadData = async () => {

            if (!entity) {
                setRows([]);
                return;
            }

            try {

                setError("");

                let url = `${API_URL}/api/${entity}`;

                if (filter.field && filter.valueFrom) {

                    if (
                        filterValue === undefined ||
                        filterValue === null ||
                        filterValue === ""
                    ) {
                        setRows([]);
                        return;
                    }

                    const params = new URLSearchParams();

                    params.set(
                        filter.field,
                        String(filterValue)
                    );

                    url += `?${params.toString()}`;
                }

                console.log("DATAGRID FETCH:", url);

                const response = await fetch(url, {
                    headers: {
                        ...getAuthHeaders()
                    }
                });

                if (!response.ok) {
                    throw new Error(
                        `Data Grid request failed: ${response.status}`
                    );
                }

                const result = await response.json();

                if (!cancelled) {

                    const mappedRows = Array.isArray(result)
                        ? result.slice(0, limit).map((row, index) => ({
                            ...row,
                            _gridId: row.id ?? index
                        }))
                        : [];

                    setRows(mappedRows);
                }

            } catch (err) {

                if (!cancelled) {
                    console.error("Data Grid error:", err);
                    setError(err.message);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };

    }, [
        entity,
        limit,
        dataVersion,
        refreshKey,
        filter.field,
        filter.valueFrom,
        filterValue
    ]);


    // --------------------------------------------------
    // TOGGLE ROW EXPANSION
    // --------------------------------------------------

    const toggleRowExpansion = async (row) => {

        const rowId = row._gridId;

        const key = String(rowId);

        const isExpanded = Boolean(expandedRows[key]);

        // Collapse
        if (isExpanded) {

            setExpandedRows(previous => ({
                ...previous,
                [key]: false
            }));

            return;
        }

        // Expand
        setExpandedRows(previous => ({
            ...previous,
            [key]: true
        }));

        // Don't fetch the same details repeatedly
        if (detailState[key]) {
            return;
        }

        if (!detailEnabled) {
            return;
        }

        const parentValue = row[parentKey];

        if (
            parentValue === undefined ||
            parentValue === null
        ) {

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

        try {

            setDetailState(previous => ({
                ...previous,
                [key]: {
                    loading: true,
                    rows: [],
                    error: ""
                }
            }));

            const params = new URLSearchParams();

            params.set(
                foreignKey,
                String(parentValue)
            );

            const url =
                `${API_URL}/api/${detailEntity}?${params.toString()}`;

            console.log("DETAIL FETCH:", url);

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

            console.error("Detail grid error:", err);

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
    // MASTER COLUMNS
    // --------------------------------------------------

    const visibleColumns =
        columns.length > 0
            ? columns
            : rows.length > 0
                ? Object.keys(rows[0]).map(field => ({
                    field,
                    label: field
                }))
                : [];


    // --------------------------------------------------
    // MASTER GRID ROWS
    // --------------------------------------------------

    const gridRows = rows.map((row, index) => ({
        ...row,
        _gridId: row.id ?? index
    }));


    // --------------------------------------------------
    // DETAIL COLUMN CONFIGURATION
    // --------------------------------------------------

    const getDetailColumns = (detailRows) => {

        if (detailColumns.length > 0) {
            return detailColumns;
        }

        if (detailRows.length > 0) {
            return Object.keys(detailRows[0]).map(field => ({
                field,
                label: field
            }));
        }

        return [];
    };



    const filteredRows = rows.filter((row) => {
        if (!searchText.trim()) return true;

        const search = searchText.toLowerCase();

        return visibleColumns.some((column) => {
            const value = row[column.field];

            return String(value ?? "")
                .toLowerCase()
                .includes(search);
        });
    });

    // --------------------------------------------------
    // RENDER EXPANDED CONTENT
    // --------------------------------------------------

    const renderExpandedContent = (row) => {

        const key = String(row._gridId);

        const state = detailState[key] || {};

        const currentDetailRows = state.rows || [];

        const currentColumns =
            getDetailColumns(currentDetailRows);

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


                {!detailEnabled ? (

                    <Typography color="text.secondary">
                        Configure a detail entity and foreign key
                        in the DataGrid properties.
                    </Typography>

                ) : state.loading ? (

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

                ) : currentDetailRows.length === 0 ? (

                    <Typography color="text.secondary">
                        No detail records available.
                    </Typography>

                ) : (

                    <Box sx={{ overflowX: "auto" }}>

                        <Table
                            size="small"
                            sx={{
                                backgroundColor: "background.paper"
                            }}
                        >

                            <TableHead>

                                <TableRow>

                                    {currentColumns.map((column, index) => {

                                        const field =
                                            typeof column === "string"
                                                ? column
                                                : column.field;

                                        const label =
                                            typeof column === "string"
                                                ? column
                                                : column.label || field;

                                        return (
                                            <TableCell
                                                key={field || index}
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {label}
                                            </TableCell>
                                        );

                                    })}

                                </TableRow>

                            </TableHead>


                            <TableBody>

                                {currentDetailRows.map((detailRow, index) => (

                                    <TableRow key={detailRow.id ?? index}>

                                        {currentColumns.map((column, colIndex) => {

                                            const field =
                                                typeof column === "string"
                                                    ? column
                                                    : column.field;

                                            const value = detailRow[field];

                                            return (

                                                <TableCell
                                                    key={field || colIndex}
                                                >

                                                    {typeof value === "boolean"
                                                        ? value ? "Yes" : "No"
                                                        : value ?? ""
                                                    }

                                                </TableCell>

                                            );

                                        })}

                                    </TableRow>

                                ))}

                            </TableBody>

                        </Table>

                    </Box>

                )}

            </Box>
        );
    };


    // --------------------------------------------------
    // BUILD GRID COLUMNS
    // --------------------------------------------------

    const gridColumns = [];

    if (detailEnabled) {

        gridColumns.push({

            field: "__expand",

            headerName: "",

            width: 55,

            minWidth: 55,

            maxWidth: 55,

            sortable: false,

            filterable: false,

            disableColumnMenu: true,

            // When expanded, this cell spans the entire row.
            colSpan: (value, row) => {

                return expandedRows[String(row._gridId)]
                    ? visibleColumns.length + 1
                    : 1;

            },

            renderCell: (params) => {

                const row = params.row;

                const isExpanded =
                    Boolean(expandedRows[String(row._gridId)]);

                if (isExpanded) {

                    return (

                        <Box
                            sx={{
                                width: "100%",
                                minWidth: 0,
                                py: 1,
                                boxSizing: "border-box"
                            }}
                        >

                            {/* Recreate master record values */}

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    flexWrap: "wrap",
                                    px: 1,
                                    pb: 1
                                }}
                            >

                                <IconButton
                                    size="small"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        toggleRowExpansion(row);
                                    }}
                                >
                                    <ExpandMoreIcon />
                                </IconButton>

                                {visibleColumns.map((column, index) => {

                                    const field =
                                        typeof column === "string"
                                            ? column
                                            : column.field;

                                    const value = row[field];

                                    return (

                                        <Box
                                            key={field || index}
                                            sx={{
                                                flex: "1 1 120px",
                                                minWidth: 0
                                            }}
                                        >

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                display="block"
                                            >
                                                {typeof column === "string"
                                                    ? column
                                                    : column.label || field
                                                }
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                fontWeight={500}
                                            >
                                                {typeof value === "boolean"
                                                    ? value ? "Yes" : "No"
                                                    : value ?? ""
                                                }
                                            </Typography>

                                        </Box>

                                    );

                                })}

                            </Box>


                            {/* Detail content */}

                            {renderExpandedContent(row)}

                        </Box>

                    );
                }

                return (

                    <Tooltip title="Expand details">

                        <IconButton
                            size="small"
                            onClick={(event) => {
                                event.stopPropagation();
                                toggleRowExpansion(row);
                            }}
                        >
                            <ChevronRightIcon />
                        </IconButton>

                    </Tooltip>

                );
            }
        });
    }


    // Normal master columns

    visibleColumns.forEach(column => {

        const field =
            typeof column === "string"
                ? column
                : column.field;

        const label =
            typeof column === "string"
                ? column
                : column.label || column.field;

        gridColumns.push({

            field,

            headerName: label,

            flex: 1,

            minWidth: 120

        });

    });


    // --------------------------------------------------
    // ERROR / EMPTY STATES
    // --------------------------------------------------

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


    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

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
                        onClick={() => {

                            setExpandedRows({});
                            setDetailState({});

                            setRefreshKey(previous => previous + 1);

                        }}
                        size="small"
                    >
                        <RefreshIcon />
                    </IconButton>

                </Tooltip>

            </Box>

            <TextField
                size="small"
                fullWidth
                placeholder="Search records..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ mb: 2 }}
            />

            <DataGrid

                rows={filteredRows}

                columns={gridColumns}

                getRowId={(row) => row._gridId}

                autoHeight

                getRowHeight={(params) => {

                    return expandedRows[String(params.id)]
                        ? "auto"
                        : 52;

                }}

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
                            params.row,
                            source.entity
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

                            pageSize: Math.min(
                                source.pageSize || 10,
                                10
                            ),

                            page: 0

                        }

                    }

                }}

                sx={{

                    "& .MuiDataGrid-columnHeader": {
                        fontWeight: 600
                    },

                    "& .MuiDataGrid-cell": {
                        alignItems: "flex-start"
                    },

                    "& .MuiDataGrid-cell[data-field='__expand']": {
                        overflow: "visible",
                        whiteSpace: "normal",
                        lineHeight: "normal"
                    }

                }}

            />

        </Paper>
    );
}
