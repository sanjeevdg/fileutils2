import {
    TextField,
    Checkbox,
    FormControlLabel,
    Button
} from "@mui/material";

import { useEffect, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { API_URL } from "../config";

export default function FormRenderer() {

console.log("FormRenderer rendered");

    const [config, setConfig] = useState(null);
    const [formData, setFormData] = useState({});
    const [rows, setRows] = useState([]);
    const [errors, setErrors] = useState({});
  async function loadRows() {

        const response = await fetch(
            `${API_URL}/api/users`
        );

        const data = await response.json();

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

    const response = await fetch(`${API_URL}/api/config`);

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


const columns = config.table.columns.map(name => ({
    field: name,
    headerName: name.replace("_", " "),
    flex: 1
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



async function saveUser() {


console.log("Save clicked");

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

        <div>

            <h2>{/* config.app.title */}</h2>

            {entity.fields.map(field => {




                switch(field.type) {

                    case "text":

                        return (
                            <TextField
                                key={field.name}
                                label={field.label}
                                fullWidth
                                margin="normal"
                                 value={formData[field.name] || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        [field.name]: e.target.value
                                    })
                                }
                            />
                        );

                    case "number":

                        return (
                            <TextField
                                key={field.name}
                                label={field.label}
                                type="number"
                                fullWidth
                                margin="normal"
                                 value={formData[field.name] || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        [field.name]: Number(e.target.value)
                                    })
                                }
                            />
                        );

                    case "checkbox":

                        return (
                            <FormControlLabel
                                key={field.name}
                                control={<Checkbox checked={formData[field.name] || false}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    [field.name]: e.target.checked
                                })
                            }
        />}
                                label={field.label}
                            />
                        );

                        case "email":

    return (
        <TextField
            key={field.name}
            label={field.label}
            type="email"
            fullWidth
            margin="normal"
            value={formData[field.name] || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        [field.name]: e.target.value
                                    })
                                }
            error={!!errors[field.name]}
            helperText={errors[field.name] || ""}
                       
        />
    );



                    default:
                        return null;
                }

            })}

          <div style={{ marginTop: 20 }}>

    {config.buttons.map(button => (

        <Button
            key={button}
            variant="contained"
            style={{ marginRight: 10 }}
            onClick={saveUser}
        >
            {button}
        </Button>

    ))}

</div>

<div style={{ height: 400, width: "100%" }}>
    <DataGrid
        rows={rows}
        columns={columns}
    />
</div>
        </div>





    );

}