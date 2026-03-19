function TaskCard({ task, onDelete }) {
  return (
    <div className="task">
      <h3>{task.title}</h3>

      <span className={`badge ${task.priority.toLowerCase()}`}>
        {task.priority}
      </span>

      <p>📅 {task.deadline}</p>

      <button onClick={() => onDelete(task._id)}>Delete</button>
    </div>
  );
}

export default TaskCard;