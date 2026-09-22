import React from "react";
import { Box, Button, Typography } from "@mui/material";

const COMPONENTS = [
    { type: "stat", label: "Stat" },
    { type: "chart", label: "Chart" },
    { type: "table", label: "Table" },
    { type: "datagrid", label: "Data Grid" },
    { type: "detail", label: "Detail" },

    { type: "textfield", label: "Text Field" },
    { type: "select", label: "Select" },
    { type: "radio", label: "Radio" },
    { type: "checkbox", label: "Checkbox" },

    { type: "typography", label: "Typography" },
    { type: "button", label: "Button" }
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
            <Typography variant="h6" gutterBottom>
                Components
            </Typography>

            {COMPONENTS.map(component => (
                <Button
                    key={component.type}
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 1 }}
                    onClick={() => onAdd(component.type)}
                >
                    + {component.label}
                </Button>
            ))}
        </Box>
    );
}

