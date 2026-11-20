
import React, {
    useEffect,
    useState,
    useMemo
} from "react";

import {
    Paper,
    Box,
    Typography,
    TextField,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    Checkbox,
    FormControl,FormControlLabel,
    Button
} from "@mui/material";

import {
    DataGrid,
    useGridApiContext
} from "@mui/x-data-grid";


import {
    ThemeProvider,
    createTheme
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import RefreshIcon from "@mui/icons-material/Refresh";
import MultiImageEditor from "./MultiImageEditor";

import { getAuthHeaders } from "../utils/auth";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";


// --------------------------------------------------
// CELL EDITOR
// --------------------------------------------------


function EditableCell(props) {

    const {
        id,
        field,
        value,
        editor,
        options = [],
        hasFocus
    } = props;

    const apiRef = useGridApiContext();

    const [localValue, setLocalValue] = useState(
        value ?? ""
    );

    useEffect(() => {
        setLocalValue(value ?? "");
    }, [value]);


    // UPDATE VALUE

    const updateValue = async (newValue) => {

        setLocalValue(newValue);

        return await apiRef.current.setEditCellValue({
            id,
            field,
            value: newValue
        });
    };


    // FINISH EDITING

    const finishEditing = () => {

        apiRef.current.stopCellEditMode({
            id,
            field
        });
    };


    // SELECT EDITOR

    if (editor === "select") {

        return (

            <FormControl
                size="small"
                fullWidth
            >

                <Select
                    value={localValue ?? ""}
                    autoFocus={hasFocus}
                    fullWidth

                    onChange={async (event) => {

                        const result = await updateValue(
                            event.target.value
                        );

                        if (result !== false) {
                            finishEditing();
                        }

                    }}

                    sx={{
                            bgcolor: "background.paper",
                            color: "text.primary",

                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "divider"
                            },

                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "text.secondary"
                            },

                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "primary.main"
                            }
                        }}

                    MenuProps={{
                            PaperProps: {
                                sx: {
                                    bgcolor: "background.paper",
                                    color: "text.primary",

                                    "& .MuiMenuItem-root:hover": {
                                        bgcolor: "action.hover"
                                    },

                                    "& .MuiMenuItem-root.Mui-selected": {
                                        bgcolor: "action.selected"
                                    }
                                }
                            }
                        }}    

                >

                    {options.map((option, index) => {

                        const optionValue =
                            typeof option === "object"
                                ? option.value
                                : option;

                        const optionLabel =
                            typeof option === "object"
                                ? option.label
                                : option;

                        return (

                            <MenuItem
                                key={index}
                                value={optionValue}
                            >
                                {optionLabel}
                            </MenuItem>

                        );

                    })}

                </Select>

            </FormControl>

        );
    }


    // CHECKBOX EDITOR

    if (editor === "checkbox") {

        return (

            <Checkbox
                checked={Boolean(localValue)}
                autoFocus={hasFocus}

                onChange={async (event) => {

                    await updateValue(
                        event.target.checked
                    );

                    finishEditing();

                }}
            />

        );
    }


    // DATE / NUMBER / TEXT EDITORS

    // DATE / NUMBER / MULTILINE / TEXT EDITORS

const inputType =
    editor === "number"
        ? "number"
        : editor === "date"
            ? "date"
            : "text";

const isMultiline = editor === "multiline";

