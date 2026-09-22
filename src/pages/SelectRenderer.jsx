import React from "react";

import {
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";


export default function SelectRenderer({
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

    const value =
        formData[field] ??
        props.defaultValue ??
        "";

    const options =
        props.options || [];


    return (
        <FormControl fullWidth>

            <InputLabel>
                {props.label || "Select"}
            </InputLabel>

            <Select
                value={value}
                label={
                    props.label || "Select"
                }

                onChange={(event) => {

                    handlers?.updateField?.(
                        field,
                        event.target.value
                    );

                }}
            >

                {options.map(
                    (option, index) => {

                        const optionValue =
                            typeof option === "string"
                                ? option
                                : option.value;

                        const optionLabel =
                            typeof option === "string"
                                ? option
                                : option.label ||
                                  option.value;

                        return (
                            <MenuItem
                                key={
                                    `${optionValue}-${index}`
                                }
                                value={optionValue}
                            >
                                {optionLabel}
                            </MenuItem>
                        );

                    }
                )}

            </Select>

        </FormControl>
    );
}