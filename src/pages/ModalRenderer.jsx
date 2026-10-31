
import React, { useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

export default function ModalRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    const props = widget?.props || {};
    const events = widget?.events || {};

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

                {/* Content */}

                <DialogContent dividers>

                    <Typography>
                        {props.content || "Modal content goes here."}
                    </Typography>

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