return (
    <TextField
        fullWidth
        size="small"
        variant="outlined"
        type={inputType}
        value={localValue}
        autoFocus={hasFocus}

        multiline={isMultiline}
        minRows={isMultiline ? 4 : 1}
        maxRows={isMultiline ? 10 : 1}

        onChange={(event) => {

            setLocalValue(event.target.value);

            updateValue(event.target.value);

        }}

        onBlur={finishEditing}

        onKeyDown={(event) => {

            if (event.key === "Enter" && !isMultiline) {
                finishEditing();
            }

            if (event.key === "Escape") {

                apiRef.current.stopCellEditMode({
                    id,
                    field,
                    ignoreModifications: true
                });

            }

        }}

        sx={{
            "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                color: "text.primary",

                "& fieldset": {
                    borderColor: "divider"
                },

                "&:hover fieldset": {
                    borderColor: "text.secondary"
                },

                "&.Mui-focused fieldset": {
                    borderColor: "primary.main"
                }
            },

            "& .MuiInputBase-input": {
                color: "text.primary"
            }
        }}
    />
);
}


// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function EditableDataGridRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    const source = widget?.source || {};

    const props = widget?.props || {};

    const entity = source.entity || "";

    const columns = source.columns || [];

    const limit = source.limit || 10;

    const pageSize = props.pageSize || 10;

    const [rows, setRows] = useState([]);

    const [loading, setLoading] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    
    const [imageDialog, setImageDialog] = useState(null);

    const [message, setMessage] = useState("");

    const [searchText, setSearchText] = useState("");

    const [refreshKey, setRefreshKey] = useState(0);

    const dataVersion = context?.dataVersion || 0;

    const [darkMode, setDarkMode] = useState(false);

    const gridTheme = useMemo(() =>

        createTheme({
            palette: {
                mode: darkMode ? "dark" : "light"
            }
        }),

        [darkMode]

    );
    // --------------------------------------------------
    // LOAD RECORDS
    // --------------------------------------------------

    useEffect(() => {

        let cancelled = false;

        const loadData = async () => {

            if (!entity) {
                setRows([]);
                return;
            }

            try {

                setLoading(true);
                setError("");
                setMessage("");

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
                        `Request failed: ${response.status}`
                    );
                }

                const result = await response.json();

                if (cancelled) return;

                const records = Array.isArray(result)
                    ? result
                    : [];
//slice(0, limit).
                setRows(
                    records.map(
                        (row, index) => ({
                            ...row,
                            _gridId: row.id ?? index
                        })
                    )
                );

            } catch (err) {

                if (!cancelled) {
                    setError(err.message);
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

    }, [
        entity,
        limit,
        refreshKey,
        dataVersion
    ]);


    // --------------------------------------------------
    // SAVE UPDATED RECORD
    // --------------------------------------------------

    const processRowUpdate = async (
        updatedRow,
        originalRow
    ) => {

        const recordId = updatedRow.id;

        if (!recordId) {
            throw new Error(
                "Cannot save this record: missing ID."
            );
        }

        const changedFields = {};

        Object.keys(updatedRow).forEach(field => {

            if (
                field === "_gridId" ||
                field === "id"
            ) {
                return;
            }

            if (
                updatedRow[field] !==
                originalRow[field]
            ) {
                changedFields[field] =
                    updatedRow[field];
            }

        });

        if (Object.keys(changedFields).length === 0) {
            return originalRow;
        }

        try {

            setSaving(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/api/${entity}/${recordId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders()
                    },

                    body: JSON.stringify(changedFields)
                }
            );

            if (!response.ok) {

                let detail = "";

                try {
                    const result = await response.json();
                    detail = result.detail || "";
                } catch {
                    // Ignore response parsing errors.
                }

                throw new Error(
                    detail ||
                    `Save failed: ${response.status}`
                );
            }

            const result = await response.json();

            // Support either a returned record or a
            // simple success response.

            const savedRow =
                result &&
                typeof result === "object" &&
                !Array.isArray(result) &&
                result.id !== undefined
                    ? result
                    : updatedRow;

            setRows(previous =>
                previous.map(row =>
                    row.id === recordId
                        ? {
                            ...savedRow,
                            _gridId: recordId
                        }
                        : row
                )
            );

            setMessage("Changes saved successfully.");

            return {
                ...savedRow,
                _gridId: recordId
            };

        } catch (err) {

            setError(err.message);

            throw err;

        } finally {

            setSaving(false);

        }
    };



    const updateRowImages = (recordId, field, images) => {

        setRows(previous =>
            previous.map(row =>
                row.id === recordId
                    ? {
                        ...row,
                        [field]: images
                    }
                    : row
            )
        );

    };

    // --------------------------------------------------
    // GRID COLUMNS
    // --------------------------------------------------

    const gridColumns = columns.map(column => {

        const field = column.field;

        const editor = column.editor || "text";

        const label =
            column.headerName ||
            column.label ||
            field;

        return {

            field,

            headerName: label,

            flex: column.flex || 1,

            minWidth: column.minWidth || 130,

            editable:
                source.editable !== false &&
                editor !== "image" &&
                column.editable !== false,

            sortable: true,

            renderCell: (params) => {

                const value = params.value;

                if (editor === "checkbox") {

                    return (
                        <Checkbox
                            checked={Boolean(value)}
                            disabled
                            size="small"
                        />
                    );
                }

                if (editor === "date") {

                    return value
                        ? String(value).slice(0, 10)
                        : "";
                }

                if (editor === "select") {

                    const selectedOption =
                        (column.options || []).find(
                            option => {

                                const optionValue =
                                    typeof option === "object"
                                        ? option.value
                                        : option;

                                return optionValue === value;
                            }
                        );

                    return selectedOption
                        ? typeof selectedOption === "object"
                            ? selectedOption.label
                            : selectedOption
                        : value ?? "";
                }

                return value ?? "";
            },
            renderCell: (params) => {

                    if (editor === "image") {

                        const imageCount = Array.isArray(params.value)
                            ? params.value.length
                            : 0;

                        return (
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{
                                    borderColor: "primary.main",
                                    color: "primary.main",
                                    "&:hover": {
                                        bgcolor: "action.hover",
                                        borderColor: "primary.main"
                                    }
                                }}
                                onClick={() => {

                                    setImageDialog({
                                        rowId: params.row.id,
                                        field,
                                        maxImages: column.maxImages || 10
                                    });

                                }}
                            >
                                Images ({imageCount})
                            </Button>
                        );
                    }

                    // Keep your existing renderCell logic here.
                },
            renderEditCell: (params) => (

                <EditableCell
                    {...params}
                    editor={editor}
                    options={column.options || []}
                />

            )

        };

    });


    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------

    const filteredRows = rows.filter(row => {

        if (!searchText.trim()) return true;

        const search = searchText.toLowerCase();

        return columns.some(column => {

            const value = row[column.field];

            return String(value ?? "")
                .toLowerCase()
                .includes(search);

        });

    });


    // --------------------------------------------------
    // ERROR / EMPTY STATES
    // --------------------------------------------------

    if (!entity) {

        return (
            <Typography color="text.secondary">
                Select an entity for this Editable Data Grid.
            </Typography>
        );
    }


    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
         <ThemeProvider theme={gridTheme}>
        <Paper
            elevation={2}
            sx={{
                p: 2,
                mt: 2,
                width: "100%",
                bgcolor: "background.paper",
                color: "text.primary",
                border: 1,
                borderColor: "divider"
            }}
        >

            {/* HEADER */}

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

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                    }}
                >

                    {saving && (
                        <CircularProgress size={18} />
                    )}
                    <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>

                        <IconButton
                            size="small"
                            onClick={() => setDarkMode(previous => !previous)}
                            color="inherit"
                        >

                            {darkMode
                                ? <LightModeIcon />
                                : <DarkModeIcon />
                            }

                        </IconButton>

                    </Tooltip>
                    <Tooltip title="Refresh">

                        <IconButton
                            size="small"
                            onClick={() => {
                                setRefreshKey(
                                    previous => previous + 1
                                );
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>

                    </Tooltip>

                </Box>

            </Box>


            {/* SEARCH */}

            {props.showSearch !== false && (

                <TextField
                    size="small"
                    fullWidth
                    placeholder="Search records..."
                    value={searchText}
                    onChange={event =>
                        setSearchText(event.target.value)
                    }
                    sx={{
                        mb: 2,

                        "& .MuiOutlinedInput-root": {
                            bgcolor: "background.paper",
                            color: "text.primary"
                        },

                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "divider"
                        }
                    }}
                />

            )}


            {/* MESSAGES */}

            {error && (

                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>

            )}

            {message && (

                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setMessage("")}
                >
                    {message}
                </Alert>

            )}


            {/* GRID */}

            {loading ? (

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        p: 4
                    }}
                >
                    <CircularProgress />
                </Box>

            ) : (

                <DataGrid

                    rows={filteredRows}

                    columns={gridColumns}

                    getRowId={row => row._gridId}

                    autoHeight


                    getRowHeight={() => "auto"}

                    editMode="cell"

                    processRowUpdate={processRowUpdate}

                    onProcessRowUpdateError={err => {
                        setError(err.message);
                    }}

                    pageSizeOptions={[5, 10, 25, 50]}

                    initialState={{
                        pagination: {
                            paginationModel: {
                                page: 0,
                                pageSize
                            }
                        }
                    }}

                    disableRowSelectionOnClick

                    sx={{
                            border: 1,
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            color: "text.primary",

                            // COLUMN HEADERS
                            "& .MuiDataGrid-columnHeaders": {
                                bgcolor: "background.default",
                                color: "text.primary",
                                borderBottom: 1,
                                borderColor: "divider"
                            },

                            "& .MuiDataGrid-columnHeaderTitle": {
                                fontWeight: 600
                            },

                            // ROWS
                            "& .MuiDataGrid-row": {
                                bgcolor: "background.paper"
                            },

                            "& .MuiDataGrid-row:hover": {
                                bgcolor: "action.hover"
                            },

                            // CELLS
                            "& .MuiDataGrid-cell": {
                                display: "flex",
                                alignItems: "center",
                                minHeight: "52px",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                borderColor: "divider",
                                color: "text.primary"
                            },

                            // EDITING
                            "& .MuiDataGrid-cell--editing": {
                                bgcolor: "action.selected",
                                alignItems: "flex-start"
                            },

                            "& .MuiDataGrid-editInputCell": {
                                alignItems: "flex-start"
                            },

                            // SELECTED ROW
                            "& .MuiDataGrid-row.Mui-selected": {
                                bgcolor: "action.selected"
                            },

                            "& .MuiDataGrid-row.Mui-selected:hover": {
                                bgcolor: "action.hover"
                            },

                            // FOOTER / PAGINATION
                            "& .MuiDataGrid-footerContainer": {
                                borderTop: 1,
                                borderColor: "divider",
                                color: "text.primary"
                            },

                            // CHECKBOXES
                            "& .MuiCheckbox-root": {
                                color: "text.secondary"
                            },

                            // TOOLBAR ICONS
                            "& .MuiIconButton-root": {
                                color: "text.secondary"
                            },

                            // SCROLLBAR
                            "& .MuiDataGrid-scrollbar": {
                                scrollbarColor: "auto"
                            }
                        }}

                />

            )}

                    {imageDialog && (

                        <MultiImageEditor

                            open={true}

                            onClose={() => setImageDialog(null)}

                            entity={entity}

                            recordId={imageDialog.rowId}

                            field={imageDialog.field}

                            images={
                                rows.find(
                                    row => row.id === imageDialog.rowId
                                )?.[imageDialog.field] || []
                            }

                            maxImages={imageDialog.maxImages}

                            onImagesChange={(images) => {

                                updateRowImages(
                                    imageDialog.rowId,
                                    imageDialog.field,
                                    images
                                );

                            }}

                        />

                    )}


        </Paper>
    </ThemeProvider>
    );
}
