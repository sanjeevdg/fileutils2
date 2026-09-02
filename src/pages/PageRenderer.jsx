import React from "react";
import FormRenderer from "./FormRenderer";
import DashboardRenderer from "./DashboardRenderer";


export default function PageRenderer({
    config,
    pageName = "customer",
//    pageName = "widget_test",
    context = {},
    handlers = {}
}) {

    const pageConfig =
        config?.pages?.[pageName];
console.log("PAGE CONFIG:", pageName, pageConfig);
    if (!pageConfig) {
        return (
            <div>
                Page "{pageName}" not found
            </div>
        );
    }


    // -----------------------------------------
    // DASHBOARD
    // -----------------------------------------

    if (pageConfig.type === "dashboard") {

        return (
            <DashboardRenderer
                node={pageConfig}
                context={{
                    ...context,
                    config: config
                }}
                handlers={handlers}
            />
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