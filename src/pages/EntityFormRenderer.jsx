import React, { useEffect, useState } from "react";

import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from "@mui/material";


export default function EntityFormRenderer({
    entity,
    record = {},
    fields,
    readonly = false,
    context,
    onChange,
    onSave,
    onDelete
}) {


console.log(
    "ENTITY FORM RENDERER:",
    {
        entity,
        record,
        fields,
        context
    }
);

    const [formData, setFormData] = useState(record || {});
    const [errors, setErrors] = useState({});


    /*
     * =========================================================
     * Synchronize when selected record changes
     * =========================================================
     */

    useEffect(() => {

        setFormData(record || {});
        setErrors({});

    }, [record]);


    /*
     * =========================================================
     * Determine which fields to display
     * =========================================================
     */

    const entityFields = entity?.fields || [];

    const visibleFields = fields
        ? entityFields.filter(field =>
            fields.includes(field.name)
        )
        : entityFields.filter(field =>
            !field.hidden
        );


    /*
     * =========================================================
     * Update field
     * =========================================================
     */

    const handleChange = (field, value) => {

    setFormData(prev => ({
        ...prev,
        [field.name]: value
    }));

    setErrors(prev => ({
        ...prev,
        [field.name]: undefined
    }));

    if (onChange) {
        onChange(field.name, value);
    }
};


    /*
     * =========================================================
     * Validation
     * =========================================================
     */

    const validateField = (field, value) => {

        const validation =
            field.validation || {};

        const label =
            field.label || field.name;


        /*
         * Required
         */

        if (
            field.required &&
            (
                value === undefined ||
                value === null ||
                value === ""
            )
        ) {
            return `${label} is required`;
        }


        /*
         * Empty optional field
         */

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return null;
        }


        /*
         * Minimum length
         */

        if (
            validation.minLength !== undefined &&
            String(value).length <
            validation.minLength
        ) {
            return `${label} must contain at least ${validation.minLength} characters`;
        }


        /*
         * Maximum length
         */

        if (
            validation.maxLength !== undefined &&
            String(value).length >
            validation.maxLength
        ) {
            return `${label} must contain no more than ${validation.maxLength} characters`;
        }


        /*
         * Minimum number
         */

        if (
            validation.min !== undefined &&
            Number(value) < validation.min
        ) {
            return `${label} must be at least ${validation.min}`;
        }


        /*
         * Maximum number
         */

        if (
            validation.max !== undefined &&
            Number(value) > validation.max
        ) {
            return `${label} must be no more than ${validation.max}`;
        }


        /*
         * Pattern
         */

        if (validation.pattern) {

            const regex =
                new RegExp(validation.pattern);

            if (!regex.test(String(value))) {
                return `${label} has an invalid format`;
            }
        }


        /*
         * Email
         */

        if (field.type === "email") {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(String(value))) {
                return "Please enter a valid email address";
            }
        }


        return null;
    };


    /*
     * =========================================================
     * Validate entire form
     * =========================================================
     */

    const validate = () => {

        const newErrors = {};

        visibleFields.forEach(field => {

            if (
                field.readonly ||
                field.disabled
            ) {
                return;
            }

            const error =
                validateField(
                    field,
                    formData[field.name]
                );

            if (error) {
                newErrors[field.name] = error;
            }

        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    /*
     * =========================================================
     * Submit
     * =========================================================
     */

    const handleSubmit = event => {

    event.preventDefault();

    console.log("ENTITY FORM SUBMIT");
    console.log("FORM DATA:", formData);

    if (!validate()) {
        console.log("VALIDATION FAILED");
        return;
    }

    console.log("VALIDATION PASSED");

    if (onSave) {
        console.log("CALLING onSave");
        onSave(formData);
    } else {
        console.log("NO onSave HANDLER");
    }
};


    /*
     * =========================================================
     * Render field
     * =========================================================
     */

    const renderField = field => {

        const value =
            formData[field.name] ?? "";

        const error =
            errors[field.name];

        const disabled =
            readonly ||
            field.readonly ||
            field.disabled;


        /*
         * TEXT
         */

        if (
            field.type === "text" ||
            field.type === "string"
        ) {

            return (
                <TextField
                    key={field.name}
                    label={field.label || field.name}
                    name={field.name}
                    value={value}
                    fullWidth
                    disabled={disabled}
                    required={field.required}
                    error={Boolean(error)}
                    helperText={error || ""}
                    onChange={event =>
                        handleChange(
                            field,
                            event.target.value
                        )
                    }
                />
            );
        }


        /*
         * EMAIL
         */

        if (field.type === "email") {

            return (
                <TextField
                    key={field.name}
                    label={field.label || field.name}
                    name={field.name}
                    type="email"
                    value={value}
                    fullWidth
                    disabled={disabled}
                    required={field.required}
                    error={Boolean(error)}
                    helperText={error || ""}
                    onChange={event =>
                        handleChange(
                            field,
                            event.target.value
                        )
                    }
                />
            );
        }


        /*
         * NUMBER
         */

        if (field.type === "number") {

            return (
                <TextField
                    key={field.name}
                    label={field.label || field.name}
                    name={field.name}
                    type="number"
                    value={value}
                    fullWidth
                    disabled={disabled}
                    required={field.required}
                    error={Boolean(error)}
                    helperText={error || ""}
                    onChange={event => {

                        const newValue =
                            event.target.value === ""
                                ? ""
                                : Number(
                                    event.target.value
                                );

                        handleChange(
                            field,
                            newValue
                        );
                    }}
                />
            );
        }


        /*
         * DATE
         */

        if (field.type === "date") {

            return (
                <TextField
                    key={field.name}
                    label={field.label || field.name}
                    name={field.name}
                    type="date"
                    value={value}
                    fullWidth
                    disabled={disabled}
                    required={field.required}
                    error={Boolean(error)}
                    helperText={error || ""}
                    InputLabelProps={{
                        shrink: true
                    }}
                    onChange={event =>
                        handleChange(
                            field,
                            event.target.value
                        )
                    }
                />
            );
        }


        /*
         * DATETIME
         */

        if (field.type === "datetime") {

            return (
                <TextField
                    key={field.name}
                    label={field.label || field.name}
                    name={field.name}
                    type="datetime-local"
                    value={value}
                    fullWidth
                    disabled={disabled}
                    required={field.required}
                    error={Boolean(error)}
                    helperText={error || ""}
                    InputLabelProps={{
                        shrink: true
                    }}
                    onChange={event =>
                        handleChange(
                            field,
                            event.target.value
                        )
                    }
                />
            );
        }


        /*
         * SELECT
         */

        if (field.type === "select") {

            return (
                <FormControl
                    key={field.name}
                    fullWidth
                    disabled={disabled}
                    error={Boolean(error)}
                >

                    <InputLabel>
                        {field.label || field.name}
                    </InputLabel>

                    <Select
                        name={field.name}
                        value={value}
                        label={field.label || field.name}
                        onChange={event =>
                            handleChange(
                                field,
                                event.target.value
                            )
                        }
                    >

                        {(field.options || []).map(
                            (option, index) => {

                                const optionValue =
                                    typeof option === "object"
                                        ? option.value
                                        : option;

                                const optionLabel =
                                    typeof option === "object"
                                        ? option.label
                                        : option;

                                return (
                                    <MenuItem
                                        key={
                                            optionValue ??
                                            index
                                        }
                                        value={optionValue}
                                    >
                                        {optionLabel}
                                    </MenuItem>
                                );
                            }
                        )}

                    </Select>

                    {error && (
                        <FormHelperText>
                            {error}
                        </FormHelperText>
                    )}

                </FormControl>
            );
        }


        /*
         * BOOLEAN / CHECKBOX
         */

        if (
            field.type === "boolean" ||
            field.type === "checkbox"
        ) {

            return (
                <FormControlLabel
                    key={field.name}
                    control={
                        <Checkbox
                            name={field.name}
                            checked={Boolean(value)}
                            disabled={disabled}
                            onChange={event =>
                                handleChange(
                                    field,
                                    event.target.checked
                                )
                            }
                        />
                    }
                    label={
                        field.label || field.name
                    }
                />
            );
        }


        /*
         * TEXTAREA
         */

        if (field.type === "textarea") {

            return (
                <TextField
                    key={field.name}
                    label={field.label || field.name}
                    name={field.name}
                    value={value}
                    fullWidth
                    multiline
                    minRows={4}
                    disabled={disabled}
                    required={field.required}
                    error={Boolean(error)}
                    helperText={error || ""}
                    onChange={event =>
                        handleChange(
                            field,
                            event.target.value
                        )
                    }
                />
            );
        }


        /*
         * CURRENCY
         */

        if (field.type === "currency") {

            return (
                <TextField
                    key={field.name}
                    label={field.label || field.name}
                    name={field.name}
                    type="number"
                    value={value}
                    fullWidth
                    disabled={disabled}
                    required={field.required}
                    error={Boolean(error)}
                    helperText={error || ""}
                    inputProps={{
                        min: 0,
                        step: "0.01"
                    }}
                    onChange={event => {

                        const newValue =
                            event.target.value === ""
                                ? ""
                                : Number(
                                    event.target.value
                                );

                        handleChange(
                            field,
                            newValue
                        );
                    }}
                />
            );
        }


            /*
 * REFERENCE
 */
console.log(
    "RENDERING FIELD:",
    field.name,
    field.type,
    "value=",
    value
);

if (field.type === "reference") {

    const reference = field.reference || {};

    const referenceEntity = reference.entity;
    const valueField = reference.valueField || "id";
    const labelField = reference.labelField || "name";

    const referenceData =
        context?.[referenceEntity] || [];

    console.log(
        "REFERENCE FIELD:",
        field.name,
        "value:",
        value,
        "referenceData:",
        referenceData
    );

    return (
        <FormControl
            key={field.name}
            fullWidth
            margin="normal"
            disabled={disabled}
            error={Boolean(error)}
        >

            <InputLabel>
                {field.label || field.name}
            </InputLabel>

            <Select
                name={field.name}
                value={
                    value === null ||
                    value === undefined
                        ? ""
                        : value
                }
                label={
                    field.label ||
                    field.name
                }

                onChange={(event) =>
                    handleChange(
                        field,
                        event.target.value
                    )
                }
            >

                {referenceData.map(
                    record => (
                        <MenuItem
                            key={record[valueField]}
                            value={record[valueField]}
                        >
                            {record[labelField]}
                        </MenuItem>
                    )
                )}

            </Select>

            {error && (
                <FormHelperText>
                    {error}
                </FormHelperText>
            )}

        </FormControl>
    );
}

}

    /*
     * =========================================================
     * RENDER FORM
     * =========================================================
     */

        /*
     * =========================================================
     * RENDER FORM
     * =========================================================
     */

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2
            }}
        >

            {visibleFields.map(field =>
                renderField(field)
            )}

            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mt: 2
                }}
            >

                {onSave && (
                    <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            console.log("ENTITY FORM SAVE CLICKED");
                            console.log("FORM DATA:", formData);

                            onSave(formData);
                        }}
                    >
                        Save
                    </Button>
                )}

                {onDelete && (
                    <Button
                        type="button"
                        variant="outlined"
                        color="error"
                        onClick={() => onDelete(formData)}
                    >
                        Delete
                    </Button>
                )}

            </Box>

        </Box>
    );
}

