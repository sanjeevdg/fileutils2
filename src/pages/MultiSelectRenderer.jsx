import React, { useEffect, useState } from "react";

import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText
} from "@mui/material";

export default function MultiSelectRenderer({
    widget,
    context = {},
    handlers = {}
}) {
    const props = widget?.props || {};

    const field = props.field || "";

    const formData = context?.formData || {};

    const value = Array.isArray(formData[field])
        ? formData[field]
        : [];

    const source = props.source || {};

    const entity = source.entity;
    const valueField = source.valueField || "id";
    const labelField = source.labelField || "name";


console.log("MULTISELECT CONFIG:", {
    entity,
    valueField,
    labelField,
    source
});


    const [options, setOptions] = useState([]);

    useEffect(() => {

        if (!entity) {
            setOptions([]);
            return;
        }

        const loadOptions = async () => {

            try {

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/${entity}`
                );

                if (!response.ok) {
                    throw new Error(
                        `Multi Select request failed: ${response.status}`
                    );
                }

                const result = await response.json();
                console.log(
                    "MULTISELECT OPTIONS:",
                    entity,
                    result
                );
                setOptions(
                    Array.isArray(result)
                        ? result
                        : []
                );

            } catch (err) {

                console.error(
                    "Multi Select error:",
                    err
                );

                setOptions([]);
            }
        };

        loadOptions();

    }, [entity]);

    return (
        <FormControl fullWidth>

            <InputLabel>
                {props.label || "Select"}
            </InputLabel>

            <Select
                multiple
                value={value}
                label={props.label || "Select"}
                onChange={(event) => {

                    handlers?.updateField?.(
                        field,
                        event.target.value
                    );

                }}
                renderValue={(selected) =>
                    selected
                        .map((selectedValue) => {

                            const option =
                                options.find(
                                    item =>
                                        item[valueField] ===
                                        selectedValue
                                );

                            return option
                                ? option[labelField]
                                : selectedValue;

                        })
                        .join(", ")
                }
            >

                {options.map((option) => {

                    const optionValue =
                        option[valueField];

                    const optionLabel =
                        option[labelField];

                    return (
                        <MenuItem
                            key={optionValue}
                            value={optionValue}
                        >

                            <Checkbox
                                checked={
                                    value.includes(
                                        optionValue
                                    )
                                }
                            />

                            <ListItemText
                                primary={optionLabel}
                            />

                        </MenuItem>
                    );

                })}

            </Select>

        </FormControl>
    );
}