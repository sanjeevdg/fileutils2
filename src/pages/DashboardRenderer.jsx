import React from "react";

import {
    Box,
    Typography,
    Grid, Button
} from "@mui/material";

import WidgetRenderer from "./WidgetRenderer";

export default function DashboardRenderer({
    node,
    context = {},
    handlers = {},
    onWidgetSelect = null,
    onWidgetMove,
    selectedWidgetId = null
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

                                {node.widgets.map((widget, index) => {

                                        const isSelected =
                                            widget.id === selectedWidgetId;

                                        return (
                                            <Grid
                                                key={widget.id || index}
                                                size={widget.layout || { xs: 12 }}

                                                onClick={(event) => {

                                                    if (onWidgetSelect) {

                                                        event.stopPropagation();

                                                        onWidgetSelect(widget);
                                                    }

                                                }}

                                                sx={{
                                                    ...(onWidgetSelect
                                                        ? {
                                                            cursor: "pointer"
                                                        }
                                                        : {}),

                                                    ...(isSelected
                                                        ? {
                                                            outline: "2px solid",
                                                            outlineOffset: "2px",
                                                            borderRadius: 1
                                                        }
                                                        : {
                                                            outline: "1px solid transparent"
                                                        }),

                                                    "&:hover": onWidgetSelect
                                                        ? {
                                                            outline: "2px solid",
                                                            outlineOffset: "2px"
                                                        }
                                                        : undefined
                                                }}
                                            >

                                                {/* Re-order controls */}

                                                {onWidgetMove && isSelected && (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "flex-end",
                                                            alignItems: "center",
                                                            gap: 0.5,
                                                            mb: 0.5
                                                        }}
                                                    >

                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{ mr: 0.5 }}
                                                        >
                                                            {widget.type}
                                                        </Typography>

                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            disabled={index === 0}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                onWidgetMove(index, "up");
                                                            }}
                                                        >
                                                            ↑
                                                        </Button>

                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            disabled={
                                                                index ===
                                                                node.widgets.length - 1
                                                            }
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                onWidgetMove(index, "down");
                                                            }}
                                                        >
                                                            ↓
                                                        </Button>

                                                    </Box>
                                                )}

                                                <WidgetRenderer
                                                    widget={widget}
                                                    context={context}
                                                    handlers={handlers}
                                                    onSelect={onWidgetSelect}
                                                />

                                            </Grid>
                                        );
                                    })}

                </Grid>

            )}

        </Box>
    );
}
