
export function getAuthToken() {
    return (
        sessionStorage.getItem("access_token") ||
        localStorage.getItem("access_token")
    );
}

export function getAuthUser() {
    const user =
        sessionStorage.getItem("auth_user") ||
        localStorage.getItem("auth_user");

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

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("auth_user");
}
