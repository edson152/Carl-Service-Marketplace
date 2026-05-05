import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const endpoint = user.role === 'admin' ? '/admin/notifications' : '/bookings/notifications/me';
      api.get(endpoint).then(r => {
        const unread = r.data.filter(n => !n.is_read).length;
        setNotifCount(unread);
      }).catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false); };

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/provider/dashboard' : '/dashboard';

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <div className="nav-inner">
          <Link to="/" className="nav-brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-text">Carl<span>Services</span></span>
          </Link>

          <div className={`nav-links${mobileOpen ? ' open' : ''}`}>
            <Link to="/services" className="nav-link" onClick={() => setMobileOpen(false)}>Browse Services</Link>
            {!user && <>
              <Link to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register/provider" className="btn btn-outline btn-sm" onClick={() => setMobileOpen(false)}>Become a Provider</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>}
            {user && <>
              <Link to={dashboardPath} className="nav-link" onClick={() => setMobileOpen(false)}>
                Dashboard {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
              </Link>
              <div className="nav-user">
                <div className="nav-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <div className="nav-user-info">
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                  <span className="nav-user-role">{user.role}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>}
          </div>

          <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: var(--bg); border-bottom: 1px solid transparent;
          transition: all 0.3s ease; padding: 0;
        }
        .navbar.scrolled {
          background: rgba(255,248,243,0.97);
          border-bottom-color: var(--border);
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(12px);
        }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; height: 70px; }
        .nav-brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .brand-icon { font-size: 1.4rem; }
        .brand-text { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: var(--text); }
        .brand-text span { color: var(--primary); }
        .nav-links { display: flex; align-items: center; gap: 8px; }
        .nav-link { font-weight: 500; font-size: 0.92rem; color: var(--text-2); padding: 6px 10px; border-radius: var(--radius-sm); transition: color 0.2s; position: relative; }
        .nav-link:hover { color: var(--primary); }
        .nav-user { display: flex; align-items: center; gap: 8px; padding: 4px 10px; border-radius: var(--radius-md); background: var(--bg-alt); }
        .nav-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .nav-user-info { display: flex; flex-direction: column; }
        .nav-user-name { font-size: 0.82rem; font-weight: 600; line-height: 1.2; }
        .nav-user-role { font-size: 0.7rem; color: var(--text-3); text-transform: capitalize; }
        .notif-badge { background: var(--primary); color: white; border-radius: 20px; font-size: 0.65rem; padding: 1px 6px; font-weight: 700; margin-left: 4px; }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; transition: all 0.3s; }
        @media (max-width: 768px) {
          .hamburger { display: flex; }
          .nav-links { display: none; flex-direction: column; position: absolute; top: 70px; left: 0; right: 0; background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px; gap: 12px; box-shadow: var(--shadow-md); }
          .nav-links.open { display: flex; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
