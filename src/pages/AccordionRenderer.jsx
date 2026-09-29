import React from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import WidgetRenderer from "./WidgetRenderer";

export default function AccordionRenderer({
    widget,
    context = {},
    handlers = {},
    onSelect = null
}) {




    if (!widget) {
        return null;
    }

    const sections = widget.sections || [];

    return (
        <Box
            sx={{
                width: "100%"
            }}
        >
            {sections.map((section, index) => (
                <Accordion
                    key={section.id || index}
                    defaultExpanded={
                        section.expanded ?? index === 0
                    }
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                       <Typography
                            onClick={(event) => {
                                event.stopPropagation();

                                if (onSelect) {
                                    onSelect(null, {
                                        accordionId: widget.id,
                                        sectionId: section.id
                                    });
                                }
                            }}
                            sx={{
                                cursor: onSelect ? "pointer" : "default"
                            }}
                        >
                            {section.title || `Section ${index + 1}`}
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        {section.widgets?.map(child => (
                            <Box
                                key={child.id}
                                onClick={(event) => {
                                    event.stopPropagation();

                                    if (onSelect) {
                                        onSelect(child, {
                                            accordionId: widget.id,
                                            sectionId: section.id
                                        });
                                    }
                                }}
                                sx={{
                                    position: "relative",
                                    mb: 2,
                                    ...(onSelect
                                        ? {
                                            cursor: "pointer"
                                        }
                                        : {})
                                }}
                            >
                                <WidgetRenderer
                                    widget={child}
                                    context={context}
                                    handlers={handlers}
                                    onSelect={onSelect}
                                />
                            </Box>
                        ))}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}