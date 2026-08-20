import React, { useEffect, useState } from "react";

import {
    Box,
    CircularProgress,
    Alert
} from "@mui/material";


import FormRenderer from './FormRenderer';

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";


export default function PasswordPage() {

    /*
    =====================================================
    YAML CONFIG
    =====================================================
    */

    const [
        config,
        setConfig
    ] = useState(null);


    /*
    =====================================================
    FORM
    =====================================================
    */

    const [
        passwordForm,
        setPasswordForm
    ] = useState({

        email: "",
        current_password: "",
        new_password: "",
        confirm_password: ""

    });


    /*
    =====================================================
    UI STATE
    =====================================================
    */

    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        error,
        setError
    ] = useState(null);


    const [
        message,
        setMessage
    ] = useState(null);


    /*
    =====================================================
    LOAD YAML
    =====================================================
    */

    async function loadYaml() {

        const response =
            await fetch(
                `${API_URL}/api/config?name=forgot_password`
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load configuration: ${response.status}`
            );

        }


        const config =
            await response.json();


        setConfig(config);

        return config;
    }


    /*
    =====================================================
    INITIALIZE
    =====================================================
    */

    useEffect(() => {

        async function initialize() {

            try {

                setLoading(true);
                setError(null);

                await loadYaml();

            }
            catch (err) {

                console.error(err);

                setError(
                    err.message
                );

            }
            finally {

                setLoading(false);

            }

        }


        initialize();

    }, []);


    /*
    =====================================================
    FORM BINDING
    =====================================================
    */

    function handleBindingChange(binding, value) {

        if (!binding.startsWith("passwordForm.")) {
            return;
        }

        const fieldName = binding.substring(
            "passwordForm.".length
        );

        setPasswordForm(previous => ({
            ...previous,
            [fieldName]: value
        }));
    }


    /*
    =====================================================
    FORGOT PASSWORD
    =====================================================
    */

    async function forgotPassword() {

        setError(null);
        setMessage(null);


        if (!passwordForm.email) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        try {

            setSaving(true);


            const response =
                await fetch(
                    `${API_URL}/api/forgot-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email:
                                passwordForm.email
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Unable to process password reset."
                );

            }


            setMessage(
                data.message ||
                "If the email exists, password reset instructions have been sent."
            );

        }
        catch (err) {

            console.error(err);

            setError(
                err.message
            );

        }
        finally {

            setSaving(false);

        }

    }


    /*
    =====================================================
    CHANGE PASSWORD
    =====================================================
    */

    async function changePassword() {

        setError(null);
        setMessage(null);


        if (!passwordForm.email) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        if (!passwordForm.current_password) {

            setError(
                "Please enter your current password."
            );

            return;
        }


        if (!passwordForm.new_password) {

            setError(
                "Please enter a new password."
            );

            return;
        }


        if (
            passwordForm.new_password !==
            passwordForm.confirm_password
        ) {

            setError(
                "New passwords do not match."
            );

            return;
        }


        if (
            passwordForm.new_password.length < 8
        ) {

            setError(
                "New password must contain at least 8 characters."
            );

            return;
        }


        try {

            setSaving(true);


            const response =
                await fetch(
                    `${API_URL}/api/change-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify(
                            passwordForm
                        )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Unable to change password."
                );

            }


            setMessage(
                data.message ||
                "Password changed successfully."
            );


            setPasswordForm(
                previous => ({
                    ...previous,
                    current_password: "",
                    new_password: "",
                    confirm_password: ""
                })
            );

        }
        catch (err) {

            console.error(err);

            setError(
                err.message
            );

        }
        finally {

            setSaving(false);

        }

    }


    /*
    =====================================================
    CANCEL
    =====================================================
    */

    function cancel() {

        setPasswordForm({
            email: "",
            current_password: "",
            new_password: "",
            confirm_password: ""
        });

        setError(null);
        setMessage(null);

    }


    /*
    =====================================================
    CONTEXT
    =====================================================
    */

    const context = {

        passwordForm

    };


    /*
    =====================================================
    HANDLERS
    =====================================================
    */

    const handlers = {

        handleBindingChange,

        forgotPassword,

        changePassword,

        cancel

    };


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {

        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "50vh"
                }}
            >

                <CircularProgress />

            </Box>
        );

    }


    /*
    =====================================================
    ERROR LOADING YAML
    =====================================================
    */

    if (error && !config) {

        return (
            <Alert severity="error">
                {error}
            </Alert>
        );

    }


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (

        <>

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2
                    }}
                >
                    {error}
                </Alert>
            )}


            {message && (
                <Alert
                    severity="success"
                    sx={{
                        mb: 2
                    }}
                >
                    {message}
                </Alert>
            )}


            {config && (
                <FormRenderer
                    node={config.page}
                    context={context}
                    handlers={handlers}
                />
            )}


            {saving && (
                <CircularProgress
                    size={24}
                    sx={{
                        position: "fixed",
                        bottom: 20,
                        right: 20
                    }}
                />
            )}

        </>
    );
}