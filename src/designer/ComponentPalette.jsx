import React from "react";
import { Box, Button, Typography } from "@mui/material";

const COMPONENTS = [
    { type: "stat", label: "Stat" },
    { type: "chart", label: "Chart" },
    { type: "table", label: "Table" },
    { type: "detail", label: "Detail" }
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


