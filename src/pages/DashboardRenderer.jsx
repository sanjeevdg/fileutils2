import React, {useState,useEffect} from "react";

import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardContent
} from "@mui/material";
import WidgetRenderer from "./WidgetRenderer";

export default function DashboardRenderer({
    node,
    context = {},
    handlers = {}
}) {

    const customers = context.customers || [];
    const orders = context.orders || [];
    const selectedCustomer = context.selectedUser;

const [stats, setStats] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {

    if (!node?.stats?.length) {
        setStats([]);
        return;
    }

    const loadStats = async () => {

        try {

            setError("");

            console.log("========== STATS DEBUG ==========");
            console.log("SELECTED CUSTOMER:", selectedCustomer);
            console.log("SELECTED CUSTOMER ID:", selectedCustomer?.id);
            console.log("STATS CONFIG:", node.stats);
            console.log("=================================");

            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/api/stats`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            stats: node.stats,
                            selectedCustomerId:
                                selectedCustomer?.id ?? null
                        }),
                    }
                );

            const responseText =
                await response.text();

            console.log(
                "STATS RESPONSE STATUS:",
                response.status
            );

            console.log(
                "STATS RESPONSE:",
                responseText
            );

            if (!response.ok) {
                throw new Error(
                    `Stats request failed: ${response.status} - ${responseText}`
                );
            }

            const data =
                JSON.parse(responseText);

            setStats(data);

        }
        catch (err) {

            console.error(
                "Dashboard stats error:",
                err
            );

            setError(err.message);
        }
    };

    loadStats();

}, [node, selectedCustomer?.id]);

    // -----------------------------------------
    // ORDERS FOR SELECTED CUSTOMER
    // -----------------------------------------

    const customerOrders = selectedCustomer
        ? orders.filter(
            order =>
                Number(order.customer_id) ===
                Number(selectedCustomer.id)
        )
        : [];


    // -----------------------------------------
    // SEARCH
    // -----------------------------------------

    const handleSearch = (event) => {

        if (handlers.handleSearch) {
            handlers.handleSearch(event);
        }

    };


    // -----------------------------------------
    // CUSTOMER SELECTION
    // -----------------------------------------

    const handleCustomerClick = (customer) => {

        if (handlers.selectCustomer) {
            handlers.selectCustomer(customer);
        }

    };

    // -----------------------------------------
    // YAML WIDGETS
    // -----------------------------------------
console.log("DASHBOARD NODE:", node);
console.log("DASHBOARD WIDGETS:", node?.widgets);
   
    // -----------------------------------------
    // RENDER
    // -----------------------------------------

    return (

        <Box
            sx={{
                maxWidth: "xl",
                mx: "auto",
                py: 3
            }}
        >

        {node?.widgets?.length > 0 && (
            <Grid
                container
                spacing={2}
                sx={{
                    mb: 3
                }}
            >

                {node.widgets.map((widget, index) => (
                    <Grid
                        key={widget.id || index}
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 3
                        }}
                    >
                        <WidgetRenderer
                            widget={widget}
                            context={context}
                            handlers={handlers}
                        />
                    </Grid>
                ))}

            </Grid>
        )}


            {/* ================================= */}
            {/* TITLE */}
            {/* ================================= */}

            <Typography
                variant="h4"
                gutterBottom
            >
                {node.title || "Customer Dashboard"}
            </Typography>


            <Grid
                container
                spacing={3}
            >


                {/* ================================= */}
                {/* CUSTOMER LIST */}
                {/* ================================= */}

                <Grid
                    size={{
                        xs: 12,
                        md: 4
                    }}
                >

                    <Paper
                        elevation={2}
                        sx={{
                            p: 2
                        }}
                    >

                        <Typography
                            variant="h6"
                            gutterBottom
                        >
                            Customers
                        </Typography>


                        <TextField
                            label="Search customers"
                            fullWidth
                            size="small"
                            value={context.search || ""}
                            onChange={handleSearch}
                            sx={{
                                mb: 2
                            }}
                        />


                        <Table
                            size="small"
                        >

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        First Name
                                    </TableCell>

                                    <TableCell>
                                        Last Name
                                    </TableCell>

                                </TableRow>

                            </TableHead>


                            <TableBody>

                                {customers.map(customer => (

                                    <TableRow
                                        key={customer.id}
                                        hover
                                        selected={
                                            selectedCustomer?.id ===
                                            customer.id
                                        }
                                        onClick={() =>
                                            handleCustomerClick(customer)
                                        }
                                        sx={{
                                            cursor: "pointer"
                                        }}
                                    >

                                        <TableCell>
                                            {customer.first_name}
                                        </TableCell>

                                        <TableCell>
                                            {customer.last_name}
                                        </TableCell>

                                    </TableRow>

                                ))}

                            </TableBody>

                        </Table>

                    </Paper>

                </Grid>


                {/* ================================= */}
                {/* RIGHT SIDE */}
                {/* ================================= */}

                <Grid
                    size={{
                        xs: 12,
                        md: 8
                    }}
                >


                    {/* ================================= */}
                    {/* CUSTOMER SUMMARY */}
                    {/* ================================= */}

                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            mb: 3
                        }}
                    >

                        <Typography
                            variant="h6"
                            gutterBottom
                        >
                            Customer Details
                        </Typography>


                        {selectedCustomer ? (

                            <>
                                <Typography
                                    variant="h5"
                                >
                                    {selectedCustomer.first_name}{" "}
                                    {selectedCustomer.last_name}
                                </Typography>


                                <Typography
                                    color="text.secondary"
                                >
                                    {selectedCustomer.email}
                                </Typography>


                                <Typography
                                    color="text.secondary"
                                >
                                    {selectedCustomer.city}
                                </Typography>

                            </>

                        ) : (

                            <Typography
                                color="text.secondary"
                            >
                                Select a customer
                            </Typography>

                        )}

                    </Paper>


                    {/* ================================= */}
{/* STAT CARDS */}
{/* ================================= */}

<Grid
    container
    spacing={2}
    sx={{
        mb: 3
    }}
>

    {stats.map((stat, index) => (

        <Grid
            key={index}
            size={{
                xs: 12,
                sm: 4
            }}
        >

            <Card>

                <CardContent>

                    <Typography
                        color="text.secondary"
                    >
                        {stat.title}
                    </Typography>

                    <Typography
                        variant="h4"
                    >
                        {stat.value}
                    </Typography>

                </CardContent>

            </Card>

        </Grid>

    ))}

</Grid>


                    {/* ================================= */}
                    {/* RECENT ORDERS */}
                    {/* ================================= */}

                    <Paper
                        elevation={2}
                        sx={{
                            p: 3
                        }}
                    >

                        <Typography
                            variant="h6"
                            gutterBottom
                        >
                            Recent Orders
                        </Typography>


                        <Table
                            size="small"
                        >

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        Date
                                    </TableCell>

                                    <TableCell>
                                        Product
                                    </TableCell>

                                    <TableCell>
                                        Quantity
                                    </TableCell>

                                    <TableCell>
                                        Amount
                                    </TableCell>

                                    <TableCell>
                                        Status
                                    </TableCell>

                                </TableRow>

                            </TableHead>


                            <TableBody>

                                {customerOrders
                                    .slice(0, 10)
                                    .map(order => (

                                        <TableRow
                                            key={order.id}
                                            hover
                                        >

                                            <TableCell>
                                                {order.order_date}
                                            </TableCell>


                                            <TableCell>
                                                {order.product}
                                            </TableCell>


                                            <TableCell>
                                                {order.quantity}
                                            </TableCell>


                                            <TableCell>
                                                ${Number(
                                                    order.amount || 0
                                                ).toFixed(2)}
                                            </TableCell>


                                            <TableCell>
                                                {order.status}
                                            </TableCell>

                                        </TableRow>

                                    ))}

                            </TableBody>

                        </Table>

                    </Paper>

                </Grid>

            </Grid>

        </Box>
    );
}
