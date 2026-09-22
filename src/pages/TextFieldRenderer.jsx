import React from "react";
import { TextField } from "@mui/material";

export default function TextFieldRenderer({
    widget,
    context = {},
    handlers = {}
}) {
    const props = widget?.props || {};
    const field = props.field || "";

    const formData = context?.formData || {};

    const value =
        formData[field] ??
        props.defaultValue ??
        "";

    return (
        <TextField
            fullWidth
            label={
                props.label ||
                widget.title ||
                "Text Field"
            }
            placeholder={props.placeholder || ""}
            value={value}
            onChange={(event) => {
                handlers?.updateField?.(
                    field,
                    event.target.value
                );
            }}
            variant={props.variant || "outlined"}
            required={props.required || false}
            multiline={props.multiline || false}
            rows={
                props.multiline
                    ? props.rows || 3
                    : undefined
            }
        />
    );
}