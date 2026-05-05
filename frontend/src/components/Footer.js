import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">⚡ CarlServices</div>
          <p>Connecting you with trusted local service professionals across Zimbabwe and South Africa.</p>
          <div className="footer-countries">🇿🇦 South Africa &nbsp;&nbsp; 🇿🇼 Zimbabwe</div>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <Link to="/services?category=Electrician">Electricians</Link>
          <Link to="/services?category=Plumber">Plumbers</Link>
          <Link to="/services?category=Mechanic">Mechanics</Link>
          <Link to="/services?category=Carpenter">Carpenters</Link>
          <Link to="/services">All Services</Link>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <Link to="/register">Sign Up as Customer</Link>
          <Link to="/register/provider">Become a Provider</Link>
          <Link to="/login">Login</Link>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <p>📧 carl@carlservices.com</p>
          <p>🇿🇦 +27 XX XXX XXXX</p>
          <p>🇿🇼 +263 XX XXX XXXX</p>
          <div className="footer-sub">
            <div><strong>ZA Monthly Sub:</strong> ZAR 200</div>
            <div><strong>ZW Monthly Sub:</strong> USD 20</div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Carl Service Marketplace. All rights reserved.</p>
        <p className="text-muted">🇿🇦 South Africa &amp; 🇿🇼 Zimbabwe</p>
      </div>
    </div>
    <style>{`
      .footer { background: var(--secondary); color: rgba(255,255,255,0.85); padding: 60px 0 0; margin-top: 80px; }
      .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 40px; padding-bottom: 48px; }
      .footer-logo { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: white; margin-bottom: 12px; }
      .footer-brand p { font-size: 0.88rem; line-height: 1.7; max-width: 220px; opacity: 0.8; }
      .footer-countries { margin-top: 12px; font-size: 0.82rem; opacity: 0.7; }
      .footer-col h4 { font-family: var(--font-heading); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 16px; }
      .footer-col a, .footer-col p { display: block; color: rgba(255,255,255,0.75); font-size: 0.88rem; margin-bottom: 8px; transition: color 0.2s; }
      .footer-col a:hover { color: var(--accent); }
      .footer-sub { margin-top: 16px; font-size: 0.82rem; opacity: 0.8; line-height: 1.8; }
      .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding: 20px 0; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; opacity: 0.65; }
      @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 600px) { .footer-grid { grid-template-columns: 1fr; } .footer-bottom { flex-direction: column; gap: 8px; text-align: center; } }
    `}</style>
  </footer>
);

export default Footer;
