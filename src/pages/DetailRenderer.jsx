import React from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography
} from "@mui/material";

import FormRenderer from "./FormRenderer";
import ListRenderer from "./ListRenderer";
import WorkflowRenderer from "./WorkflowRenderer";

export default function DetailRenderer({
    page,
    entity,
    record,
    config,
    onNavigate,
    onSave,
    onDelete,
    onAction
}) {

    if (!record) {
        return (
            <Typography>
                Record not found
            </Typography>
        );
    }

    const sections = page.sections || [];

    return (

        <Box sx={{ width: "100%" }}>

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
            >

                <Typography variant="h5">
                    {page.title || `${entity.singular} Details`}
                </Typography>

                <Button
                    variant="outlined"
                    onClick={() =>
                        onNavigate?.({
                            page: `${page.entity}-list`
                        })
                    }
                >
                    Back
                </Button>

            </Stack>


            <Stack spacing={3}>

                {sections.map((section, index) => {

                    switch (section.type) {

                        case "form":

                            return (
                                <Card key={index}>
                                    <CardContent>

                                        <FormRenderer
                                            entity={
                                                config.entities[
                                                    section.entity
                                                ]
                                            }
                                            config={config}
                                            record={record}
                                            readonly={
                                                section.readonly ?? false
                                            }
                                            onSave={onSave}
                                        />

                                    </CardContent>
                                </Card>
                            );


                        case "child-list": {

                            const childEntity =
                                config.entities[
                                    section.entity
                                ];

                            if (!childEntity) {
                                return null;
                            }

                            return (
                                <Card key={index}>
                                    <CardContent>

                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{ mb: 2 }}
                                        >

                                            <Typography variant="h6">
                                                {childEntity.label}
                                            </Typography>

                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() =>
                                                    onNavigate?.({
                                                        page: `${section.entity}-form`,
                                                        parentId:
                                                            record[
                                                                entity.key
                                                            ]
                                                    })
                                                }
                                            >
                                                New {
                                                    childEntity.singular
                                                }
                                            </Button>

                                        </Stack>

                                        <Divider sx={{ mb: 2 }} />

                                        <ListRenderer
                                            page={{
                                                type: "list",
                                                entity: section.entity,
                                                columns:
                                                    childEntity.list
                                                        ?.columns
                                            }}
                                            entity={childEntity}
                                            data={[]}
                                            onNavigate={
                                                onNavigate
                                            }
                                        />

                                    </CardContent>
                                </Card>
                            );
                        }


                        case "workflow":

                            return (
                                <Card key={index}>
                                    <CardContent>

                                        <WorkflowRenderer
                                            entity={
                                                config.entities[
                                                    section.entity
                                                ]
                                            }
                                            record={record}
                                            onAction={
                                                onAction
                                            }
                                        />

                                    </CardContent>
                                </Card>
                            );


                        default:
                            return null;
                    }

                })}

            </Stack>

        </Box>
    );
}