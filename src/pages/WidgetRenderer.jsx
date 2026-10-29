    import React from "react";

import DashboardRenderer from "./DashboardRenderer";
import ChartRenderer from "./ChartRenderer";
import StatRenderer from "./StatRenderer";
import TableRenderer from "./TableRenderer";
import DetailRenderer from "./DetailRenderer";
import DataGridRenderer from "./DataGridRenderer";
import TextFieldRenderer from "./TextFieldRenderer";
import SelectRenderer from "./SelectRenderer";
import CheckboxRenderer from "./CheckboxRenderer";
import RadioRenderer from "./RadioRenderer";
import AccordionRenderer from "./AccordionRenderer";
import MultiSelectRenderer from "./MultiSelectRenderer";
import DetailGridRenderer from "./DetailGridRenderer";
import DatePickerRenderer from "./DatePickerRenderer";
import ImagesRenderer from "./ImagesRenderer";
import ProductCardRenderer from "./ProductCardRenderer";
import PaymentRenderer from "./PaymentRenderer";
import ShoppingCartRenderer from "./ShoppingCartRenderer";
import MyOrdersRenderer from "./MyOrdersRenderer";
import MasterDetailDataGrid from "./MasterDetailDataGrid";


import {
    Button,
    Typography,Box, CircularProgress
} from "@mui/material";


export default function WidgetRenderer({
    widget,
    context = {},
    handlers = {},
    onSelect = null
}) {
    
     const formData = context?.formData || {};

//    console.log("WIDGET RENDERER:", widget);

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
        case "datagrid":

            return (
                <DataGridRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );    
        case "masterDetailDataGrid":
            return (
                <MasterDetailDataGrid
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );    
        case "detailGrid":
            return (
                <DetailGridRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );    
        case "textfield":
            return (
                <TextFieldRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );    
        case "images":
            return (
                <ImagesRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );    
        case "productCard":
            return (
                <ProductCardRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );   
        case "payment":
            return (
                <PaymentRenderer
                    widget={widget}
                    context={context}
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
        case "select":
                return (
                    <SelectRenderer
                        widget={widget}
                        context={context}
                        handlers={handlers}
                    />
                );
        case "datePicker":
                return (
                    <DatePickerRenderer
                        widget={widget}
                        context={context}
                        handlers={handlers}
                    />
                );        
        case "multiselect":

            return (
                <MultiSelectRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );        
         case "checkbox":
            return (
                <CheckboxRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );       

         case "radio":
            return (
                <RadioRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );   
         case "typography":

            return (
                <Typography
                    {...(widget.props || {})}
                    onClick={
                        widget.events?.onClick
                            ? () => handlers[widget.events.onClick]?.()
                            : undefined
                    }
                >
                    {widget.props?.text || widget.text || ""}
                </Typography>
            );        

        case "shoppingCart":
            return (
                <ShoppingCartRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                />
            );    
        
            case "button": {
                const action = widget.events?.onClick;
                const isLoginButton = action === "login";
                const isLoading = isLoginButton && context?.loggingIn === true;

                return (
                    <Button
                        {...(widget.props || {})}
                        disabled={
                            Boolean(widget.props?.disabled) ||
                            Boolean(isLoading)
                        }
                        onClick={() => {
                if (isLoading) return;

                if (action && handlers?.[action]) {
                    if (action === "saveOrder") {
                        handlers[action](
                            context?.formData || {},
                            widget
                        );
                    } else {
                        handlers[action](widget);
                    }
                }
            }}
        >
            {isLoading && (
                <CircularProgress
                    size={18}
                    color="inherit"
                    sx={{ mr: 1 }}
                />
            )}

            {isLoading
                ? "Signing In..."
                : widget.text || "Button"}

                    </Button>
                );
            }

        case "accordion":
            return (
                <AccordionRenderer
                    widget={widget}
                    context={context}
                    handlers={handlers}
                    onSelect={onSelect}
                />
            );
                
        case "container":
                return (
                    <Box
                        sx={{
                            border: "1px dashed",
                            borderColor: "grey.400",
                            borderRadius: 1,
                            p: 2,
                            minHeight: 100
                        }}
                    >
                        {widget.children?.map(child => (
                            <Box
                                key={child.id}
                                onClick={(event) => {
                                    event.stopPropagation();

                                    if (onSelect) {
                                        onSelect(child);
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
                    </Box>
                );    
            case "myOrders":
                return (
                    <MyOrdersRenderer
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