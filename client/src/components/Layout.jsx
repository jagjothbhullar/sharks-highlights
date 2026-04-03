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
        </div>
      </nav>
      <Outlet />
    </>
  );
}
