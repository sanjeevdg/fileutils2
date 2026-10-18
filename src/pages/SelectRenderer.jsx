
import React, { useEffect, useState } from "react";

import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText
} from "@mui/material";

export default function SelectRenderer({
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

    const errorMessage =
        context?.validationErrors?.[field] || "";

    const formEntity = props.formEntity || "";

    const entities = context?.config?.entities || {};
    const entityConfig = entities?.[formEntity];

    const fieldConfig = entityConfig?.fields?.find(
        (f) => f.name === field
    );

    const yamlOptions = Array.isArray(fieldConfig?.options)
        ? fieldConfig.options
        : null;

    const source = props.source || {};
    const sourceEntity = source.entity;
    const valueField = source.valueField || "id";
    const labelField = source.labelField || "name";

    const [entityOptions, setEntityOptions] = useState([]);

    useEffect(() => {
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

                const result = await response.json();

                setEntityOptions(
                    Array.isArray(result) ? result : []
                );
            } catch (err) {
                console.error("Select error:", err);
                setEntityOptions([]);
            }
        };

        loadOptions();
    }, [sourceEntity, yamlOptions]);

    const options =
        yamlOptions ||
        (sourceEntity
            ? entityOptions
            : props.options || []);

    const labelId = `${widget?.id || field}-label`;

    return (
        <FormControl
            fullWidth
            required={Boolean(props.required)}
            error={Boolean(errorMessage)}
        >
            <InputLabel id={labelId}>
                {props.label || "Select"}
            </InputLabel>

            <Select
                labelId={labelId}
                id={`${widget?.id || field}-select`}
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
                    if (sourceEntity && !yamlOptions) {
                        const optionValue = option[valueField];
                        const optionLabel = option[labelField];

                        return (
                            <MenuItem
                                key={`${optionValue}-${index}`}
                                value={optionValue}
                            >
                                {optionLabel}
                            </MenuItem>
                        );
                    }

                    const optionValue =
                        typeof option === "string"
                            ? option
                            : option.value;

                    const optionLabel =
                        typeof option === "string"
                            ? option
                            : option.label || option.value;

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

            {errorMessage && (
                <FormHelperText>
                    {errorMessage}
                </FormHelperText>
            )}
        </FormControl>
    );
}
