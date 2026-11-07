
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
            { type: "accordion", label: "Accordion" },
            { type: "tabs", label: "Tabs" }
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
            { type: "images", label: "Multiple Images" },
            { type: "select", label: "Select" },
            { type: "datePicker", label: "Date Picker" },
            { type: "multiselect", label: "Multi Select" },
            { type: "radio", label: "Radio" },
            { type: "checkbox", label: "Checkbox" },
            { type: "typography", label: "Typography" },
            { type: "button", label: "Button" }
        ]
    },

    {
        type: "controls",
        label: "Controls",
        components: [
            { type: "switch", label: "Switch" },
            { type: "modal", label: "Modal" }
        ]
    },

    {
        type: "display",
        label: "Display",
        components: [
            { type: "productCard", label: "Product Card" },
            { type: "payment", label: "Payment / Buy Now" },
            { type: "shoppingCart", label: "Shopping Cart Icon" }
        ]
    }

];


export default function ComponentPalette({ onAdd }) {

    return (

        <Box
            sx={{
                p: 1,
                borderRight: "1px solid #ddd",
                height: "100%",
                bgcolor: "#fafafa"
            }}
        >

            {/* Panel Heading */}

            <Typography
                sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    mb: 1,
                    px: 1
                }}
            >
                Components
            </Typography>


            {/* Component Groups */}

            {COMPONENT_GROUPS.map((group, index) => (

                <Accordion
                    key={group.type}
                    defaultExpanded={index === 0}
                    disableGutters
                    elevation={0}
                    sx={{
                        bgcolor: "transparent",

                        "&:before": {
                            display: "none"
                        },

                        "&.Mui-expanded": {
                            my: 0
                        }
                    }}
                >

                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            minHeight: 32,
                            px: 1,

                            "&.Mui-expanded": {
                                minHeight: 32
                            },

                            "& .MuiAccordionSummary-content": {
                                my: 0.5
                            },

                            "& .MuiAccordionSummary-content.Mui-expanded": {
                                my: 0.5
                            },

                            "& .MuiSvgIcon-root": {
                                fontSize: 18
                            }
                        }}
                    >

                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#333"
                            }}
                        >
                            {group.label}
                        </Typography>

                    </AccordionSummary>


                    <AccordionDetails
                        sx={{
                            px: 0.5,
                            pt: 0,
                            pb: 0.5
                        }}
                    >

                        {group.components.map(component => (

                            <Button
                                key={component.type}
                                variant="text"
                                size="small"
                                fullWidth

                                sx={{
                                    justifyContent: "flex-start",
                                    textAlign: "left",
                                    textTransform: "none",

                                    fontSize: 12.5,
                                    fontWeight: 400,

                                    color: "#444",

                                    minHeight: 27,

                                    px: 1,
                                    py: 0,

                                    mb: 0.25,

                                    borderRadius: 1,

                                    "&:hover": {
                                        bgcolor: "#e8edf5",
                                        color: "#1976d2"
                                    }
                                }}

                                onClick={() => onAdd(component.type)}
                            >
                                + {component.label}
                            </Button>

                        ))}

                    </AccordionDetails>

                </Accordion>

            ))}

        </Box>

    );

}
