import React from "react";

import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Button,
    Typography
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";


const COMPONENT_GROUPS = [

    {
        type: "layout",
        label: "Layout",
        components: [
            { type: "container", label: "Container" },
            { type: "accordion", label: "Accordion" }
        ]
    },

    {
        type: "data",
        label: "Data",
        components: [
            { type: "stat", label: "Stat" },
            { type: "chart", label: "Chart" },
            { type: "table", label: "Table" },
            { type: "datagrid", label: "Data Grid" },
            { type: "detail", label: "Detail" },
            { type: "detailGrid", label: "Detail Grid" }
        ]
    },

    {
        type: "form",
        label: "Form",
        components: [
            { type: "textfield", label: "Text Field" },
            { type: "select", label: "Select" },
            { type: "datePicker", label: "Date Picker" },
            { type: "multiselect", label: "Multi Select" },
            { type: "radio", label: "Radio" },
            { type: "checkbox", label: "Checkbox" },
            { type: "typography", label: "Typography" },
            { type: "button", label: "Button" }
        ]
    }

];


export default function ComponentPalette({ onAdd }) {

    return (

        <Box
            sx={{
                p: 2,
                borderRight: "1px solid #ddd",
                height: "100%",
                bgcolor: "#fafafa"
            }}
        >

            <Typography
                variant="h6"
                gutterBottom
            >
                Components
            </Typography>


            {COMPONENT_GROUPS.map(
                (group, index) => (

                    <Accordion
                        key={group.type}
                        defaultExpanded={
                            index === 0
                        }
                        disableGutters
                        elevation={0}
                        sx={{
                            bgcolor: "transparent",
                            "&:before": {
                                display: "none"
                            }
                        }}
                    >

                        <AccordionSummary
                            expandIcon={
                                <ExpandMoreIcon />
                            }
                            sx={{
                                minHeight: 40,
                                px: 1,

                                "& .MuiAccordionSummary-content":
                                    {
                                        my: 1
                                    }
                            }}
                        >

                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                            >
                                {group.label}
                            </Typography>

                        </AccordionSummary>


                        <AccordionDetails
                            sx={{
                                px: 0,
                                pt: 0
                            }}
                        >

                            {group.components.map(
                                component => (

                                    <Button
                                        key={
                                            component.type
                                        }
                                        variant="outlined"
                                        fullWidth
                                        sx={{
                                            mb: 1
                                        }}
                                        onClick={() =>
                                            onAdd(
                                                component.type
                                            )
                                        }
                                    >
                                        + {component.label}
                                    </Button>

                                )
                            )}

                        </AccordionDetails>

                    </Accordion>

                )
            )}

        </Box>

    );
}
