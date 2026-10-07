import React from "react";
import { TextField } from "@mui/material";

export default function DatePickerRenderer({
    widget,
    context = {},
    handlers = {}
}) {
    const props = widget?.props || {};

    const field = props.field || "";

    const formData =
        context?.formData || {};

    const value =
        formData[field] ??
        props.defaultValue ??
        "";

    return (
        <TextField
            fullWidth
            type="date"
            label={
                props.label ||
                widget.title ||
                "Date"
            }
            value={value}
            onChange={(event) => {
                handlers?.updateField?.(
                    field,
                    event.target.value
                );
            }}
            required={
                props.required || false
            }
            slotProps={{
                inputLabel: {
                    shrink: true
                },
                htmlInput: {
                    readOnly:
                        props.readOnly || false
                }
            }}
        />
    );
}