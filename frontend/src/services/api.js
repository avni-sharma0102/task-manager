import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const registerUser = (username, email, password) => {
  return api.post('/register', { username, email, password });
};

export const loginUser = (email, password) => {
  return api.post('/login', { email, password });
};

// Task APIs
export const createTask = (taskname, priority) => {
  return api.post('/tasks', { taskname, priority });
};

export const getAllTasks = () => {
  return api.get('/tasks');
};

export const updateTask = (taskId, taskname, priority, status, duedate) => {
  return api.put(`/tasks/${taskId}`, { taskname, priority, status, duedate });
};

export const deleteTask = (taskId) => {
  return api.delete(`/tasks/${taskId}`);
};

export default api;
