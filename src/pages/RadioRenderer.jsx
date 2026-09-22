import React, { useState } from "react";

import {
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@mui/material";


export default function RadioRenderer({
    widget,
    context = {},
    handlers = {}
}) {

    const props = widget?.props || {};

    const options =
        props.options || [];

    const [value, setValue] =
        useState(props.defaultValue || "");


    return (
        <FormControl>

            <FormLabel>
                {props.label || "Radio"}
            </FormLabel>

            <RadioGroup
                value={value}
                onChange={(event) => {

                    setValue(
                        event.target.value
                    );

                }}

                row={
                    props.orientation === "row"
                }
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
                            <FormControlLabel
                                key={
                                    `${optionValue}-${index}`
                                }
                                value={optionValue}
                                control={<Radio />}
                                label={optionLabel}
                            />
                        );

                    }
                )}

            </RadioGroup>

        </FormControl>
    );
}