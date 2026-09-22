import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    Box,
    Typography,
    Paper,Button,TextField
} from "@mui/material";

import DashboardRenderer from "../pages/DashboardRenderer";
import ComponentPalette from "./ComponentPalette";
import PropertyPanel from "./PropertyPanel";
const API_URL = import.meta.env.VITE_API_URL;



export default function Designer({
    config,
    context = {},
    handlers = {}
}) {


        const { name } = useParams();

    const initialConfigName = name || "";

        const [configName, setConfigName] =
    useState(initialConfigName);



    const getDashboardTitle = (name) => {
        if (!name) return "";

        return name
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };
    const makeDashboardTitle = (name) => {
        if (!name.trim()) return "";

        return name
            .trim()
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    /*
     * Keep a private copy while designing.
     *
     * We do NOT modify the application's original
     * configuration directly.
     */
    const defaultConfig = {
	    pages: {
	        dashboard: {
	            type: "dashboard",
	            title: getDashboardTitle(configName),
	            widgets: []
	        }
	    }
	};

  
	const [fullConfig, setFullConfig] =
    useState(config || null);

    const [designerConfig, setDesignerConfig] =
        useState(null);

    const [loadingConfig, setLoadingConfig] =
        useState(!config);

    const [configError, setConfigError] =
        useState("");

    const [selectedWidgetId, setSelectedWidgetId] =
        useState(null);

    const [selectedRecord, setSelectedRecord] = useState(null);   


    const [formData, setFormData] = useState({});
    const [formRecord, setFormRecord] = useState(null);

    const updateField = (fieldName, value) => {

        setFormData(prev => ({
            ...(prev || {}),
            [fieldName]: value
        }));

    };    
    /*
     * Keep designerConfig synchronized if the
     * parent loads a different YAML configuration.
     */



  const savePage = async () => {
    if (!configName.trim()) {
        alert("Please enter a configuration name");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/config/save`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: configName
                        .trim()
                        .replace(/^['"]+|['"]+$/g, ""),
                    config: designerConfig
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                `Save failed: ${response.status}`
            );
        }

        const result = await response.json();

        console.log("CONFIG SAVED:", result);

        alert(
            `Dashboard saved successfully as ${result.name}`
        );

    } catch (err) {

        console.error("SAVE CONFIG ERROR:", err);

        alert(
            `Failed to save dashboard: ${err.message}`
        );
    }
};


    
    useEffect(() => {

    async function initializeDesigner() {

        try {

            setLoadingConfig(true);
            setConfigError("");

            let dashboardConfig;

                if (initialConfigName) {
                    const dashboardResponse = await fetch(
                        `${API_URL}/api/config?name=${initialConfigName}`
                    );

                    if (!dashboardResponse.ok) {
                        throw new Error(
                            `Failed to load dashboard configuration: ${dashboardResponse.status}`
                        );
                    }

                    dashboardConfig = await dashboardResponse.json();

                    console.log(
                        "DESIGNER DASHBOARD CONFIG:",
                        dashboardConfig
                    );
                } else {
                    dashboardConfig = {
                        pages: {
                            dashboard: {
                                type: "dashboard",
                                title: "",
                                widgets: []
                            }
                        }
                    };

                    console.log(
                        "DESIGNER: creating blank dashboard"
                    );
                }

                setDesignerConfig(config || dashboardConfig);


            /*
             * Load the master configuration containing
             * entities and field definitions.
             */
            const metadataResponse = await fetch(
                `${API_URL}/api/config?name=customer_master_detail`
            );

            if (!metadataResponse.ok) {
                throw new Error(
                    `Failed to load metadata configuration: ${metadataResponse.status}`
                );
            }

            const metadataConfig =
                await metadataResponse.json();

            console.log(
                "DESIGNER METADATA CONFIG:",
                metadataConfig
            );

            /*
             * This configuration is used only for
             * entity and field metadata.
             */
            setFullConfig(metadataConfig);

        } catch (err) {

            console.error(
                "Designer config error:",
                err
            );

            setConfigError(err.message);

        } finally {

            setLoadingConfig(false);
        }
    }

    initializeDesigner();

}, [config, initialConfigName]);


    const dashboard =
        designerConfig?.pages?.dashboard;

    const widgets =
        dashboard?.widgets || [];


    const entityMetadata =
        Object.entries(
            fullConfig?.entities || {}
        ).reduce((result, [entityName, entityConfig]) => {

            result[entityName] =
                (entityConfig.fields || []).map(
                    field => ({
                        name: field.name,
                        label: field.label || field.name,
                        type: field.type,
                        options: field.options || []
                    })
                );
                console.log('myresult',result);
            return result;

        }, {});    


    const getDefaultEntity = () => {
        return Object.keys(fullConfig?.entities || {})[0] || "";
    };

    const getEntityFields = (entity) => {
        return fullConfig?.entities?.[entity]?.fields || [];
    };

    const getDefaultFields = (entity) => {
        const fields = getEntityFields(entity);

        return {
            first: fields[0]?.name || "",
            second: fields[1]?.name || ""
        };
    };

    /*
     * Add a new widget
     */
    const addWidget = (type) => {

            const id = `${type}_${Date.now()}`;

            const entity = getDefaultEntity();
            const fields = getDefaultFields(entity);

            const newWidget = {
                id,
                type,
                title: `New ${type}`,
                layout: {
                    xs: 12,
                    md: 6
                }
            };

            if (type === "stat") {

                newWidget.source = {
                    entity,
                    aggregate: "count"
                };

            }

            if (type === "chart") {

                newWidget.chart = {
                    type: "bar",
                    entity,
                    x: fields.first,
                    y: fields.second
                };

            }

            if (type === "table") {

                const entityFields =
                    getEntityFields(entity);

                newWidget.source = {
                    entity,
                    columns: entityFields
                        .slice(0, 3)
                        .map(field => ({
                            field: field.name,
                            label: field.label || field.name
                        })),
                    limit: 10
                };

            }

            if (type === "detail") {

                const entityFields =
                    getEntityFields(entity);

                newWidget.source = {
                    entity,
                    binding: "selectedRecord"
                };

                newWidget.fields =
                    entityFields
                        .slice(0, 4)
                        .map(field => ({
                            field: field.name,
                            label: field.label || field.name
                        }));

            }
            if (type === "typography") {

                newWidget.text = "New Text";

                newWidget.props = {
                    variant: "body1"
                };

            }

            if (type === "button") {

                newWidget.text = "Button";

                newWidget.props = {
                    variant: "contained"
                };

            }
            setDesignerConfig(prev => ({
                ...prev,
                pages: {
                    ...prev.pages,
                    dashboard: {
                        ...prev.pages.dashboard,
                        widgets: [
                            ...(prev.pages.dashboard.widgets || []),
                            newWidget
                        ]
                    }
                }
            }));

            setSelectedWidgetId(id);
        };


    /*
     * Find currently selected widget
     */
    const selectedWidget =
        widgets.find(
            widget =>
                widget.id === selectedWidgetId
        );

        console.log("SELECTED WIDGET:", selectedWidget);
    /*
     * Change a property of selected widget
     */
    const updateWidget = (property, value) => {

        if (!selectedWidgetId) {
            return;
        }

        setDesignerConfig(prev => {

            const next =
                structuredClone(prev);

            const widget =
                next.pages.dashboard.widgets.find(
                    w => w.id === selectedWidgetId
                );

            if (widget) {
                widget[property] = value;
            }

            return next;
        });
    };


    /*
     * Delete selected widget
     */
    const deleteWidget = () => {

        if (!selectedWidgetId) {
            return;
        }

        setDesignerConfig(prev => {

            const next =
                structuredClone(prev);

            next.pages.dashboard.widgets =
                next.pages.dashboard.widgets.filter(
                    widget =>
                        widget.id !== selectedWidgetId
                );

            return next;
        });

        setSelectedWidgetId(null);
    };

    /*
 * Move widget up or down
 */
    const moveWidget = (index, direction) => {

        setDesignerConfig(prev => {

            const next = structuredClone(prev);

            const widgets =
                next.pages.dashboard.widgets || [];

            const newIndex =
                direction === "up"
                    ? index - 1
                    : index + 1;

            // Already at the boundary
            if (
                newIndex < 0 ||
                newIndex >= widgets.length
            ) {
                return prev;
            }

            // Swap widgets
            [
                widgets[index],
                widgets[newIndex]
            ] = [
                widgets[newIndex],
                widgets[index]
            ];

            return next;
        });
    };

   
    /*
     * IMPORTANT:
     *
     * DashboardRenderer doesn't currently know
     * anything about designer selection.
     *
     * For this first test, we use a wrapper around
     * each widget only to capture clicks.
     *
     * We therefore temporarily render the dashboard
     * ourselves using the same WidgetRenderer.
     */


if (loadingConfig) {
    return (
        <Box sx={{ p: 4 }}>
            <Typography>
                Loading designer configuration...
            </Typography>
        </Box>
    );
}

if (configError) {
    return (
        <Box sx={{ p: 4 }}>
            <Typography color="error">
                {configError}
            </Typography>
        </Box>
    );
}

console.log("DESIGNER HANDLERS:", {
    updateField,
    formData
});
console.log("FORM DATA:", formData);
console.log("DESIGNER CONFIG:", designerConfig);
console.log("ENTITY METADATA:", entityMetadata);
console.log("DESIGNER SELECTED RECORD:", selectedRecord);
    return (
        <Box sx={{ height: "100vh" }}>

            {/* -------------------------------- */}
            {/* Designer Header */}
            {/* -------------------------------- */}

            <Box
                sx={{
                    height: 64,
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    justifyContent: "space-between"
                }}
            >
                <Typography variant="h6">
                    Customer Dashboard Designer
                </Typography>


                <TextField
                    size="small"
                    label="Configuration Name"
                    value={configName}
                     onChange={(e) => {
                        const value = e.target.value;

                        setConfigName(value);

                        setDesignerConfig(prev => {
                            if (!prev) return prev;

                            return {
                                ...prev,
                                pages: {
                                    ...prev.pages,
                                    dashboard: {
                                        ...prev.pages.dashboard,
                                        title: makeDashboardTitle(value)
                                    }
                                }
                            };
                        });
                    }}
                    sx={{ width: 450,marginLeft:60 }}
                />


                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {widgets.length} widgets
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={savePage}
                    >
                        Save Page
                    </Button>
                </Box>
            </Box>


            {/* -------------------------------- */}
            {/* Main Designer */}
            {/* -------------------------------- */}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "220px 1fr 280px",
                    height: "calc(100vh - 64px)"
                }}
            >

                {/* Palette */}

                <ComponentPalette
                    onAdd={addWidget}
                />


                {/* Canvas */}

                <Box
                    sx={{
                        p: 3,
                        overflow: "auto",
                        bgcolor: "#f5f5f5"
                    }}
                >

                        <Paper
                                elevation={0}
                                sx={{
                                    minHeight: "100%",
                                    p: 2,
                                    bgcolor: "white"
                                }}
                            >
                                <DashboardRenderer
                                    node={dashboard}
                                    context={{
                                        ...context,
                                        formData,
                                        config: designerConfig
                                    }}
                                    handlers={{
                                        ...handlers,
                                        updateField,
                                        selectRecord: setSelectedRecord
                                    }}
                                    onWidgetSelect={(widget) =>
                                        setSelectedWidgetId(widget.id)
                                    }
                                    onWidgetMove={moveWidget}
                                    selectedWidgetId={selectedWidgetId}
                                />
                            </Paper>

                </Box>


                {/* Properties */}

                <PropertyPanel
                    widget={selectedWidget}
                    onChange={updateWidget}
                    onDelete={deleteWidget}
                    entityMetadata={entityMetadata}
                />

            </Box>

        </Box>
    );
}

