import React, { useState } from "react";

import {
    TextField,
    IconButton,
    InputAdornment
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function TextFieldRenderer({
    widget,
    context = {},
    handlers = {}
}) {
    const props = widget?.props || {};
    const field = props.field || "";
    const [showPassword, setShowPassword] = useState(false);
const validationErrors =
    context?.validationErrors || {};

const errorMessage = validationErrors[field] || "";

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
            error={Boolean(errorMessage)}
            helperText={errorMessage}
            variant={props.variant || "outlined"}
            type={
                props.numeric
                    ? "number"
                    : props.type === "password"
                        ? (showPassword ? "text" : "password")
                        : (props.type || "text")
            }
            required={props.required || false}
            multiline={props.multiline || false}
            rows={
                props.multiline
                    ? props.rows || 3
                    : undefined
            }
            slotProps={{
                htmlInput: {
                    readOnly: props.readOnly || false,
                    ...(props.numeric ? { step: "any" } : {})
                },
                input: {
                    ...(props.type === "password" && {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() =>
                                        setShowPassword(prev => !prev)
                                    }
                                    edge="end"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword
                                        ? <VisibilityOff />
                                        : <Visibility />
                                    }
                                </IconButton>
                            </InputAdornment>
                        )
                    })
                }
            }}
        />
    );
}