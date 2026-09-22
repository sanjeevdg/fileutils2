import React from "react";

import DashboardRenderer from "./DashboardRenderer";
import ChartRenderer from "./ChartRenderer";
import StatRenderer from "./StatRenderer";
import TableRenderer from "./TableRenderer";
import DetailRenderer from "./DetailRenderer";
import DataGridRenderer from "./DataGridRenderer";
import TextFieldRenderer from "./TextFieldRenderer";
import SelectRenderer from "./SelectRenderer";
import CheckboxRenderer from "./CheckboxRenderer";
import RadioRenderer from "./RadioRenderer";
import {
    Button,
    Typography
} from "@mui/material";


export default function WidgetRenderer({
    widget,
    context = {},
    handlers = {}
}) {
console.log("WIDGET RENDERER:", widget);
    if (!widget) {
        return null;
    }


    // -----------------------------------------
    // WIDGET TYPE
    // -----------------------------------------

    switch (widget.type) {

        case "chart":
            return (
                <ChartRenderer
                    chart={widget.chart || widget}
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );


        case "dashboard":

            return (
                <DashboardRenderer
                    node={widget}
                    context={context}
                    handlers={handlers}
                />
            );

        case "stat":

            return (
                <StatRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );

        case "table":

            return (
                <TableRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );  
        case "datagrid":

            return (
                <DataGridRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );    
        case "textfield":
            return (
                <TextFieldRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );    

        case "detail":
            console.log("DETAIL CASE HIT:", widget);
            console.log("DETAIL RENDERER COMPONENT:", DetailRenderer);
            return (
                <DetailRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );    
        case "select":
                return (
                    <SelectRenderer
                        widget={widget}
                        context={context}
                        handlers={handlers}
                    />
                );
         case "checkbox":
            return (
                <CheckboxRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );       

         case "radio":
            return (
                <RadioRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );   
                 case "typography":

            return (
                <Typography
                    {...(widget.props || {})}
                >
                    {widget.text || ""}
                </Typography>
            );


        case "button":

            return (
                <Button
                    {...(widget.props || {})}
                    onClick={() => {
                        const action = widget.events?.onClick;

                        if (action && handlers?.[action]) {
                            handlers[action](widget);
                        }
                    }}
                >
                    {widget.text || "Button"}
                </Button>
            );   
            
        default:

            console.warn(
                "Unknown widget type:",
                widget.type
            );

            return null;
    }
}