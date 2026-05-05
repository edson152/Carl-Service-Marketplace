import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = { pending:'Pending', accepted:'Accepted', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' };

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('bookings');
  const [subRef, setSubRef] = useState('');
  const [subMsg, setSubMsg] = useState('');

  useEffect(() => {
    api.get('/providers/dashboard/me').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (bookingId, status) => {
    await api.put(`/bookings/${bookingId}/status`, { status });
    setData(d => ({ ...d, bookings: d.bookings.map(b => b.id === bookingId ? { ...b, status } : b) }));
  };

  const submitSub = async () => {
    setSubMsg('');
    try {
      await api.post('/providers/subscription/request', { payment_reference: subRef });
      setSubMsg('✅ Payment reference submitted! Admin will confirm within 24 hours.');
      setSubRef('');
    } catch (err) {
      setSubMsg('❌ ' + (err.response?.data?.error || 'Failed'));
    }
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!data) return <div className="page"><div className="empty-state"><h3>Provider profile not found</h3></div></div>;

  const { provider, bookings, stats, subscriptions } = data;
  const currency = user?.country === 'ZW' ? 'USD' : 'ZAR';
  const subAmount = user?.country === 'ZW' ? 20 : 200;
  const isActive = provider.subscription_status === 'active';
  const isPending = provider.status === 'pending';
  const isRejected = provider.status === 'rejected';
  const isApproved = provider.status === 'approved';

  return (
    <div className="page">
      <div className="container fade-in">
        <div className="dash-header">
          <div>
            <h1>Provider Dashboard</h1>
            <p className="text-muted">{provider.name} · {provider.category} · {user?.city}</p>
          </div>
          <div className="flex gap-sm">
            <span className={`badge badge-${provider.status}`}>{provider.status}</span>
            <span className={`badge badge-${provider.subscription_status}`}>{provider.subscription_status === 'active' ? '✅ Active' : '💤 Inactive'}</span>
          </div>
        </div>

        {/* Status Banners */}
        {isPending && <div className="alert alert-warning">⏳ Your application is under review. Carl will approve it shortly.</div>}
        {isRejected && <div className="alert alert-danger">❌ Application rejected: {provider.rejection_reason}</div>}
        {isApproved && !isActive && (
          <div className="alert alert-info">
            ✅ Approved! Pay your monthly subscription ({currency} {subAmount}/month) to go live.
            <div style={{ marginTop: 12, display:'flex', gap: 8 }}>
              <input className="form-control" placeholder="Payment reference / proof" value={subRef} onChange={e => setSubRef(e.target.value)} style={{ maxWidth: 280 }} />
              <button className="btn btn-primary" onClick={submitSub}>Submit Payment</button>
            </div>
            {subMsg && <div style={{ marginTop: 8, fontWeight: 600 }}>{subMsg}</div>}
          </div>
        )}
        {isActive && (
          <div className="alert alert-success">🎉 You're live! Subscription active until: <strong>{new Date(provider.subscription_expires_at).toLocaleDateString()}</strong></div>
        )}

        {/* Stats */}
        <div className="grid-4 mb-lg">
          {[
            { label: 'Total Jobs', value: stats.total, icon: '📋', color: 'var(--primary)' },
            { label: 'Pending', value: stats.pending, icon: '⏳', color: 'var(--warning)' },
            { label: 'Completed', value: stats.completed, icon: '✅', color: 'var(--success)' },
            { label: `Earnings (${currency})`, value: stats.earnings.toFixed(0), icon: '💰', color: 'var(--secondary)' },
          ].map(s => (
            <div key={s.label} className="stat-card card">
              <div className="card-body flex-between">
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                </div>
                <div className="stat-icon-big">{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs mb-lg">
          <button className={`tab${tab === 'bookings' ? ' active' : ''}`} onClick={() => setTab('bookings')}>Bookings ({bookings.length})</button>
          <button className={`tab${tab === 'subs' ? ' active' : ''}`} onClick={() => setTab('subs')}>Subscriptions</button>
          <button className={`tab${tab === 'profile' ? ' active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
        </div>

        {tab === 'bookings' && (
          bookings.length === 0 ? (
            <div className="empty-state"><div className="icon">📋</div><h3>No bookings yet</h3><p>Once customers book you, they'll appear here</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Customer</th><th>Date & Time</th><th>Address</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div><strong>{b.customer_name}</strong></div>
                        <div className="text-muted text-sm">{b.customer_phone}</div>
                      </td>
                      <td>{b.date}<br /><span className="text-muted text-sm">{b.time}</span></td>
                      <td style={{ fontSize:'0.82rem', maxWidth:140 }}>{b.address}</td>
                      <td style={{ fontSize:'0.82rem', maxWidth:140 }}>{b.description || '—'}</td>
                      <td><span className={`badge badge-${b.status}`}>{STATUS_LABELS[b.status]}</span></td>
                      <td>
                        <div className="flex-col gap-sm" style={{ gap: 4 }}>
                          {b.status === 'pending' && <>
                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(b.id, 'accepted')}>Accept</button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(b.id, 'cancelled')}>Decline</button>
                          </>}
                          {b.status === 'accepted' && <button className="btn btn-outline btn-sm" onClick={() => updateStatus(b.id, 'in_progress')}>Start Job</button>}
                          {b.status === 'in_progress' && <button className="btn btn-success btn-sm" onClick={() => updateStatus(b.id, 'completed')}>Mark Done</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'subs' && (
          <div>
            <div className="sub-info-card card card-body mb-lg">
              <h3>Monthly Subscription</h3>
              <p className="text-muted">Your listing is maintained through a monthly subscription fee.</p>
              <div className="sub-amount">
                <strong>{currency} {subAmount}</strong><span>/month</span>
              </div>
              {isApproved && (
                <div style={{ marginTop: 16 }}>
                  <label className="form-label">Submit New Payment Reference</label>
                  <div className="flex gap-md">
                    <input className="form-control" placeholder="EFT ref, EcoCash number, etc." value={subRef} onChange={e => setSubRef(e.target.value)} />
                    <button className="btn btn-primary" onClick={submitSub}>Submit</button>
                  </div>
                  {subMsg && <div style={{ marginTop: 8 }}>{subMsg}</div>}
                </div>
              )}
            </div>
            <h3 style={{ marginBottom: 16 }}>Payment History</h3>
            {subscriptions.length === 0 ? (
              <div className="empty-state"><div className="icon">💳</div><h3>No payments yet</h3></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Amount</th><th>Reference</th><th>Status</th><th>Period</th></tr></thead>
                  <tbody>
                    {subscriptions.map(s => (
                      <tr key={s.id}>
                        <td>{new Date(s.created_at).toLocaleDateString()}</td>
                        <td><strong>{s.currency} {s.amount}</strong></td>
                        <td>{s.payment_reference || '—'}</td>
                        <td><span className={`badge badge-${s.status === 'confirmed' ? 'approved' : s.status === 'pending' ? 'pending' : 'rejected'}`}>{s.status}</span></td>
                        <td style={{ fontSize:'0.82rem' }}>
                          {s.period_start ? `${new Date(s.period_start).toLocaleDateString()} – ${new Date(s.period_end).toLocaleDateString()}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <ProviderProfileEdit provider={provider} />
        )}
      </div>

      <style>{`
        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-top: 16px; }
        .stat-card { transition: box-shadow 0.2s; }
        .stat-label { font-size: 0.78rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
        .stat-value { font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; }
        .stat-icon-big { font-size: 2rem; opacity: 0.5; }
        .tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--border); }
        .tab { background: none; border: none; padding: 10px 20px; font-family: var(--font-body); font-size: 0.9rem; font-weight: 600; color: var(--text-3); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
        .tab.active { color: var(--primary); border-bottom-color: var(--primary); }
        .sub-info-card h3 { margin-bottom: 8px; }
        .sub-amount { margin-top: 16px; font-family: var(--font-heading); }
        .sub-amount strong { font-size: 2rem; color: var(--primary); }
        .sub-amount span { color: var(--text-3); margin-left: 4px; }
      `}</style>
    </div>
  );
};

const ProviderProfileEdit = ({ provider }) => {
  const [form, setForm] = useState({ bio: provider.bio, experience_years: provider.experience_years, hourly_rate: provider.hourly_rate });
  const [msg, setMsg] = useState('');

  const save = async () => {
    try {
      await api.put('/providers/profile/update', form);
      setMsg('✅ Profile updated successfully!');
    } catch { setMsg('❌ Update failed'); }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-danger'}`}>{msg}</div>}
      <div className="form-group">
        <label className="form-label">Professional Bio</label>
        <textarea className="form-control" rows={4} value={form.bio} onChange={e => setForm(f=>({...f,bio:e.target.value}))} />
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Years of Experience</label>
          <input className="form-control" type="number" min={0} value={form.experience_years} onChange={e => setForm(f=>({...f,experience_years:e.target.value}))} />
        </div>
        <div className="form-group">
          <label className="form-label">Hourly Rate</label>
          <input className="form-control" type="number" min={0} value={form.hourly_rate} onChange={e => setForm(f=>({...f,hourly_rate:e.target.value}))} />
        </div>
      </div>
      <button className="btn btn-primary" onClick={save}>Save Changes</button>
    </div>
  );
};

export default ProviderDashboard;
