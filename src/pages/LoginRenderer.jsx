import React, { useState,useEffect } from "react";

import {
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Box,
    Typography,
    Paper,
    Alert
} from "@mui/material";

import { API_URL } from "../config";

export default function LoginRenderer({ }) {

    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState(null);

    function updateField(name, value) {

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

    }

async function handleButton(button) {

    switch (button.action) {

        case "login":
            await login();
            break;

        case "cancel":
            setFormData({});
            break;

        default:
            console.log(
                "Unknown button action:",
                button.action
            );
    }

}
   async function loadYaml() {

    const response = await fetch(`${API_URL}/api/config?name=login`);

    const config = await response.json();

    setConfig(config);
    
}
useEffect(() => {

    async function initialize() {

        await loadYaml();

     //   await loadRows();

    }

    initialize();

}, []);
   async function login() {

    console.log("Login data:", formData);

    if (!formData.email) {
        alert("Email is required");
        return;
    }

    if (!formData.password) {
        alert("Password is required");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(formData)
            }
        );

        const result = await response.json();

        console.log("Login result:", result);

        if (!response.ok) {

            alert(
                result.detail ||
                "Login failed"
            );

            return;
        }

        alert("Login successful");

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Unable to connect to server"
        );
    }
}


    function handleCancel() {

        setFormData({});
        setError("");

    }


    if (!config) {
        return <div>Loading...</div>;
    }


    return (

        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >

            <Paper
                elevation={4}
                sx={{
                    width: 400,
                    padding: 4
                }}
            >

                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                >
                    {config.app?.title || "Login"}
                </Typography>


                {config.app?.subtitle && (

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ mb: 3 }}
                    >
                        {config.app.subtitle}
                    </Typography>

                )}


                {error && (

                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                    >
                        {error}
                    </Alert>

                )}


                {config.fields.map(field => {

                    switch (field.type) {

                        case "email":

                            return (

                                <TextField
                                    key={field.name}
                                    label={field.label}
                                    type="email"
                                    value={
                                        formData[field.name] || ""
                                    }
                                    required={field.required}
                                    fullWidth
                                    margin="normal"

                                    onChange={(e) =>
                                        updateField(
                                            field.name,
                                            e.target.value
                                        )
                                    }
                                />

                            );


                        case "password":

                            return (

                                <TextField
                                    key={field.name}
                                    label={field.label}
                                    type="password"
                                    value={
                                        formData[field.name] || ""
                                    }
                                    required={field.required}
                                    fullWidth
                                    margin="normal"

                                    onChange={(e) =>
                                        updateField(
                                            field.name,
                                            e.target.value
                                        )
                                    }
                                />

                            );


                        case "checkbox":

                            return (

                                <FormControlLabel
                                    key={field.name}

                                    control={
                                        <Checkbox
                                            checked={
                                                formData[field.name] || false
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

                            );


                        default:
                            return null;

                    }

                })}


                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        marginTop: 3
                    }}
                >

                    {config.buttons.map(button => (

                        <Button
                            key={button.name}
                            variant={
                                button.type === "submit"
                                    ? "contained"
                                    : "outlined"
                            }

                            fullWidth

                            disabled={loading}

                            onClick={() => handleButton(button)}
                        >
                            {loading && button.type === "submit"
                                ? "Logging in..."
                                : button.label}
                        </Button>

                    ))}

                </Box>

            </Paper>

        </Box>

    );

}