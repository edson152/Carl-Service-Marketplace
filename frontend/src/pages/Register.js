import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ZA_CITIES = ['Johannesburg','Cape Town','Durban','Pretoria','Port Elizabeth','Bloemfontein','East London','Nelspruit','Polokwane','Kimberley'];
const ZW_CITIES = ['Harare','Bulawayo','Mutare','Gweru','Kwekwe','Masvingo','Chinhoyi','Marondera'];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', country:'ZA', city:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cities = form.country === 'ZA' ? ZA_CITIES : ZW_CITIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v, ...(k === 'country' ? { city: '' } : {}) }));

  return (
    <div className="page auth-page">
      <div className="auth-container fade-in" style={{ maxWidth: 500 }}>
        <div className="auth-header">
          <Link to="/" className="auth-brand">⚡ CarlServices</Link>
          <h1>Create Account</h1>
          <p>Sign up to book local services</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" required placeholder="Your full name"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-control" placeholder="+27 XX XXX XXXX"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" required minLength={8} placeholder="Min 8 characters"
              value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Country</label>
              <select className="form-control" value={form.country} onChange={e => set('country', e.target.value)}>
                <option value="ZA">🇿🇦 South Africa</option>
                <option value="ZW">🇿🇼 Zimbabwe</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <select className="form-control" required value={form.city} onChange={e => set('city', e.target.value)}>
                <option value="">Select city</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
          <p style={{marginTop:8}}>Are you a service provider? <Link to="/register/provider">Register as Provider</Link></p>
        </div>
      </div>
      <style>{`
        .auth-page { display: flex; align-items: flex-start; justify-content: center; padding: 100px 16px 60px; }
        .auth-container { width: 100%; }
        .auth-header { text-align: center; margin-bottom: 32px; }
        .auth-brand { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: var(--primary); display: block; margin-bottom: 20px; }
        .auth-header h1 { font-size: 1.8rem; margin-bottom: 8px; }
        .auth-header p { color: var(--text-3); }
        .auth-footer { text-align: center; font-size: 0.9rem; }
        .auth-footer a { color: var(--primary); font-weight: 600; }
      `}</style>
    </div>
  );
};

export default Register;
