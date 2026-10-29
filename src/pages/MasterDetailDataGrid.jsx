
import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Alert,
    Box,
    CircularProgress,
    Collapse,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { getAuthHeaders } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

export default function MasterDetailDataGrid({
    widget,
    context = {},
    handlers = {}
}) {
    const source = widget?.source || {};

    const entity = source.entity || "";
    const columns = source.columns || [];
    const limit = source.limit || 10;

    const detail = source.detail || {};

    const detailEntity = detail.entity || "";
    const parentKey = detail.parentKey || "id";
    const foreignKey = detail.foreignKey || "";
    const detailColumns = detail.columns || [];

    const filter = source.filter || {};
    const dataVersion = context?.dataVersion || 0;

    const [rows, setRows] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [detailRows, setDetailRows] = useState([]);

    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const [error, setError] = useState("");
    const [detailError, setDetailError] = useState("");

    const [refreshKey, setRefreshKey] = useState(0);
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const filterValue = useMemo(() => {
        if (!filter.valueFrom) return undefined;

        if (filter.valueFrom === "formData.id") {
            return context?.formData?.id;
        }

        if (filter.valueFrom.startsWith("formData.")) {
            const field = filter.valueFrom.substring(
                "formData.".length
            );

            return context?.formData?.[field];
        }

        return undefined;
    }, [filter.valueFrom, context?.formData]);

    // --------------------------------------------------
    // Load master records
    // --------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        async function loadMaster() {
            if (!entity) {
                setRows([]);
                return;
            }

            if (
                filter.field &&
                filter.valueFrom &&
                (
                    filterValue === undefined ||
                    filterValue === null ||
                    filterValue === ""
                )
            ) {
                setRows([]);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams();

                if (filter.field && filter.valueFrom) {
                    params.set(
                        filter.field,
                        String(filterValue)
                    );
                }

                const query = params.toString();

                const response = await fetch(
                    `${API_URL}/api/${entity}` +
                    (query ? `?${query}` : ""),
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

                if (!cancelled) {
                    setRows(
                        Array.isArray(result)
                            ? result.slice(0, limit)
                            : []
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadMaster();

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
    // Determine master columns
    // --------------------------------------------------

    const masterColumns = useMemo(() => {
        if (columns.length) return columns;

        if (!rows.length) return [];

        return Object.keys(rows[0])
            .map(field => ({ field, label: field }));
    }, [columns, rows]);

    // --------------------------------------------------
    // Determine detail columns
    // --------------------------------------------------

    const visibleDetailColumns = useMemo(() => {
        if (detailColumns.length) return detailColumns;

        if (!detailRows.length) return [];

        return Object.keys(detailRows[0])
            .map(field => ({ field, label: field }));
    }, [detailColumns, detailRows]);

    // --------------------------------------------------
    // Expand or collapse a master row
    // --------------------------------------------------

    async function toggleDetails(row) {
        const rowId = row[parentKey];

        if (
            rowId === undefined ||
            rowId === null
        ) {
            setDetailError(
                `Master row is missing "${parentKey}".`
            );
            return;
        }

        if (String(expandedId) === String(rowId)) {
            setExpandedId(null);
            setDetailRows([]);
            setDetailError("");
            return;
        }

        setExpandedId(rowId);
        setDetailRows([]);
        setDetailError("");

        if (!detailEntity || !foreignKey) {
            setDetailError(
                "Configure detail.entity and detail.foreignKey in YAML."
            );
            return;
        }

        try {
            setDetailLoading(true);

            const params = new URLSearchParams();

            params.set(foreignKey, String(rowId));

            const response = await fetch(
                `${API_URL}/api/${detailEntity}?${params}`,
                {
                    headers: {
                        ...getAuthHeaders()
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to load ${detailEntity}: ${response.status}`
                );
            }

            const result = await response.json();

            // Ignore results if the user expanded another row.
            if (String(rowId) === String(expandedId)) {
                setDetailRows(
                    Array.isArray(result) ? result : []
                );
            } else {
                setDetailRows(
                    Array.isArray(result) ? result : []
                );
            }
        } catch (err) {
            setDetailError(err.message);
        } finally {
            setDetailLoading(false);
        }
    }

    // --------------------------------------------------
    // Search master records
    // --------------------------------------------------

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return rows;

        return rows.filter(row =>
            masterColumns.some(column => {
                const field =
                    typeof column === "string"
                        ? column
                        : column.field;

                return String(row[field] ?? "")
                    .toLowerCase()
                    .includes(query);
            })
        );
    }, [rows, masterColumns, search]);

    const pagedRows = useMemo(() => {
        return filteredRows.slice(
            page * pageSize,
            page * pageSize + pageSize
        );
    }, [filteredRows, page, pageSize]);

    useEffect(() => {
        setPage(0);
    }, [search]);

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    if (!entity) {
        return (
            <Typography color="text.secondary">
                Select an entity for this grid.
            </Typography>
        );
    }

    return (
        <Paper elevation={2} sx={{ p: 2, mt: 3 }}>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2
                }}
            >
                <Typography variant="h6">
                    {widget.title || entity}
                </Typography>

                <Tooltip title="Refresh">
                    <IconButton
                        onClick={() => {
                            setExpandedId(null);
                            setDetailRows([]);
                            setRefreshKey(v => v + 1);
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <TextField
                fullWidth
                size="small"
                placeholder={`Search ${entity}...`}
                value={search}
                onChange={event =>
                    setSearch(event.target.value)
                }
                sx={{ mb: 2 }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }
                }}
            />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer>
                    <Table size="small">

                        <TableHead>
                            <TableRow>
                                <TableCell width={48} />

                                {masterColumns.map((column, index) => {
                                    const field =
                                        typeof column === "string"
                                            ? column
                                            : column.field;

                                    const label =
                                        typeof column === "string"
                                            ? column
                                            : column.label || field;

                                    return (
                                        <TableCell key={field || index}>
                                            <strong>{label}</strong>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {pagedRows.map((row, index) => {
                                const rowId = row[parentKey];

                                const isExpanded =
                                    expandedId !== null &&
                                    String(expandedId) ===
                                    String(rowId);

                                return (
                                    <React.Fragment
                                        key={rowId ?? index}
                                    >
                                        {/* MASTER ROW */}

                                        <TableRow
                                            hover
                                            sx={{
                                                "& > *": {
                                                    borderBottom:
                                                        isExpanded
                                                            ? "unset"
                                                            : undefined
                                                }
                                            }}
                                            onClick={() => {
                                                handlers.selectRecord?.(
                                                    row,
                                                    entity
                                                );
                                            }}
                                        >
                                            <TableCell>
                                                <Tooltip
                                                    title={
                                                        isExpanded
                                                            ? "Collapse details"
                                                            : "Expand details"
                                                    }
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={event => {
                                                            event.stopPropagation();
                                                            toggleDetails(row);
                                                        }}
                                                    >
                                                        {isExpanded
                                                            ? <ExpandMoreIcon />
                                                            : <ChevronRightIcon />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>

                                            {masterColumns.map(
                                                (column, columnIndex) => {
                                                    const field =
                                                        typeof column === "string"
                                                            ? column
                                                            : column.field;

                                                    return (
                                                        <TableCell
                                                            key={field || columnIndex}
                                                        >
                                                            {row[field] == null
                                                                ? ""
                                                                : String(row[field])}
                                                        </TableCell>
                                                    );
                                                }
                                            )}
                                        </TableRow>

                                        {/* DETAIL ROW — immediately below master */}

                                        <TableRow>
                                            <TableCell
                                                colSpan={
                                                    masterColumns.length + 1
                                                }
                                                sx={{
                                                    py: 0,
                                                    borderBottom: 0
                                                }}
                                            >
                                                <Collapse
                                                    in={isExpanded}
                                                    timeout="auto"
                                                    unmountOnExit
                                                >
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            my: 1,
                                                            backgroundColor:
                                                                "action.hover",
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight={600}
                                                            sx={{ mb: 2 }}
                                                        >
                                                            {detail.title ||
                                                                detailEntity}
                                                        </Typography>

                                                        {detailLoading ? (
                                                            <CircularProgress
                                                                size={24}
                                                            />
                                                        ) : detailError ? (
                                                            <Alert severity="error">
                                                                {detailError}
                                                            </Alert>
                                                        ) : detailRows.length === 0 ? (
                                                            <Typography
                                                                color="text.secondary"
                                                            >
                                                                No detail records found.
                                                            </Typography>
                                                        ) : (
                                                            <Table size="small">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        {visibleDetailColumns.map(
                                                                            (column, i) => {
                                                                                const field =
                                                                                    typeof column === "string"
                                                                                        ? column
                                                                                        : column.field;

                                                                                const label =
                                                                                    typeof column === "string"
                                                                                        ? column
                                                                                        : column.label || field;

                                                                                return (
                                                                                    <TableCell key={field || i}>
                                                                                        <strong>{label}</strong>
                                                                                    </TableCell>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </TableRow>
                                                                </TableHead>

                                                                <TableBody>
                                                                    {detailRows.map(
                                                                        (detailRow, detailIndex) => (
                                                                            <TableRow
                                                                                key={
                                                                                    detailRow.id ??
                                                                                    detailIndex
                                                                                }
                                                                                hover
                                                                            >
                                                                                {visibleDetailColumns.map(
                                                                                    (column, i) => {
                                                                                        const field =
                                                                                            typeof column === "string"
                                                                                                ? column
                                                                                                : column.field;

                                                                                        return (
                                                                                            <TableCell key={field || i}>
                                                                                                {detailRow[field] == null
                                                                                                    ? ""
                                                                                                    : String(detailRow[field])}
                                                                                            </TableCell>
                                                                                        );
                                                                                    }
                                                                                )}
                                                                            </TableRow>
                                                                        )
                                                                    )}
                                                                </TableBody>
                                                            </Table>
                                                        )}
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                );
                            })}

                            {!pagedRows.length && (
                                <TableRow>
                                    <TableCell
                                        colSpan={masterColumns.length + 1}
                                        align="center"
                                    >
                                        No records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <TablePagination
                component="div"
                count={filteredRows.length}
                page={page}
                onPageChange={(event, nextPage) =>
                    setPage(nextPage)
                }
                rowsPerPage={pageSize}
                onRowsPerPageChange={event => {
                    setPageSize(Number(event.target.value));
                    setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
            />

        </Paper>
    );
}
