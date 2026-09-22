import React from "react";

import {
    FormControlLabel,
    Checkbox
} from "@mui/material";


export default function CheckboxRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    const props =
        widget?.props || {};

    const field =
        props.field || "";

    const formData =
        context?.formData || {};

    const checked =
        formData[field] ??
        props.defaultChecked ??
        false;


    return (
        <FormControlLabel

            control={

                <Checkbox

                    checked={Boolean(checked)}

                    onChange={(event) => {

                        handlers?.updateField?.(
                            field,
                            event.target.checked
                        );

                    }}

                    required={
                        props.required || false
                    }

                />

            }

            label={
                props.label ||
                "Checkbox"
            }

        />
    );
}