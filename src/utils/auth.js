
export function getAuthToken() {

    return localStorage.getItem("access_token");

}


export function getAuthUser() {

    const user = localStorage.getItem("auth_user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }

}


export function getAuthHeaders() {

    const token = getAuthToken();

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};

}


export function logout() {

    localStorage.removeItem("access_token");

    localStorage.removeItem("auth_user");

}


export function isTokenExpired() {

    const token = getAuthToken();

    if (!token) {
        return true;
    }

    try {

        const payload = JSON.parse(
            atob(
                token.split(".")[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        if (!payload.exp) {
            return true;
        }

        // JWT exp is in seconds
        const expiryTime = payload.exp * 1000;

        return Date.now() >= expiryTime;

    } catch (error) {

        console.error("Invalid JWT token:", error);

        return true;

    }
}


export function clearExpiredAuth() {

    if (isTokenExpired()) {

        console.log(
            "Authentication token expired. Clearing stored credentials."
        );

        logout();

        return true;
    }

    return false;
}