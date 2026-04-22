import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const userEmail = localStorage.getItem('email');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <h1>Feshikha</h1>
        </div>

        <div className="navbar-center">
          <span className="user-email">{userEmail}</span>
        </div>

        <div className="navbar-menu">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            Theme
          </button>
          <button className="btn-secondary" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-secondary" onClick={() => navigate('/register')}>Get started</button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;