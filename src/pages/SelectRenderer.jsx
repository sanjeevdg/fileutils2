import React, { useEffect, useState } from "react";

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
    const props = widget?.props || {};
    console.log("SELECT WIDGET PROPS:", props);
    const field = props.field || "";

    const formData = context?.formData || {};

    const value =
        formData[field] ??
        props.defaultValue ??
        "";

    const source = props.source || {};

    const entity = source.entity;
    const valueField = source.valueField || "id";
    const labelField = source.labelField || "name";

    const [entityOptions, setEntityOptions] =
        useState([]);

    /*
     * Load options when an Entity is configured.
     */
    useEffect(() => {

        if (!entity) {
            setEntityOptions([]);
            return;
        }

        const loadOptions = async () => {

            try {

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/${entity}`
                );

                if (!response.ok) {
                    throw new Error(
                        `Select request failed: ${response.status}`
                    );
                }

                const result =
                    await response.json();

                console.log(
                    "SELECT OPTIONS:",
                    entity,
                    result
                );

                setEntityOptions(
                    Array.isArray(result)
                        ? result
                        : []
                );

            } catch (err) {

                console.error(
                    "Select error:",
                    err
                );

                setEntityOptions([]);
            }
        };

        loadOptions();

    }, [entity]);

    /*
     * Determine which options to display.
     *
     * Entity configured:
     *     use API results
     *
     * No Entity:
     *     use static props.options
     */
    const options = entity
        ? entityOptions
        : (props.options || []);

    return (
        <FormControl fullWidth>

            <InputLabel>
                {props.label || "Select"}
            </InputLabel>

            <Select
                value={value}
                label={props.label || "Select"}

                onChange={(event) => {

                    handlers?.updateField?.(
                        field,
                        event.target.value
                    );

                }}
            >

                {options.map((option, index) => {

                    /*
                     * Entity-backed option
                     *
                     * Example:
                     *
                     * {
                     *     id: 1,
                     *     first_name: "John"
                     * }
                     */
                    if (entity) {

                        const optionValue =
                            option[valueField];

                        const optionLabel =
                            option[labelField];

                        return (
                            <MenuItem
                                key={optionValue}
                                value={optionValue}
                            >
                                {optionLabel}
                            </MenuItem>
                        );
                    }

                    /*
                     * Static option
                     *
                     * Example:
                     *
                     * {
                     *     value: "draft",
                     *     label: "Draft"
                     * }
                     */
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
                            key={`${optionValue}-${index}`}
                            value={optionValue}
                        >
                            {optionLabel}
                        </MenuItem>
                    );

                })}

            </Select>

        </FormControl>
    );
}

