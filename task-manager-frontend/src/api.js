const BASE_URL = "";
const JSON_HEADERS = {
    "Content-Type": "application/json",
};

async function request(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!response.ok) {
        throw new Error(data?.message || "Server error");
    }

    return data;
}

export function loginUser(credentials) {
    return request("/login", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(credentials),
    });
}

export function registerUser(credentials) {
    return request("/register", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(credentials),
    });
}

export function fetchTasks(token) {
    return request("/tasks", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export function createTask(token, task) {
    return request("/tasks", {
        method: "POST",
        headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
    });
}

export function updateTask(token, taskId, updates) {
    return request(`/tasks/${taskId}`, {
        method: "PUT",
        headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    });
}

export function deleteTask(token, taskId) {
    return request(`/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
