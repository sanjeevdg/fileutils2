import React from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    Stack,
    Typography
} from "@mui/material";

export default function WorkflowRenderer({
    entity,
    record,
    onAction
}) {

    const workflow = entity.workflow;

    if (!workflow) {
        return (
            <Alert severity="info">
                No workflow configured.
            </Alert>
        );
    }

    const currentState =
        record?.status ||
        workflow.initialState;

    const transitions =
        workflow.transitions || [];

    const availableTransitions =
        transitions.filter(transition => {

            if (Array.isArray(transition.from)) {
                return transition.from.includes(
                    currentState
                );
            }

            return transition.from === currentState;
        });

    const formatState = (state) =>
        state
            ?.replace(/_/g, " ")
            .replace(/\b\w/g, char =>
                char.toUpperCase()
            );

    return (

        <Box>

            <Typography
                variant="h6"
                sx={{ mb: 2 }}
            >
                Workflow
            </Typography>


            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 3 }}
            >

                <Typography>
                    Current Status:
                </Typography>

                <Chip
                    label={formatState(currentState)}
                    color="primary"
                />

            </Stack>


            {availableTransitions.length > 0 ? (

                <Stack
                    direction="row"
                    spacing={1}
                >

                    {availableTransitions.map(
                        transition => (

                            <Button
                                key={transition.action}
                                variant="contained"
                                onClick={() =>
                                    onAction?.({
                                        action:
                                            transition.action,
                                        entity,
                                        record,
                                        transition
                                    })
                                }
                            >
                                {transition.label}
                            </Button>

                        )
                    )}

                </Stack>

            ) : (

                <Alert severity="info">
                    No actions available for this state.
                </Alert>

            )}

        </Box>
    );
}