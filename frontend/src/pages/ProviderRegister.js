import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['Electrician','Plumber','Mechanic','Carpenter','Painter','Cleaner','Gardener','Tiler','Roofer','HVAC Technician','General Handyman'];
const ZA_CITIES = ['Johannesburg','Cape Town','Durban','Pretoria','Port Elizabeth','Bloemfontein','East London','Nelspruit','Polokwane','Kimberley'];
const ZW_CITIES = ['Harare','Bulawayo','Mutare','Gweru','Kwekwe','Masvingo','Chinhoyi','Marondera'];

const ProviderRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:'', email:'', password:'', phone:'', country:'ZA', city:'',
    category:'', bio:'', experience_years:'', id_number:'', hourly_rate:''
  });

  const cities = form.country === 'ZA' ? ZA_CITIES : ZW_CITIES;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v, ...(k === 'country' ? { city: '' } : {}) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    files.forEach(f => fd.append('documents', f));
    try {
      const { data } = await api.post('/providers/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      localStorage.setItem('csm_token', data.token);
      localStorage.setItem('csm_user', JSON.stringify(data.user));
      navigate('/provider/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const subFee = form.country === 'ZA' ? 'ZAR 200/month' : 'USD 20/month';

  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      <div className="container">
        <div className="prov-reg fade-in">
          <div className="prov-reg-header">
            <Link to="/" className="auth-brand">⚡ CarlServices</Link>
            <h1>Register as Service Provider</h1>
            <p>Join our network of trusted professionals</p>
            <div className="reg-steps">
              {['Basic Info','Professional Details','Documents'].map((s, i) => (
                <div key={i} className={`reg-step${step > i+1 ? ' done' : step === i+1 ? ' active' : ''}`}>
                  <div className="reg-step-num">{step > i+1 ? '✓' : i+1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="prov-form">
            {step === 1 && (
              <div className="fade-in">
                <h3>Basic Information</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-control" required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+27 XX XXX XXXX" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-control" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-control" type="password" required minLength={8} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Country *</label>
                    <select className="form-control" value={form.country} onChange={e => set('country', e.target.value)}>
                      <option value="ZA">🇿🇦 South Africa</option>
                      <option value="ZW">🇿🇼 Zimbabwe</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <select className="form-control" required value={form.city} onChange={e => set('city', e.target.value)}>
                      <option value="">Select city</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="button" className="btn btn-primary btn-lg btn-full" onClick={() => { if (!form.name || !form.email || !form.password || !form.city) return setError('Please fill all required fields'); setError(''); setStep(2); }}>
                  Next: Professional Details →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="fade-in">
                <h3>Professional Details</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Service Category *</label>
                    <select className="form-control" required value={form.category} onChange={e => set('category', e.target.value)}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience *</label>
                    <input className="form-control" type="number" required min={0} max={50} value={form.experience_years} onChange={e => set('experience_years', e.target.value)} placeholder="e.g. 5" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Hourly Rate ({form.country === 'ZA' ? 'ZAR' : 'USD'}) *</label>
                    <input className="form-control" type="number" required min={0} value={form.hourly_rate} onChange={e => set('hourly_rate', e.target.value)} placeholder="e.g. 350" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ID / Passport Number</label>
                    <input className="form-control" value={form.id_number} onChange={e => set('id_number', e.target.value)} placeholder="For verification" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Professional Bio *</label>
                  <textarea className="form-control" required rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Describe your experience, specializations, and what makes you stand out..." />
                </div>
                <div className="flex gap-md">
                  <button type="button" className="btn btn-ghost btn-lg" onClick={() => setStep(1)}>← Back</button>
                  <button type="button" className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => { if (!form.category || !form.experience_years || !form.bio) return setError('Please fill all required fields'); setError(''); setStep(3); }}>
                    Next: Upload Documents →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="fade-in">
                <h3>Upload Supporting Documents</h3>
                <p className="text-muted mb-md">Upload your ID, qualifications, certifications or any relevant documents (max 5 files, 5MB each)</p>

                <div className="upload-zone" onClick={() => document.getElementById('doc-upload').click()}>
                  <div className="upload-icon">📁</div>
                  <div>Click to upload documents</div>
                  <div className="text-muted text-sm">PDF, JPG, PNG accepted</div>
                  {files.length > 0 && <div className="upload-files">{files.map((f,i) => <span key={i} className="upload-file-tag">{f.name}</span>)}</div>}
                </div>
                <input id="doc-upload" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                  onChange={e => setFiles([...e.target.files])} />

                <div className="sub-info">
                  <h4>📋 What happens next?</h4>
                  <div className="sub-steps">
                    <div>1. Admin (Carl) reviews your application</div>
                    <div>2. You receive approval notification</div>
                    <div>3. Pay monthly subscription: <strong>{subFee}</strong></div>
                    <div>4. Your profile goes live for customers to book!</div>
                  </div>
                </div>

                <div className="flex gap-md" style={{ marginTop: 24 }}>
                  <button type="button" className="btn btn-ghost btn-lg" onClick={() => setStep(2)}>← Back</button>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                    {loading ? 'Submitting...' : '🚀 Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div style={{ textAlign:'center', marginTop: 20, fontSize: '0.88rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>

      <style>{`
        .prov-reg { max-width: 620px; margin: 0 auto; }
        .prov-reg-header { text-align: center; margin-bottom: 32px; }
        .auth-brand { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: var(--primary); display: block; margin-bottom: 20px; text-decoration: none; }
        .prov-reg-header h1 { font-size: 1.8rem; margin-bottom: 8px; }
        .prov-reg-header p { color: var(--text-3); }
        .prov-form { background: white; border-radius: var(--radius-xl); padding: 40px; box-shadow: var(--shadow-md); border: 1px solid var(--border); }
        .prov-form h3 { font-size: 1.1rem; margin-bottom: 24px; color: var(--text-2); }
        .reg-steps { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; }
        .reg-step { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-3); }
        .reg-step.active { color: var(--primary); }
        .reg-step.done { color: var(--success); }
        .reg-step-num { width: 24px; height: 24px; border-radius: 50%; border: 2px solid currentColor; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; }
        .reg-step.active .reg-step-num { background: var(--primary); color: white; border-color: var(--primary); }
        .reg-step.done .reg-step-num { background: var(--success); color: white; border-color: var(--success); }
        .upload-zone { border: 2px dashed var(--border); border-radius: var(--radius-lg); padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 24px; }
        .upload-zone:hover { border-color: var(--primary); background: rgba(196,82,26,0.03); }
        .upload-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .upload-files { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 12px; }
        .upload-file-tag { background: var(--primary); color: white; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; }
        .sub-info { background: var(--bg-alt); border-radius: var(--radius-md); padding: 20px; border: 1px solid var(--border); }
        .sub-info h4 { margin-bottom: 12px; font-size: 0.95rem; }
        .sub-steps { display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem; color: var(--text-2); }
      `}</style>
    </div>
  );
};

export default ProviderRegister;
