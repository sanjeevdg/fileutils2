import { useState } from "react";
import dayjs from "dayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

export default function TestPicker() {

    const [value, setValue] = useState(dayjs());

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                label="Test"
                value={value}
                onChange={(newValue) => {
                    console.log("FIRED!", newValue);
                    setValue(newValue);
                }}
            />
        </LocalizationProvider>
    );
}