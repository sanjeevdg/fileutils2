import React, { useState } from "react";

import {
    Switch,
    FormControlLabel
} from "@mui/material";

export default function SwitchRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    const props = widget?.props || {};

    const action = widget?.events?.onChange;

    const [checked, setChecked] = useState(
        props.checked ?? props.defaultChecked ?? false
    );

    const handleChange = (event) => {

        const value = event.target.checked;

        setChecked(value);

        if (action && handlers?.[action]) {
            handlers[action](value, widget);
        }

    };

    return (

        <FormControlLabel
            label={props.label || "Switch"}
            labelPlacement={props.labelPlacement || "end"}

            control={
                <Switch
                    name={props.name}
                    checked={checked}
                    onChange={handleChange}
                    disabled={props.disabled || false}
                    color={props.color || "primary"}
                    size={props.size || "medium"}
                />
            }
        />

    );
}