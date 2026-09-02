import React from "react";

import DashboardRenderer from "./DashboardRenderer";
import ChartRenderer from "./ChartRenderer";
import StatRenderer from "./StatRenderer";

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
            
        default:

            console.warn(
                "Unknown widget type:",
                widget.type
            );

            return null;
    }
}