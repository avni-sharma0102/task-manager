import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h1>Task Manager</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;