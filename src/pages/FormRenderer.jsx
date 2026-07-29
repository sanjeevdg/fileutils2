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
    const [formData, setFormData] = useState({});
    const [rows, setRows] = useState([]);

useEffect(() => {



async function loadRows() {
//http://127.0.0.1:8000/api/users
    const response = await fetch(
        "https://mypybackend-1.onrender.com/api/users"
    );

    const data = await response.json();

    setRows(data);
}

loadRows();

},[]);



    useEffect(() => {

        console.log("useEffect running");

        async function loadYaml() {

            console.log("About to fetch...");
//https://mypybackend-1.onrender.com/api/config
            //http://127.0.0.1:8000/api/config
            const response = await fetch("https://mypybackend-1.onrender.com/api/config");

            console.log("Response:", response.status);

            const config = await response.json();

            console.log(config);

            setConfig(config);
        }

        loadYaml();

    }, []);


useEffect(() => {

async  function fetchUsers() {

await fetch(
//http://127.0.0.1:8000/api
    "https://mypybackend-1.onrender.com/api/users",

    {

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            first_name:"John",

            last_name:"Smith",

            email:"john@gmail.com",

            active:true

        })

    }

)




}

fetchUsers();





},[]);


  if (!config) {
    return <div>Loading...</div>;
}


const columns = config.table.columns.map(name => ({
    field: name,
    headerName: name.replace("_", " "),
    flex: 1
}));






async function saveUser() {

    try {
//http://127.0.0.1:8000/api
        const response = await fetch(
            "https://mypybackend-1.onrender.com/api/users",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            }
        );

        const result = await response.json();

        console.log(result);

        alert("User saved!");

    } catch (err) {

        console.error(err);

        alert("Save failed");

    }

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