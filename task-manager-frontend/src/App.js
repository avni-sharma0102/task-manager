import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
    createTask,
    deleteTask,
    fetchTasks,
    loginUser,
    registerUser,
    updateTask,
} from "./api";
import "./App.css";

const PRIORITY_OPTIONS = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
];

const PRIORITY_RANK = {
    High: 3,
    Medium: 2,
    Low: 1,
};

function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
        const priorityDiff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

function AuthPage({ onAuth }) {
    const [authMode, setAuthMode] = useState("login");
    const [loginError, setLoginError] = useState("");
    const [registerError, setRegisterError] = useState("");
    const [loginBusy, setLoginBusy] = useState(false);
    const [registerBusy, setRegisterBusy] = useState(false);

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setLoginBusy(true);
        setLoginError("");

        const form = new FormData(event.target);
        const payload = {
            email: form.get("email")?.trim(),
            password: form.get("password")?.trim(),
        };

        try {
            const data = await loginUser(payload);
            onAuth(data);
        } catch (error) {
            setLoginError(error.message);
        } finally {
            setLoginBusy(false);
        }
    };

    const handleRegisterSubmit = async (event) => {
        event.preventDefault();
        setRegisterBusy(true);
        setRegisterError("");

        const form = new FormData(event.target);
        const payload = {
            name: form.get("name")?.trim(),
            email: form.get("email")?.trim(),
            password: form.get("password")?.trim(),
        };

        try {
            const data = await registerUser(payload);
            onAuth(data);
        } catch (error) {
            setRegisterError(error.message);
        } finally {
            setRegisterBusy(false);
        }
    };

    return (
        <div className="page-shell auth-page">
            <div className="auth-hero">
                <div className="hero-copy">
                    <h1>Task manager made simple.</h1>
                    <p>Sign in or create an account to start organizing your work with priorities.</p>
                </div>
                <div className="auth-hero-image" aria-hidden="true" />
            </div>
            <div className="auth-grid single-card">
                <div className="auth-card-wrap auth-card-tabs">
                    <div className="auth-tab-row">
                        <button
                            type="button"
                            className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                            onClick={() => setAuthMode("login")}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className={`auth-tab ${authMode === "register" ? "active" : ""}`}
                            onClick={() => setAuthMode("register")}
                        >
                            Register
                        </button>
                    </div>

                    {authMode === "login" ? (
                        <>
                            <h2>Welcome Back 👋</h2>
                            <form onSubmit={handleLoginSubmit}>
                                <label>
                                    Email
                                    <input name="email" type="email" placeholder="Email" required />
                                </label>
                                <label>
                                    Password
                                    <input name="password" type="password" placeholder="Password" required />
                                </label>
                                <button type="submit" className="primary-button" disabled={loginBusy}>
                                    {loginBusy ? "Logging in..." : "Login"}
                                </button>
                                {loginError && <div className="form-error">{loginError}</div>}
                            </form>
                        </>
                    ) : (
                        <>
                            <h2>Create Account 🚀</h2>
                            <form onSubmit={handleRegisterSubmit}>
                                <label>
                                    Name
                                    <input name="name" placeholder="Name" required />
                                </label>
                                <label>
                                    Email
                                    <input name="email" type="email" placeholder="Email" required />
                                </label>
                                <label>
                                    Password
                                    <input name="password" type="password" placeholder="Password" required />
                                </label>
                                <button type="submit" className="secondary-button" disabled={registerBusy}>
                                    {registerBusy ? "Creating..." : "Register"}
                                </button>
                                {registerError && <div className="form-error">{registerError}</div>}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function Dashboard({ user, token, onLogout, theme, toggleTheme }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [taskError, setTaskError] = useState("");
    const [form, setForm] = useState({ title: "", description: "", priority: "Medium" });
    const [saving, setSaving] = useState(false);
    const [filterPriority, setFilterPriority] = useState("All");
    const [editingTask, setEditingTask] = useState(null);
    const [editForm, setEditForm] = useState({ title: "", description: "", priority: "Medium" });

    useEffect(() => {
        async function loadTasks() {
            setLoading(true);
            setTaskError("");
            try {
                const data = await fetchTasks(token);
                setTasks(sortTasks(data));
            } catch (error) {
                setTaskError(error.message);
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            loadTasks();
        }
    }, [token]);

    const taskCount = tasks.length;
    const completedCount = tasks.filter((task) => task.isCompleted).length;
    const pendingCount = taskCount - completedCount;
    const completionRate = taskCount ? Math.round((completedCount / taskCount) * 100) : 0;
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const calendarDay = now.getDate();
    const calendarMonth = monthNames[now.getMonth()];
    const calendarYear = now.getFullYear();
    const sortedTasks = useMemo(() => sortTasks(tasks), [tasks]);
    const filteredTasks = useMemo(() => {
        if (filterPriority === "All") return sortedTasks;
        return sortedTasks.filter((task) => task.priority === filterPriority);
    }, [sortedTasks, filterPriority]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleFilterChange = (event) => {
        setFilterPriority(event.target.value);
    };

    const handleEditClick = (task) => {
        setEditingTask(task);
        setEditForm({
            title: task.title,
            description: task.description || "",
            priority: task.priority || "Medium",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;
        setEditForm((current) => ({ ...current, [name]: value }));
    };

    const handleSaveEdit = async (taskId) => {
        if (!editForm.title.trim()) {
            setTaskError("Task title is required.");
            return;
        }

        setSaving(true);
        setTaskError("");
        try {
            const updatedTask = await updateTask(token, taskId, {
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                priority: editForm.priority,
            });
            setTasks((current) => sortTasks(current.map((item) => (item.id === updatedTask.id ? updatedTask : item))));
            setEditingTask(null);
            setEditForm({ title: "", description: "", priority: "Medium" });
        } catch (error) {
            setTaskError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingTask(null);
        setEditForm({ title: "", description: "", priority: "Medium" });
        setTaskError("");
    };

    const handleAddTask = async (event) => {
        event.preventDefault();
        if (!form.title.trim()) {
            setTaskError("Task title is required.");
            return;
        }

        setSaving(true);
        setTaskError("");
        try {
            const newTask = await createTask(token, {
                title: form.title.trim(),
                description: form.description.trim(),
                priority: form.priority,
            });
            setTasks((current) => sortTasks([newTask, ...current]));
            setForm({ title: "", description: "", priority: "Medium" });
        } catch (error) {
            setTaskError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            const updatedTask = await updateTask(token, task.id, {
                isCompleted: !task.isCompleted,
            });
            setTasks((current) => sortTasks(current.map((item) => (item.id === updatedTask.id ? updatedTask : item))));
        } catch (error) {
            setTaskError(error.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(token, taskId);
            setTasks((current) => current.filter((item) => item.id !== taskId));
        } catch (error) {
            setTaskError(error.message);
        }
    };

    return (
        <div className="page-shell dashboard-page">
            <header className="dashboard-header">
                <div>
                    <p className="eyebrow">Welcome back, {user.name}</p>
                    <h1>Manage your tasks in one place.</h1>
                    <p className="subtext">Stay focused with priority-based tasks and quick action controls.</p>
                </div>
                <div className="header-actions">
                    <button className="theme-toggle-button" onClick={toggleTheme}>
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                    <button className="logout-button" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <section className="dashboard-stats">
                <article className="stat-card">
                    <span className="stat-label">Total tasks</span>
                    <strong>{taskCount}</strong>
                </article>
                <article className="stat-card">
                    <span className="stat-label">Completed</span>
                    <strong>{completedCount}</strong>
                </article>
                <article className="stat-card">
                    <span className="stat-label">Pending</span>
                    <strong>{pendingCount}</strong>
                </article>
            </section>

            <section className="completion-summary">
                <div className="completion-card">
                    <div className="progress-circle" style={{ '--progress': `${completionRate}%` }}>
                        <strong>{completionRate}%</strong>
                    </div>
                    <div className="completion-details">
                        <span className="stat-label">Completion rate</span>
                        <p>Tasks completed this week are reflected here.</p>
                    </div>
                    <div className="calendar-widget">
                        <span className="calendar-day">{calendarDay}</span>
                        <span className="calendar-month">{calendarMonth}</span>
                        <span className="calendar-year">{calendarYear}</span>
                    </div>
                </div>
            </section>

            <section className="task-panel">
                <div className="task-panel-left">
                    <div className="task-hero-card">
                        <div>
                            <p className="hero-label">TaskFlow</p>
                            <h2>Manage the day with clarity.</h2>
                            <p className="hero-copy">A professional workspace for planning, tracking, and finishing fast.</p>
                        </div>
                        <div className="hero-image" />
                    </div>
                    <label>
                        Task title
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Write a short task title"
                        />
                    </label>
                </div>
                <div className="task-panel-right">
                    <label>
                        Task description <span className="optional">(optional)</span>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe the task in detail"
                        />
                    </label>
                    <label>
                        Priority
                        <select name="priority" value={form.priority} onChange={handleChange}>
                            {PRIORITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button className="primary-button add-task-button" onClick={handleAddTask} disabled={saving}>
                        {saving ? "+ Adding..." : "+ Add Task"}
                    </button>
                </div>
            </section>

            <div className="section-header">
                <div>
                    <h2>Your tasks will appear below.</h2>
                    <p className="section-subtitle">Showing {filteredTasks.length} of {taskCount} tasks.</p>
                </div>
                <div className="filter-row">
                    <label>
                        Filter by priority
                        <select value={filterPriority} onChange={handleFilterChange}>
                            <option value="All">All</option>
                            {PRIORITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            {taskError && <div className="inline-error">{taskError}</div>}

            {loading ? (
                <div className="loading-state">Loading tasks…</div>
            ) : taskCount === 0 ? (
                <div className="empty-state-card">
                    <div className="empty-icon">✓</div>
                    <div>
                        <h3>Your task list is empty.</h3>
                        <p>Enter a task above to begin adding to your list.</p>
                    </div>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="empty-state-card">
                    <div className="empty-icon">⚠️</div>
                    <div>
                        <h3>No tasks match that filter.</h3>
                        <p>Try choosing a different priority or clear the filter.</p>
                    </div>
                </div>
            ) : (
                <div className="task-grid">
                    {filteredTasks.map((task) => (
                        <article key={task.id} className={`task-card ${task.isCompleted ? "completed" : ""}`}>
                            <div className="task-card-top">
                                <span className={`priority-chip priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                                <div className="task-card-actions">
                                    <button
                                        className="text-button"
                                        onClick={() => handleEditClick(task)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="status-button"
                                        onClick={() => handleToggleComplete(task)}
                                    >
                                        {task.isCompleted ? "Completed" : "Mark done"}
                                    </button>
                                </div>
                            </div>

                            {editingTask?.id === task.id ? (
                                <div className="edit-panel">
                                    <label>
                                        Title
                                        <input
                                            name="title"
                                            value={editForm.title}
                                            onChange={handleEditFormChange}
                                        />
                                    </label>
                                    <label>
                                        Description
                                        <textarea
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleEditFormChange}
                                        />
                                    </label>
                                    <label>
                                        Priority
                                        <select
                                            name="priority"
                                            value={editForm.priority}
                                            onChange={handleEditFormChange}
                                        >
                                            {PRIORITY_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <div className="edit-actions">
                                        <button className="primary-button" onClick={() => handleSaveEdit(task.id)} disabled={saving}>
                                            Save
                                        </button>
                                        <button className="text-button" onClick={handleCancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3>{task.title}</h3>
                                    <p>{task.description || "No description provided."}</p>
                                    <div className="task-card-footer">
                                        <small>Created on {new Date(task.createdAt).toLocaleDateString()}</small>
                                        <button className="delete-button" onClick={() => handleDeleteTask(task.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

function ProtectedRoute({ token, children }) {
    if (!token) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function App() {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem("taskapp_token") || "");
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("taskapp_user");
        return stored ? JSON.parse(stored) : null;
    });

    const handleAuth = (data) => {
        localStorage.setItem("taskapp_token", data.token);
        localStorage.setItem("taskapp_user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        navigate("/app");
    };

    const [theme, setTheme] = useState(() => localStorage.getItem("taskapp_theme") || "light");

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("taskapp_theme", theme);
    }, [theme]);

    const handleLogout = () => {
        localStorage.removeItem("taskapp_token");
        localStorage.removeItem("taskapp_user");
        setToken("");
        setUser(null);
        navigate("/");
    };

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    };

    return (
        <Routes>
            <Route path="/" element={<AuthPage onAuth={handleAuth} />} />
            <Route
                path="/app"
                element={
                    <ProtectedRoute token={token}>
                        <Dashboard user={user} token={token} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to={token ? "/app" : "/"} replace />} />
        </Routes>
    );
}

export default App;
