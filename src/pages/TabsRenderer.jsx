
import React, { useEffect, useState } from "react";

import {
    Box,
    Tabs,
    Tab,
    Grid
} from "@mui/material";

import WidgetRenderer from "./WidgetRenderer";

export default function TabsRenderer({
    widget,
    context = {},
    handlers = {},
    onSelect = null
}) {

    const tabs = widget?.tabs || [];

    // Track the active tab by its unique ID
    const [activeTabId, setActiveTabId] = useState(
        tabs[0]?.id || null
    );

    // Find the current position of the active tab
    const activeTabIndex = tabs.findIndex(
        tab => tab.id === activeTabId
    );

    // If the active tab was deleted, select the first available tab
    useEffect(() => {

        const activeTabExists = tabs.some(
            tab => tab.id === activeTabId
        );

        if (!activeTabExists) {
            setActiveTabId(tabs[0]?.id || null);
        }

    }, [tabs, activeTabId]);

    if (!tabs.length) return null;

    const selectedTab = tabs[
        activeTabIndex >= 0 ? activeTabIndex : 0
    ];

    return (

        <Box sx={{ width: "100%" }}>

            {/* Tab headers */}

            <Tabs
                value={activeTabIndex >= 0 ? activeTabIndex : 0}
                onChange={(event, newValue) => {
                    setActiveTabId(tabs[newValue]?.id || null);
                }}
                variant="scrollable"
                scrollButtons="auto"
            >

                {tabs.map((tab, index) => (

                    <Tab
                        key={tab.id || index}
                        label={tab.label || `Tab ${index + 1}`}
                        onClick={(event) => {

                            event.stopPropagation();

                            if (onSelect) {
                                onSelect(null, {
                                    tabsId: widget.id,
                                    tabId: tab.id
                                });
                            }
                        }}
                    />

                ))}

            </Tabs>


            {/* Active tab contents */}

            <Box sx={{ p: 2 }}>

                <Grid
                    container
                    spacing={2}
                >

                    {selectedTab?.widgets?.map((child, index) => {

                        const { offset, ...gridSize } =
                            child.layout || { xs: 12 };

                        return (

                            <Grid
                                key={child.id || index}
                                size={gridSize}
                                offset={
                                    offset != null
                                        ? { md: offset }
                                        : undefined
                                }
                                onClick={(event) => {

                                    if (onSelect) {

                                        event.stopPropagation();

                                        onSelect(child, {
                                            tabsId: widget.id,
                                            tabId: selectedTab.id
                                        });

                                    }

                                }}
                                sx={{
                                    position: "relative",
                                    cursor: onSelect
                                        ? "pointer"
                                        : "default"
                                }}
                            >

                                <WidgetRenderer
                                    widget={child}
                                    context={context}
                                    handlers={handlers}
                                    onSelect={onSelect}
                                />

                            </Grid>

                        );

                    })}

                </Grid>

            </Box>

        </Box>

    );
}
