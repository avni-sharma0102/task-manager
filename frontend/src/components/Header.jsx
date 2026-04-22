import { useTheme } from '../context/ThemeContext';
import '../styles/Header.css';

function Header({ title, subtitle }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-info">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="header-actions">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          Theme
        </button>
      </div>
    </header>
  );
}

export default Header;
