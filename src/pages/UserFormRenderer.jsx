
import {
    TextField,
    Checkbox,
    FormControlLabel,
    Button,
    Box,
    Paper,
    Typography,
    Stack,
    Grid,
    MenuItem,
    Autocomplete
} from "@mui/material";

import { useEffect, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { API_URL } from "../config";



    import {
        DateTimePicker
    } from "@mui/x-date-pickers/DateTimePicker";

import {
    LocalizationProvider
} from "@mui/x-date-pickers";

import {
    AdapterDayjs
} from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";


export default function UserFormRenderer() {

console.log("FormRenderer rendered");

    const [config, setConfig] = useState(null);
   // const [formData, setFormData] = useState({});
    const [rows, setRows] = useState([]);
    const [errors, setErrors] = useState({});




const [formData, setFormData] = useState({});

function updateField(name, value) {
      console.log(name, value);
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
}


useEffect(() => {
    console.log("formData =", formData);
}, [formData]);


  async function loadRows() {

        const response = await fetch(
            `${API_URL}/api/users`
        );

        const data = await response.json();
console.log('mydata',data);
        setRows(data);
    }

    useEffect(() => {

        loadRows();

    }, []);

function validateForm() {

    const newErrors = {};

    entity.fields.forEach(field => {

        const value = formData[field.name];

        // Required
        if (field.required && !value) {
            newErrors[field.name] = "Required";
            return;
        }

        // Email
        if (
            field.type === "email" &&
            value &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
            newErrors[field.name] = "Invalid email address";
        }

    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
}


  async function loadYaml() {

    const response = await fetch(`${API_URL}/api/config?name=app`);

    const config = await response.json();

    setConfig(config);
    
}

async function loadRows() {

    const response = await fetch(`${API_URL}/api/users`);

    const rows = await response.json();

    setRows(rows);
}

useEffect(() => {

    async function initialize() {

        await loadYaml();

        await loadRows();

    }

    initialize();

}, []);



  if (!config) {
    return <div>Loading...</div>;
}

async function editRecord(row) {

    console.log(row);

    setFormData(row);

}

async function deleteRecord(id) {

    if (!window.confirm("Delete this record?"))
        return;

    await fetch(

        `${API_URL}/api/users/${id}`,

        {

            method: "DELETE"

        }

    );

    await loadRows();

}


const columns = config.entities.users.fields.map(field => ({
    field: field.name,
    headerName: field.label,
    flex: 1,
    editable: true
}));



columns.push({

    field: "actions",

    headerName: "Actions",

    width: 120,

    sortable: false,

    renderCell: (params) => (

        <>

            <IconButton
                color="primary"
                onClick={() => editRecord(params.row)}
            >
                <EditIcon />
            </IconButton>

            <IconButton
                color="error"
                onClick={() => deleteRecord(params.row.id)}
            >
                <DeleteIcon />
            </IconButton>

        </>

    )

});

async function uploadFile(file) {

    const fd = new FormData();

    fd.append("file", file);

    const response = await fetch(

        `${API_URL}/api/upload`,

        {

            method: "POST",

            body: fd

        }

    );

    return await response.json();
    //const result = await uploadFile(file);

    updateField(field.name, result.filename);
}


async function saveUser() {


console.log("Save clicked");
console.log("Saving:", formData);

    if (!validateForm()) {
        console.log("Validation failed");
        return;
    }

    console.log("Validation passed");

    let url;
    let method;

    if (formData.id) {

        url = `${API_URL}/api/users/${formData.id}`;
        method = "PUT";

    } else {

        url = `${API_URL}/api/users`;
        method = "POST";

    }

    await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    await loadRows();

    setFormData({});
}


 if (!config) {
                    return <div>Loading...</div>;
                }

const entity = config.entities.users;

                console.log(config);




    return (

    <Box
        sx={{
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            p: 3
        }}
    >

        {/* Form */}

        <Paper
            elevation={3}
            sx={{
                p: 4,
                borderRadius: 2
            }}
        >

            <Box
                sx={{
                    mb: 3
                }}
            >
                <Typography
                    variant="h5"
                    component="h1"
                    gutterBottom
                >
                    {config.app?.title || "Customer Manager"}
                </Typography>

                {config.app?.subtitle && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {config.app.subtitle}
                    </Typography>
                )}
            </Box>


            {/* Two-column form */}

            <Grid
                container
                spacing={2}
            >

                {entity.fields.map(field => {

                    switch (field.type) {

                        case "text":

                            return (
                                <Grid
                                    key={field.name}
                                    size={{ xs: 12, md: 6 }}
                                >
                                    <TextField
                                        label={field.label}
                                        fullWidth
                                        margin="normal"
                                        value={
                                            formData[field.name] || ""
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                field.name,
                                                e.target.value
                                            )
                                        }
                                    />
                                </Grid>
                            );


                        case "number":

                            return (
                                <Grid
                                    key={field.name}
                                    size={{ xs: 12, md: 6 }}
                                >
                                    <TextField
                                        label={field.label}
                                        type="number"
                                        fullWidth
                                        margin="normal"
                                        value={
                                            formData[field.name] || ""
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                field.name,
                                                e.target.value
                                            )
                                        }
                                    />
                                </Grid>
                            );


                        case "password":

                            return (
                                <Grid
                                    key={field.name}
                                    size={{ xs: 12, md: 6 }}
                                >
                                    <TextField
                                        label={field.label}
                                        type="password"
                                        fullWidth
                                        margin="normal"
                                        value={
                                            formData[field.name] || ""
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                field.name,
                                                e.target.value
                                            )
                                        }
                                    />
                                </Grid>
                            );


                        case "email":

                            return (
                                <Grid
                                    key={field.name}
                                    size={{ xs: 12, md: 6 }}
                                >
                                    <TextField
                                        label={field.label}
                                        type="email"
                                        fullWidth
                                        margin="normal"
                                        value={
                                            formData[field.name] || ""
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                field.name,
                                                e.target.value
                                            )
                                        }
                                        error={
                                            !!errors[field.name]
                                        }
                                        helperText={
                                            errors[field.name] || ""
                                        }
                                    />
                                </Grid>
                            );


                        case "datetime":

                            return (
                                <Grid
                                    key={field.name}
                                    size={{ xs: 12, md: 6 }}
                                    sx={{
                                        mt: 1
                                    }}
                                >
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                    >
                                        <DateTimePicker
                                            label={field.label}
                                            value={
                                                formData[field.name]
                                                    ? dayjs(
                                                        formData[field.name]
                                                    )
                                                    : null
                                            }
                                            onChange={(value) => {

                                                console.log(
                                                    "datetime changed",
                                                    value
                                                );

                                                updateField(
                                                    field.name,
                                                    value
                                                        ? value.toISOString()
                                                        : null
                                                );

                                            }}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            );


                        case "select":

                            return (
                                <Grid
                                    key={field.name}
                                    size={{ xs: 12, md: 6 }}
                                >
                                    <TextField
                                        select
                                        label={field.label}
                                        fullWidth
                                        margin="normal"
                                        value={
                                            formData[field.name] || ""
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                field.name,
                                                e.target.value
                                            )
                                        }
                                    >

                                        {field.options.map(
                                            option => (

                                                <MenuItem
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </MenuItem>

                                            )
                                        )}

                                    </TextField>
                                </Grid>
                            );


                        case "autocomplete":

                            return (
                                <Grid
                                    key={field.name}
                                    size={{ xs: 12, md: 6 }}
                                    sx={{
                                        mt: 1
                                    }}
                                >
                                    <Autocomplete
                                        options={field.options}
                                        value={
                                            formData[field.name] || null
                                        }
                                        onChange={(
                                            event,
                                            value
                                        ) =>
                                            updateField(
                                                field.name,
                                                value
                                            )
                                        }
                                        renderInput={(
                                            params
                                        ) => (
                                            <TextField
                                                {...params}
                                                label={field.label}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                            );


                        case "checkbox":

                            return (
                                <Grid
                                    key={field.name}
                                    size={{ xs: 12, md: 6 }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={
                                                    formData[
                                                        field.name
                                                    ] || false
                                                }
                                                onChange={(e) =>
                                                    updateField(
                                                        field.name,
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label={field.label}
                                    />
                                </Grid>
                            );


                        case "file":

                            return (
                                <Grid
                                    key={field.name}
                                    size={{ xs: 12, md: 6 }}
                                >

                                    <Stack
                                        spacing={1}
                                    >

                                        <Button
                                            variant="outlined"
                                            component="label"
                                            sx={{
                                                width: "fit-content"
                                            }}
                                        >
                                            Upload File

                                            <input
                                                hidden
                                                type="file"
                                                onChange={async (e) => {

                                                    const file =
                                                        e.target.files[0];

                                                    if (!file)
                                                        return;

                                                    const result =
                                                        await uploadFile(
                                                            file
                                                        );

                                                    updateField(
                                                        field.name,
                                                        result.filename
                                                    );

                                                }}
                                            />

                                        </Button>


                                        {formData[field.name] && (

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Uploaded:{" "}
                                                {formData[field.name]}
                                            </Typography>

                                        )}

                                    </Stack>

                                </Grid>
                            );


                        default:
                            return null;

                    }

                })}

            </Grid>


            {/* Buttons */}

            <Stack
                direction="row"
                spacing={2}
                sx={{
                    mt: 4
                }}
            >

                {config.entities.users.buttons.map(
                    button => (

                        <Button
                            key={button}
                            variant="contained"
                            onClick={saveUser}
                        >
                            {button}
                        </Button>

                    )
                )}

            </Stack>

        </Paper>


        {/* DataGrid */}

        <Paper
            elevation={3}
            sx={{
                mt: 4,
                p: 2,
                borderRadius: 2
            }}
        >

            <Typography
                variant="h6"
                sx={{
                    mb: 2
                }}
            >
                Users
            </Typography>

            <Box
                sx={{
                    height: 400,
                    width: "100%"
                }}
            >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10, 25]}
                />
            </Box>

        </Paper>

    </Box>

);

}
