import React from "react";

import DashboardRenderer from "./DashboardRenderer";
import ChartRenderer from "./ChartRenderer";
import StatRenderer from "./StatRenderer";
import TableRenderer from "./TableRenderer";
import DetailRenderer from "./DetailRenderer";


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

        default:

            console.warn(
                "Unknown widget type:",
                widget.type
            );

            return null;
    }
}