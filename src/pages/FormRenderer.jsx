import {
    TextField,
    Checkbox,
    FormControlLabel,
    Button
} from "@mui/material";

import { useEffect, useState } from "react";
//import { load } from "js-yaml";
import { DataGrid } from '@mui/x-data-grid';
//export default function FormRenderer({config}) {



export default function FormRenderer() {

console.log("FormRenderer rendered");

    const [config, setConfig] = useState(null);

    useEffect(() => {

        console.log("useEffect running");

        async function loadYaml() {

            console.log("About to fetch...");

            const response = await fetch("http://127.0.0.1:8000/api/config");

            console.log("Response:", response.status);

            const config = await response.json();

            console.log(config);

            setConfig(config);
        }

        loadYaml();

    }, []);

  if (!config) {
    return <div>Loading...</div>;
}


const columns = config.table.columns.map(name => ({
    field: name,
    headerName: name.replace("_", " "),
    flex: 1
}));

const rows = [
    {
        id: 1,
        first_name: "John",
        last_name: "Smith",
        age: 35,
        active: true
    },
    {
        id: 2,
        first_name: "Jane",
        last_name: "Brown",
        age: 29,
        active: false
    }
];

    return (

        <div>

            <h2>{/* config.app.title */}</h2>

            {config.fields.map(field => {

                switch(field.type) {

                    case "text":

                        return (
                            <TextField
                                key={field.name}
                                label={field.label}
                                fullWidth
                                margin="normal"
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
                            />
                        );

                    case "checkbox":

                        return (
                            <FormControlLabel
                                key={field.name}
                                control={<Checkbox />}
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
        />
    );



                    default:
                        return null;
                }

            })}

            <Button variant="contained">
                Save
            </Button>

<div style={{ height: 400, width: "100%" }}>
    <DataGrid
        rows={rows}
        columns={columns}
    />
</div>
        </div>





    );

}