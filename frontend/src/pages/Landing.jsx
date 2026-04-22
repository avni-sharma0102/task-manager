import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../styles/Landing.css';

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('landing-active');
    return () => document.body.classList.remove('landing-active');
  }, []);

  return (
    <div className="landing-root">
      <header className="landing-hero">
        <div className="hero-inner">
          <div className="hero-content">
          <h1 className="hero-title">Feshikha — Clear, fast task management</h1>
          <p className="hero-sub">Focus on work that matters. Create, prioritize and complete tasks with a minimal, distraction-free interface.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Get started</button>
            <button className="btn" onClick={() => navigate('/login')}>Login</button>
          </div>
          </div>
          <div className="hero-visual" aria-hidden>
          <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="14" width="308" height="192" rx="8" fill="var(--bg)" stroke="var(--border)" />
            <rect x="24" y="34" width="270" height="22" rx="4" fill="var(--accent)" opacity="0.12" />
            <rect x="24" y="68" width="220" height="14" rx="4" fill="var(--border)" opacity="0.18" />
            <rect x="24" y="92" width="180" height="14" rx="4" fill="var(--border)" opacity="0.12" />
            <rect x="24" y="118" width="260" height="44" rx="6" fill="var(--accent)" opacity="0.08" />
          </svg>
          </div>
        </div>
      </header>

      <section className="landing-features">
        <div className="container">
          <h2 className="section-title">Designed for simple productivity</h2>
          <p className="section-sub">A lightweight task manager with clear priorities and fast actions.</p>

          <div className="features-grid">
            <div className="feature">
              <h3>Minimal interface</h3>
              <p>Fewer distractions, faster decisions — everything you need to get tasks done.</p>
            </div>
            <div className="feature">
              <h3>Smart prioritization</h3>
              <p>Set priorities and due dates to keep work organized and focused.</p>
            </div>
            <div className="feature">
              <h3>Reliable sync</h3>
              <p>Cloud-backed persistence so your tasks follow you across devices.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <span>© {new Date().getFullYear()} Feshikha — Built for clarity.</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
