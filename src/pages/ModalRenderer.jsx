
import React, { useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Grid
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import WidgetRenderer from "./WidgetRenderer";

export default function ModalRenderer({
    widget,
    context = {},
    handlers = {},
    onSelect = null
}) {

    const props = widget?.props || {};
    const events = widget?.events || {};
    const children = widget?.children || [];

    const [open, setOpen] = useState(
        props.open ?? props.defaultOpen ?? false
    );

    const handleOpen = () => {

        setOpen(true);

        const action = events.onOpen;

        if (action && handlers?.[action]) {
            handlers[action](widget);
        }
    };

    const handleClose = () => {

        setOpen(false);

        const action = events.onClose;

        if (action && handlers?.[action]) {
            handlers[action](widget);
        }
    };

    const handleAction = (action) => {

        if (action.event && handlers?.[action.event]) {
            handlers[action.event](widget);
        }

        if (action.closeOnClick !== false) {
            setOpen(false);
        }
    };

    return (
        <>
            {/* Modal trigger button */}

            <Button
                variant={props.triggerVariant || "outlined"}
                color={props.triggerColor || "primary"}
                onClick={handleOpen}
                disabled={props.disabled || false}
            >
                {props.triggerText || "Open Modal"}
            </Button>

            {/* Dialog */}

            <Dialog
                open={open}
                onClose={
                    props.closeOnBackdropClick === false
                        ? undefined
                        : handleClose
                }
                fullWidth
                maxWidth={props.maxWidth || "sm"}
            >

                {/* Title */}

                <DialogTitle>

                    {props.title || "Modal"}

                    {props.showCloseButton !== false && (
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: 8
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}

                </DialogTitle>

                {/* Modal Content */}

                <DialogContent dividers>

                    {children.length > 0 ? (

                        <Grid
                            container
                            spacing={2}
                        >

                            {children.map((child, index) => {

                                const { offset, ...gridSize } =
                                    child.layout || { xs: 12 };

                                return (

                                    <Grid
                                        key={child.id || index}
                                        size={gridSize}
                                        offset={
                                            offset != null
                                                ? { md: offset }
                                                : undefined
                                        }
                                        onClick={(event) => {

                                            if (onSelect) {

                                                event.stopPropagation();

                                                onSelect(child, {
                                                    modalId: widget.id
                                                });

                                            }

                                        }}
                                        sx={{
                                            position: "relative",
                                            cursor: onSelect
                                                ? "pointer"
                                                : "default"
                                        }}
                                    >

                                        <WidgetRenderer
                                            widget={child}
                                            context={context}
                                            handlers={handlers}
                                            onSelect={onSelect}
                                        />

                                    </Grid>

                                );

                            })}

                        </Grid>

                    ) : (

                        props.content && (
                            <Typography>
                                {props.content}
                            </Typography>
                        )

                    )}

                </DialogContent>

                {/* Actions */}

                {props.actions?.length > 0 && (

                    <DialogActions>

                        {props.actions.map((action, index) => (

                            <Button
                                key={index}
                                variant={action.variant || "text"}
                                color={action.color || "primary"}
                                onClick={() => handleAction(action)}
                            >
                                {action.label}
                            </Button>

                        ))}

                    </DialogActions>

                )}

            </Dialog>

        </>
    );
}
