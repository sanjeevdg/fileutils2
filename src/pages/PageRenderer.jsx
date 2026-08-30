import React from "react";
import FormRenderer from "./FormRenderer";

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