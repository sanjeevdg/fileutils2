import React, {
    createContext,
    useContext,
    useState
} from "react";

import {
    Box,
    Typography
} from "@mui/material";

import WidgetRenderer from "./WidgetRenderer";


const FormContext = createContext(null);


export function useFormContext() {

    return useContext(FormContext);

}


export default function FormRendererV2({
    node,
    context = {},
    handlers = {}
}) {

    const [formValues, setFormValues] =
        useState({});


    const updateField = (
        field,
        value
    ) => {

        setFormValues(
            previous => ({
                ...previous,
                [field]: value
            })
        );

    };


    const handleSubmit = (
        event
    ) => {

        event.preventDefault();

        console.log(
            "FORM SUBMITTED:",
            formValues
        );

    };


    const formContext = {

        values: formValues,

        updateField,

        submit: handleSubmit

    };


    return (

        <FormContext.Provider
            value={formContext}
        >

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    maxWidth:
                        node?.props?.maxWidth ||
                        "md",
                    mx: "auto",
                    py: 3,
                    ...(node?.props?.sx || {})
                }}
            >

                <Typography
                    variant="h4"
                    gutterBottom
                >
                    {node?.title || "Form"}
                </Typography>


                {node?.widgets?.map(
                    (widget, index) => (

                        <Box
                            key={
                                widget.id ||
                                index
                            }
                            sx={{
                                mb: 2
                            }}
                        >

                            <WidgetRenderer
                                widget={widget}
                                context={context}
                                handlers={handlers}
                            />

                        </Box>

                    )
                )}

            </Box>

        </FormContext.Provider>

    );

}