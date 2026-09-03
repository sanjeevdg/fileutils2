import React from "react";

import {
    Box,
    Typography,
    Grid
} from "@mui/material";

import WidgetRenderer from "./WidgetRenderer";

export default function DashboardRenderer({
    node,
    context = {},
    handlers = {}
}) {

    console.log("DASHBOARD NODE:", node);
    console.log("DASHBOARD WIDGETS:", node?.widgets);

    return (
        <Box
            sx={{
                maxWidth: node?.props?.maxWidth || "xl",
                mx: "auto",
                py: 3,
                ...(node?.props?.sx || {})
            }}
        >

            {/* Dashboard title */}
            <Typography variant="h4" gutterBottom>
                {node?.title || "Dashboard"}
            </Typography>


            {/* Generic dashboard widgets */}
            {node?.widgets?.length > 0 && (
                <Grid container spacing={2}>

                    {node.widgets.map((widget, index) => (
                        <Grid
                            key={widget.id || index}
                            size={
                                widget.type === "table" ||
                                widget.type === "detail"
                                    ? { xs: 12 }
                                    : { xs: 12, sm: 6, md: 3 }
                            }
                        >

                            <WidgetRenderer
                                widget={widget}
                                context={context}
                                handlers={handlers}
                            />

                        </Grid>
                    ))}

                </Grid>
            )}

        </Box>
    );
}