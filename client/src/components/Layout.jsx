import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <nav>
        <Link to="/" className="logo">
          <span className="accent">SJ</span> SHARKS
          <span style={{ fontWeight: 400, fontSize: 14, color: '#8b8ba3' }}>2025-26 Yearbook</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Roster</Link>
          <Link to="/goals">All Goals</Link>
          <Link to="/admin">TikTok</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </nav>
      <Outlet />
      <footer className="site-footer">
        <div className="footer-content">
          <span className="footer-brand">Sharks Yearbook 2025-26</span>
          <div className="footer-links">
            <Link to="/terms">Terms of Use</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <a href="https://github.com/jagjothbhullar/sharks-highlights" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
          <p className="footer-disclaimer">
            Not affiliated with the NHL or the San Jose Sharks. A fan project.
          </p>
        </div>
      </footer>
    </>
  );
}
