
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
