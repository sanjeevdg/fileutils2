
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Tooltip
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import { logout, getAuthUser } from "../utils/auth";


const DRAWER_WIDTH = 240;

const iconMap = {
    dashboard: DashboardIcon,
    inventory: Inventory2Icon,
    "shopping-cart": ShoppingCartIcon,
    user: PersonIcon,
    logout: LogoutIcon
};

export default function YamlNavigationLayout({
    config,
    children
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const [profileAnchor, setProfileAnchor] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

   const navigationConfig = config?.navigation || {};

    const authUser = getAuthUser();
    const role = authUser?.role;

    const roleProfile = navigationConfig.profiles?.[role];

    const {
        profiles,
        ...pageNavigationOverrides
    } = navigationConfig;

    const navigation = roleProfile
        ? {
            ...roleProfile,
            ...pageNavigationOverrides,
            enabled:
                pageNavigationOverrides.enabled ??
                roleProfile.enabled ??
                true,
        }
        : navigationConfig;


    const isLoginOrSignup =
        location.pathname === "/dashboard/user_login" ||
        location.pathname === "/dashboard/user_signup";

    // Do not render navigation on login/signup pages
    // or when the YAML configuration disables it.
    if (
        isLoginOrSignup ||
        navigation?.enabled !== true
    ) {
        return children;
    }

    const topMenu = navigation.topMenu || [];
    const sidebarItems = navigation.sidebar || [];

    const closeProfileMenu = () => {
        setProfileAnchor(null);
    };

    const handleNavigationItem = (item) => {
        closeProfileMenu();
        setMobileOpen(false);

        if (item.action === "logout") {
            logout();
            navigate("/dashboard/user_login", {
                replace: true
            });
            return;
        }

        if (item.route) {
            navigate(item.route);
        }
    };

    const renderSidebar = () => (
        <Box sx={{ overflowY: "auto", height: "100%" }}>
            <Box sx={{ p: 2 }}>
                <Typography
                    variant="subtitle2"
                    color="text.secondary"
                >
                    NAVIGATION
                </Typography>
            </Box>

            <Divider />

            <List>
                {sidebarItems.map((item) => {
                    const Icon =
                        iconMap[item.icon] || DashboardIcon;

                    const selected =
                        item.route === location.pathname;

                    return (
                        <ListItemButton
                            key={item.id || item.label}
                            selected={selected}
                            onClick={() =>
                                handleNavigationItem(item)
                            }
                        >
                            <ListItemIcon>
                                <Icon />
                            </ListItemIcon>

                            <ListItemText
                                primary={item.label}
                            />
                        </ListItemButton>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100%",
                width: "100%"
            }}
        >
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) =>
                        theme.zIndex.drawer + 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() =>
                            setMobileOpen(!mobileOpen)
                        }
                        sx={{
                            mr: 2,
                            display: {
                                md: "none"
                            }
                        }}
                        aria-label="Open navigation"
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        {navigation.brand?.title ||
                            "My Application"}
                    </Typography>

                    {topMenu.map((item) => (
                        item.children?.length ? (
                            <Box key={item.id || item.label}>
                                <Tooltip title={item.label}>
                                    <IconButton
                                        color="inherit"
                                        onClick={(event) =>
                                            setProfileAnchor(
                                                event.currentTarget
                                            )
                                        }
                                        aria-label={item.label}
                                    >
                                        <AccountCircleIcon />
                                    </IconButton>
                                </Tooltip>

                                <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                        cursor: "pointer",
                                        mr: 1
                                    }}
                                    onClick={(event) =>
                                        setProfileAnchor(
                                            event.currentTarget
                                        )
                                    }
                                >
                                    {item.label} ▾
                                </Typography>

                                <Menu
                                    anchorEl={profileAnchor}
                                    open={Boolean(profileAnchor)}
                                    onClose={closeProfileMenu}
                                >
                                    {item.children.map(
                                        (child) => {
                                            const ChildIcon =
                                                iconMap[child.icon] ||
                                                (child.action === "logout"
                                                    ? LogoutIcon
                                                    : PersonIcon);

                                            return (
                                                <MenuItem
                                                    key={
                                                        child.id ||
                                                        child.label
                                                    }
                                                    onClick={() =>
                                                        handleNavigationItem(
                                                            child
                                                        )
                                                    }
                                                >
                                                    <ListItemIcon>
                                                        <ChildIcon
                                                            fontSize="small"
                                                        />
                                                    </ListItemIcon>

                                                    <ListItemText
                                                        primary={
                                                            child.label
                                                        }
                                                    />
                                                </MenuItem>
                                            );
                                        }
                                    )}
                                </Menu>
                            </Box>
                        ) : (
                            <MenuItem
                                key={item.id || item.label}
                                onClick={() =>
                                    handleNavigationItem(item)
                                }
                                sx={{ color: "inherit" }}
                            >
                                {item.label}
                            </MenuItem>
                        )
                    ))}
                </Toolbar>
            </AppBar>

            {/* Desktop sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    display: {
                        xs: "none",
                        md: "block"
                    },
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: DRAWER_WIDTH,
                        boxSizing: "border-box"
                    }
                }}
            >
                <Toolbar />
                {renderSidebar()}
            </Drawer>

            {/* Mobile sidebar */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={{
                    display: {
                        xs: "block",
                        md: "none"
                    },
                    "& .MuiDrawer-paper": {
                        width: DRAWER_WIDTH,
                        boxSizing: "border-box"
                    }
                }}
            >
                <Toolbar />
                {renderSidebar()}
            </Drawer>

            {/* Dashboard content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    p: 2
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
