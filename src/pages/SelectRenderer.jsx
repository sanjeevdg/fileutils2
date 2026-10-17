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

    /*
     * ---------------------------------------------------------
     * Find the field definition in the YAML schema
     * ---------------------------------------------------------
     *
     * Example:
     *
     * entities:
     *   customers:
     *     fields:
     *       - name: gender
     *         type: select
     *         options:
     *           - Male
     *           - Female
     *           - Other
     */
    const formEntity = props.formEntity || "";

    const entities =
        context?.config?.entities || {};

    const entityConfig =
        entities?.[formEntity];

    const fieldConfig =
        entityConfig?.fields?.find(
            (f) => f.name === field
        );

    console.log(
        "SELECT FIELD CONFIG:",
        formEntity,
        field,
        fieldConfig
    );

    /*
     * ---------------------------------------------------------
     * YAML-defined static options
     * ---------------------------------------------------------
     *
     * If the schema defines options, use those directly.
     *
     * This prevents things like:
     *
     * Male
     * Female
     * Male
     * Male
     *
     * because we are no longer deriving the choices
     * from customer records.
     */
    const yamlOptions =
        Array.isArray(fieldConfig?.options)
            ? fieldConfig.options
            : null;

    /*
     * ---------------------------------------------------------
     * Entity-backed options
     * ---------------------------------------------------------
     *
     * Only fetch the entity when the YAML field does NOT
     * define its own static options.
     */
    const source = props.source || {};

    const sourceEntity = source.entity;

    const valueField =
        source.valueField || "id";

    const labelField =
        source.labelField || "name";

    const [entityOptions, setEntityOptions] =
        useState([]);

    useEffect(() => {

        /*
         * Static YAML options don't need an API call.
         */
        if (yamlOptions) {
            setEntityOptions([]);
            return;
        }

        if (!sourceEntity) {
            setEntityOptions([]);
            return;
        }

        const loadOptions = async () => {

            try {

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/${sourceEntity}`
                );

                if (!response.ok) {
                    throw new Error(
                        `Select request failed: ${response.status}`
                    );
                }

                const result =
                    await response.json();

                console.log(
                    "SELECT ENTITY OPTIONS:",
                    sourceEntity,
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

    }, [sourceEntity, yamlOptions]);

    /*
     * ---------------------------------------------------------
     * Determine the actual options
     * ---------------------------------------------------------
     *
     * Priority:
     *
     * 1. YAML field options
     * 2. Entity source
     * 3. Widget props.options
     */
    const options =
        yamlOptions ||
        (sourceEntity
            ? entityOptions
            : (props.options || []));

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
                     * -------------------------------------------------
                     * Entity-backed option
                     * -------------------------------------------------
                     */
                    if (
                        sourceEntity &&
                        !yamlOptions
                    ) {

                        const optionValue =
                            option[valueField];

                        const optionLabel =
                            option[labelField];

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

                    /*
                     * -------------------------------------------------
                     * Static YAML option
                     * -------------------------------------------------
                     *
                     * YAML:
                     *
                     * options:
                     *   - Male
                     *   - Female
                     *   - Other
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
