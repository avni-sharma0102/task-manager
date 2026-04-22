import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import Toast from '../components/Toast';
import { getAllTasks, createTask as createTaskAPI } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [inputError, setInputError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    taskname: '',
    priority: 'Medium',
    duedate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tasks on mount and check for filter parameter
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    // Check if filter parameter is in URL
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setFilterStatus(filterParam);
    }
    
    loadTasks();
  }, [navigate, searchParams]);

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllTasks();
      const data = response.data || [];
      // Sort tasks by priority: High first, then Medium, then Low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      data.sort((a, b) => {
        const pa = (a.priority || '').toString().toLowerCase();
        const pb = (b.priority || '').toString().toLowerCase();
        const va = priorityOrder[pa] || 0;
        const vb = priorityOrder[pb] || 0;
        if (va !== vb) return vb - va; // descending
        // tie-breaker: earlier due date first
        const da = a.duedate ? new Date(a.duedate) : null;
        const db = b.duedate ? new Date(b.duedate) : null;
        if (da && db) return da - db;
        if (da && !db) return -1;
        if (!da && db) return 1;
        return 0;
      });
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setInputError('');

    if (!form.taskname.trim()) {
      setInputError('Task name is required');
      showToast('Please enter a task name', 'warning');
      return;
    }

    if (form.taskname.trim().length < 3) {
      setInputError('Task name must be at least 3 characters');
      showToast('Task name too short', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTaskAPI(form.taskname, form.priority);
      setForm({
        taskname: '',
        priority: 'Medium',
        duedate: '',
      });
      setInputError('');
      loadTasks();
      showToast('Task created successfully!', 'success');
    } catch (err) {
      setInputError('Failed to create task');
      showToast('Error creating task', 'error');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredTasks = () => {
    if (filterStatus === 'All') {
      return tasks;
    }
    return tasks.filter((task) => task.status === filterStatus);
  };

  const filteredTasks = getFilteredTasks();

  const getTaskStats = () => {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      pending: tasks.filter((t) => t.status === 'Pending').length,
    };
  };

  const stats = getTaskStats();
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <Header title="Dashboard" subtitle="Overview of your tasks" />

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card stat-completed">
            
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
            <div className="stat-progress">
              <div className="progress-bar" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
          <div className="stat-card stat-in-progress">
            
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card stat-pending">
            
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        {/* Add Task Form */}
        <div className="add-task-section">
          <div className="add-task-header">
            <h2>Add New Task</h2>
            <p className="form-subtitle">Create a new task and organize your work</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleCreateTask} className="add-task-form">
            {/* Task Name Input */}
            <div className="form-group">
              <label htmlFor="taskname">Task Name</label>
              <input
                type="text"
                id="taskname"
                placeholder="What do you need to do?"
                value={form.taskname}
                onChange={(e) => {
                  setForm({ ...form, taskname: e.target.value });
                  setInputError('');
                }}
                disabled={isSubmitting}
                className={inputError ? 'error' : ''}
              />
              {inputError && <span className="input-error">{inputError}</span>}
            </div>

            {/* Priority and Date Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="duedate">Due Date</label>
                <input
                  type="date"
                  id="duedate"
                  value={form.duedate}
                  onChange={(e) => setForm({ ...form, duedate: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-add-task"
                disabled={isSubmitting}
              >
                  {isSubmitting ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>

        {/* Filter Tabs */}
        <div className="filter-section">
          <div className="filter-tabs">
            {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
                <span className="filter-badge">
                  {status === 'All'
                    ? stats.total
                    : stats[
                        status === 'Completed'
                          ? 'completed'
                          : status === 'In Progress'
                          ? 'inProgress'
                          : 'pending'
                      ]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="tasks-section">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Loading your tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks {filterStatus !== 'All' ? `in ${filterStatus}` : 'yet'}</h3>
              <p>
                {filterStatus === 'All'
                  ? 'No tasks yet. Add your first task to get started.'
                  : `No ${filterStatus.toLowerCase()} tasks.`}
              </p>
              {filterStatus === 'All' && (
                <button
                  className="btn btn-primary btn-cta"
                  onClick={() => document.querySelector('#taskname')?.focus()}
                >
                  Create First Task
                </button>
              )}
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onTaskUpdated={loadTasks}
                  onTaskDeleted={loadTasks}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default Dashboard;