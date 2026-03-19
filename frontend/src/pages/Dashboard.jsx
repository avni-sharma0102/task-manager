import { useState } from "react";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    priority: "Low",
    deadline: ""
  });

  const createTask = () => {
    if (!form.title) {
      alert("Enter task title");
      return;
    }

    const newTask = {
      _id: Date.now(),
      ...form
    };

    setTasks([...tasks, newTask]);

    setForm({
      title: "",
      priority: "Low",
      deadline: ""
    });
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task._id !== id));
  };

  return (
    <div className="container">
      <Navbar />

      <div className="card">
        <h2>Dashboard</h2>

        <input
          placeholder="Task title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <select
          value={form.priority}
          onChange={(e) =>
            setForm({ ...form, priority: e.target.value })
          }
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <input
          type="date"
          value={form.deadline}
          onChange={(e) =>
            setForm({ ...form, deadline: e.target.value })
          }
        />

        <button onClick={createTask}>Add Task</button>
      </div>

      {tasks.length === 0 ? (
        <p>No tasks yet</p>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task._id} task={task} onDelete={deleteTask} />
        ))
      )}
    </div>
  );
}

export default Dashboard;