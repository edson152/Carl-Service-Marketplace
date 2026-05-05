import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const dest = from || (user.role === 'admin' ? '/admin' : user.role === 'provider' ? '/provider/dashboard' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page auth-page">
      <div className="auth-container fade-in">
        <div className="auth-header">
          <Link to="/" className="auth-brand">⚡ CarlServices</Link>
          <h1>Welcome back</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" required placeholder="Enter your password"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign up as Customer</Link></p>
          <p style={{marginTop:8}}>Are you a service provider? <Link to="/register/provider">Register here</Link></p>
        </div>

        <div className="demo-hint">
          <strong>Demo credentials:</strong><br/>
          Admin: carl@carlservices.com / Admin@Carl2024
        </div>
      </div>

      <style>{`
        .auth-page { display: flex; align-items: center; justify-content: center; padding: 100px 16px 60px; background: var(--bg); }
        .auth-container { width: 100%; max-width: 440px; }
        .auth-header { text-align: center; margin-bottom: 32px; }
        .auth-brand { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: var(--primary); display: block; margin-bottom: 20px; }
        .auth-header h1 { font-size: 1.8rem; margin-bottom: 8px; }
        .auth-header p { color: var(--text-3); }
        .auth-divider { text-align: center; position: relative; margin: 24px 0; }
        .auth-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--border); }
        .auth-divider span { background: var(--bg); padding: 0 12px; color: var(--text-3); font-size: 0.82rem; position: relative; }
        .auth-footer { text-align: center; font-size: 0.9rem; }
        .auth-footer a { color: var(--primary); font-weight: 600; }
        .demo-hint { margin-top: 20px; background: var(--info-bg); color: var(--info); padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.82rem; text-align: center; }
      `}</style>
    </div>
  );
};

export default Login;
