
const routeConfig = [
    { path: "/", layout: "admin" },
    { path: "/file-reader", layout: "admin" },
    { path: "/about", layout: "admin" },
    { path: "/designer/:name", layout: "admin" },

    { path: "/dashboard/new_frontend", layout: "user" },
    { path: "/dashboard/new_payment", layout: "user" },
    { path: "/dashboard/user_profile", layout: "user" },
    { path: "/dashboard/new_payment", layout: "user" },
    { path: "/dashboard/my_orders", layout: "user" }, 
    { path: "/dashboard/user_login", layout: "none" },
    { path: "/dashboard/user_signup", layout: "none" },
];

export default routeConfig;
