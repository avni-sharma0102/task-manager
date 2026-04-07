const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const users = [];
const sessions = {};
const tasks = [];

function createToken() {
    return crypto.randomBytes(24).toString("hex");
}

function findUser(email) {
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const user = sessions[token];
    if (!user) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
}

app.get("/", (req, res) => {
    res.json({ message: "Task Manager backend is running." });
});

app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (findUser(email)) {
        return res.status(409).json({ message: "Email already registered." });
    }

    const user = {
        id: users.length + 1,
        name,
        email,
        password
    };

    users.push(user);
    const token = createToken();
    sessions[token] = user;

    return res.status(201).json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    const user = findUser(email);
    if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createToken();
    sessions[token] = user;

    return res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1,
};

app.get("/tasks", authenticate, (req, res) => {
    const userTasks = tasks
        .filter((task) => task.userId === req.user.id)
        .sort((a, b) => {
            const value = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (value !== 0) return value;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    res.json(userTasks);
});

app.post("/tasks", authenticate, (req, res) => {
    const { title, description = "", priority = "Medium" } = req.body;
    if (!title) {
        return res.status(400).json({ message: "Title is required." });
    }

    const validPriority = ["High", "Medium", "Low"].includes(priority) ? priority : "Medium";
    const task = {
        id: tasks.length + 1,
        userId: req.user.id,
        title,
        description,
        priority: validPriority,
        isCompleted: false,
        createdAt: new Date().toISOString(),
    };

    tasks.push(task);
    res.status(201).json(task);
});

app.put("/tasks/:id", authenticate, (req, res) => {
    const taskId = Number(req.params.id);
    const task = tasks.find((item) => item.id === taskId && item.userId === req.user.id);

    if (!task) {
        return res.status(404).json({ message: "Task not found." });
    }

    const { title, description, isCompleted, priority } = req.body;
    if (typeof title === "string") task.title = title;
    if (typeof description === "string") task.description = description;
    if (typeof isCompleted === "boolean") task.isCompleted = isCompleted;
    if (typeof priority === "string" && ["High", "Medium", "Low"].includes(priority)) {
        task.priority = priority;
    }

    res.json(task);
});

app.delete("/tasks/:id", authenticate, (req, res) => {
    const taskId = Number(req.params.id);
    const index = tasks.findIndex((item) => item.id === taskId && item.userId === req.user.id);

    if (index === -1) {
        return res.status(404).json({ message: "Task not found." });
    }

    tasks.splice(index, 1);
    res.json({ message: "Task deleted." });
});

module.exports = app;