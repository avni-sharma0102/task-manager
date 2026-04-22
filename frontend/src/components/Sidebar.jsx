import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const handleMenuClick = (itemId) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'tasks':
        navigate('/dashboard?filter=All');
        break;
      case 'completed':
        navigate('/dashboard?filter=Completed');
        break;
      case 'pending':
        navigate('/dashboard?filter=Pending');
        break;
      case 'settings':
        navigate('/profile');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  // Get current filter from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const currentFilter = searchParams.get('filter') || 'All';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', filter: 'All' },
    { id: 'tasks', label: 'Tasks', filter: 'All' },
    { id: 'completed', label: 'Completed', filter: 'Completed' },
    { id: 'pending', label: 'Pending', filter: 'Pending' },
    { id: 'settings', label: 'Settings', filter: null },
  ];

  // Determine active menu item
  const isOnDashboard = location.pathname === '/dashboard';
  const isOnProfile = location.pathname === '/profile';

  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">F</div>
          <span className="logo-text">Feshikha</span>
        </div>
      </div>

      {/* Menu Section */}
      <div className="sidebar-section">
        <h3 className="section-title">Menu</h3>
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            let isActive = false;
            
            if (isOnDashboard && item.id !== 'settings') {
              isActive = item.filter === currentFilter;
            } else if (isOnProfile && item.id === 'settings') {
              isActive = true;
            }
            
            return (
              <a
                key={item.id}
                href="#"
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick(item.id);
                }}
              >
                <span className="menu-label">{item.label}</span>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </a>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="sidebar-section">
        <h3 className="section-title">Profile</h3>
        <button 
          className="user-profile"
          onClick={() => navigate('/profile')}
          title="View Profile"
        >
          <div className="user-avatar">U</div>
          <div className="user-info">
            <div className="user-email">{userEmail}</div>
          </div>
        </button>
      </div>

      {/* Footer Section */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
