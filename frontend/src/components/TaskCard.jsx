import { useState } from 'react';
import { updateTask, deleteTask } from '../services/api';
import '../styles/TaskCard.css';

function TaskCard({ task, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    taskname: task.taskname,
    priority: task.priority,
    status: task.status,
    duedate: task.duedate ? task.duedate.split('T')[0] : '',
  });

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
      await updateTask(task._id, task.taskname, task.priority, newStatus, task.duedate);
      onTaskUpdated();
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.taskname) {
      alert('Task name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      await updateTask(
        task._id,
        editForm.taskname,
        editForm.priority,
        editForm.status,
        editForm.duedate
      );
      setIsEditing(false);
      onTaskUpdated();
    } catch (err) {
      console.error('Error updating task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsLoading(true);
      try {
        await deleteTask(task._id);
        onTaskDeleted();
      } catch (err) {
        console.error('Error deleting task:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#ff6b6b';
      case 'Medium':
        return '#ffd93d';
      case 'Low':
        return '#6bcf7f';
      default:
        return '#999';
    }
  };

  const getStatusIcon = () => '';

  if (isEditing) {
    return (
      <div className="task-card editing">
        <form onSubmit={handleSaveEdit} className="edit-form">
          <div className="form-group">
            <input
              type="text"
              value={editForm.taskname}
              onChange={(e) => setEditForm({ ...editForm, taskname: e.target.value })}
              placeholder="Task name"
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                disabled={isLoading}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                disabled={isLoading}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <input
              type="date"
              value={editForm.duedate}
              onChange={(e) => setEditForm({ ...editForm, duedate: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`task-card ${task.status.toLowerCase().replace(' ', '-')}`}>
      <div className="task-header">
        <div className="task-title-section">
          <h3 className="task-title">{task.taskname}</h3>
        </div>
        <div className="task-actions">
          <button
            className="icon-btn edit-btn"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            title="Edit task"
          >
            Edit
          </button>
          <button
            className="icon-btn delete-btn"
            onClick={handleDelete}
            disabled={isLoading}
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="task-body">
        <div className="task-meta">
          <span
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority} Priority
          </span>
          <span className="status-badge">{task.status}</span>
        </div>

        {task.duedate && (
          <div className="task-duedate">
            Due: {new Date(task.duedate).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="task-footer">
        <div className="status-buttons">
          {task.status !== 'Pending' && (
            <button
              className="status-btn"
              onClick={() => handleStatusChange('Pending')}
              disabled={isLoading}
            >
              Pending
            </button>
          )}
          {task.status !== 'In Progress' && (
            <button
              className="status-btn"
              onClick={() => handleStatusChange('In Progress')}
              disabled={isLoading}
            >
              In Progress
            </button>
          )}
          {task.status !== 'Completed' && (
            <button
              className="status-btn"
              onClick={() => handleStatusChange('Completed')}
              disabled={isLoading}
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;