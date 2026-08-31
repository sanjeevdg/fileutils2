import React from "react";
import FormRenderer from "./FormRenderer";
import DashboardRenderer from "./DashboardRenderer";
import ChartRenderer from "./ChartRenderer";


export default function PageRenderer({
    config,
    pageName = "customer",
    context = {},
    handlers = {}
}) {

    const pageConfig =
        config?.pages?.[pageName];

    if (!pageConfig) {
        return (
            <div>
                Page "{pageName}" not found
            </div>
        );
    }

    // -----------------------------------------
    // CUSTOM DASHBOARD
    // -----------------------------------------

   if (pageConfig.type === "dashboard") {
    return (
        <>
            <DashboardRenderer
                node={pageConfig}
                context={{
                    ...context,
                    config: config
                }}
                handlers={handlers}
            />

            {pageConfig.chart && (
                <ChartRenderer
                    chart={pageConfig.chart}
                />
            )}
        </>
    );
}

    // -----------------------------------------
    // EXISTING YAML UI
    // -----------------------------------------

    return (
        <FormRenderer
            node={pageConfig}
            context={{
                ...context,
                config: config
            }}
            handlers={handlers}
        />
    );
}

