
import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken } from "../utils/auth";

export default function ProtectedRoute({ children }) {
    const location = useLocation();
    const isPublicPage =
        location.pathname === "/dashboard/user_login" ||
        location.pathname === "/dashboard/user_signup";

    // Login and signup must never be redirected to themselves.
    if (isPublicPage) {
        return children;
    }
    const token = getAuthToken();

    if (!token) {
        return (
            <Navigate
                to="/dashboard/user_login"
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
}
