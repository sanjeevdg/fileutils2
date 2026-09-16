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
    handlers = {},
    onWidgetSelect = null
}) {

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

            <Typography
                variant="h4"
                gutterBottom
            >
                {node?.title || "Dashboard"}
            </Typography>


            {/* Dashboard widgets */}

            {node?.widgets?.length > 0 && (

                <Grid
                    container
                    spacing={2}
                >

                    {node.widgets.map(
                        (widget, index) => (

                            <Grid
                                key={
                                    widget.id || index
                                }
                                size={
                                    widget.layout || {
                                        xs: 12
                                    }
                                }

                                onClick={(event) => {

                                    /*
                                     * Only intercept clicks
                                     * when the designer has
                                     * supplied a callback.
                                     */

                                    if (onWidgetSelect) {

                                        event.stopPropagation();

                                        onWidgetSelect(
                                            widget
                                        );
                                    }

                                }}

                                sx={
                                    onWidgetSelect
                                        ? {
                                            cursor: "pointer",
                                            outline:
                                                "1px solid transparent",
                                            "&:hover": {
                                                outline:
                                                    "2px solid",
                                                outlineOffset:
                                                    "2px"
                                            }
                                        }
                                        : undefined
                                }
                            >

                                <WidgetRenderer
                                    widget={widget}
                                    context={context}
                                    handlers={handlers}
                                />

                            </Grid>

                        )
                    )}

                </Grid>

            )}

        </Box>
    );
}
