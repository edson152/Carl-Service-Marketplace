import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AdminPanel = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [subs, setSubs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [provFilter, setProvFilter] = useState('');
  const [msg, setMsg] = useState('');

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const loadOverview = useCallback(async () => {
    setLoading(true);
    const [s, n] = await Promise.all([api.get('/admin/stats'), api.get('/admin/notifications')]);
    setStats(s.data);
    setNotifications(n.data);
    setLoading(false);
  }, []);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/admin/providers' + (provFilter ? `?status=${provFilter}` : ''));
    setProviders(data);
    setLoading(false);
  }, [provFilter]);

  const loadSubs = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/admin/subscriptions');
    setSubs(data);
    setLoading(false);
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/admin/bookings');
    setBookings(data);
    setLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/admin/users');
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'overview')   loadOverview();
    if (tab === 'providers')  loadProviders();
    if (tab === 'subs')       loadSubs();
    if (tab === 'bookings')   loadBookings();
    if (tab === 'users')      loadUsers();
  }, [tab, loadOverview, loadProviders, loadSubs, loadBookings, loadUsers]);

  useEffect(() => {
    if (tab === 'providers') loadProviders();
  }, [provFilter, loadProviders, tab]);

  const approve = async (id) => {
    await api.put(`/admin/providers/${id}/approve`);
    flash('✅ Provider approved!');
    loadProviders();
  };

  const reject = async () => {
    await api.put(`/admin/providers/${rejectModal}/reject`, { reason: rejectReason });
    flash('Provider rejected.');
    setRejectModal(null); setRejectReason('');
    loadProviders();
  };

  const suspend = async (id) => {
    if (!window.confirm('Suspend this provider?')) return;
    await api.put(`/admin/providers/${id}/suspend`);
    flash('Provider suspended.');
    loadProviders();
  };

  const deleteProvider = async (id) => {
    if (!window.confirm('Permanently delete this provider and their account?')) return;
    await api.delete(`/admin/providers/${id}`);
    flash('Provider deleted.');
    loadProviders();
  };

  const confirmSub = async (id) => {
    await api.put(`/admin/subscriptions/${id}/confirm`);
    flash('✅ Subscription confirmed and provider activated!');
    loadSubs();
  };

  const markNotifsRead = () => {
    api.put('/admin/notifications/read');
    setNotifications(n => n.map(x => ({ ...x, is_read: 1 })));
  };

  const TABS = [
    { id: 'overview',   label: '📊 Overview' },
    { id: 'providers',  label: `👷 Providers ${stats?.providers_pending ? `(${stats.providers_pending} pending)` : ''}` },
    { id: 'subs',       label: `💳 Subscriptions ${stats?.subs_pending ? `(${stats.subs_pending} pending)` : ''}` },
    { id: 'bookings',   label: '📋 Bookings' },
    { id: 'users',      label: '👥 Customers' },
    { id: 'notifs',     label: `🔔 Notifications ${notifications.filter(n => !n.is_read).length ? `(${notifications.filter(n=>!n.is_read).length})` : ''}` },
  ];

  return (
    <div className="page">
      <div className="container fade-in">
        <div className="admin-header">
          <div>
            <h1>⚡ Admin Control Panel</h1>
            <p className="text-muted">Carl Service Marketplace — Full Control</p>
          </div>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        {/* Admin Nav */}
        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`admin-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {loading && <div className="spinner" />}

        {/* OVERVIEW */}
        {!loading && tab === 'overview' && stats && (
          <div>
            <div className="grid-4 mb-lg">
              {[
                { label: 'Total Customers', value: stats.stats.users, icon: '👥', color: 'var(--info)' },
                { label: 'Total Providers', value: stats.stats.providers_total, icon: '👷', color: 'var(--primary)' },
                { label: 'Active Providers', value: stats.stats.providers_active, icon: '✅', color: 'var(--success)' },
                { label: 'Pending Approvals', value: stats.stats.providers_pending, icon: '⏳', color: 'var(--warning)' },
                { label: 'Total Bookings', value: stats.stats.bookings_total, icon: '📋', color: 'var(--secondary)' },
                { label: 'Completed Jobs', value: stats.stats.bookings_completed, icon: '✔️', color: 'var(--success)' },
                { label: 'ZA Revenue (ZAR)', value: stats.stats.revenue_za.toFixed(0), icon: '🇿🇦', color: 'var(--primary)' },
                { label: 'ZW Revenue (USD)', value: stats.stats.revenue_zw.toFixed(0), icon: '🇿🇼', color: 'var(--secondary)' },
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

            <div className="grid-2">
              <div className="card card-body">
                <h3 className="mb-md">Providers by Category</h3>
                {stats.byCategory.map(c => (
                  <div key={c.category} className="cat-row">
                    <span>{c.category}</span>
                    <div className="cat-bar-wrap">
                      <div className="cat-bar" style={{ width: `${Math.min(100, (c.count / Math.max(...stats.byCategory.map(x=>x.count))) * 100)}%` }} />
                    </div>
                    <span className="cat-count">{c.count}</span>
                  </div>
                ))}
              </div>
              <div className="card card-body">
                <h3 className="mb-md">Recent Bookings</h3>
                {stats.recentBookings.slice(0,6).map(b => (
                  <div key={b.id} className="recent-row">
                    <div>
                      <div className="text-sm"><strong>{b.customer_name}</strong> → {b.provider_name}</div>
                      <div className="text-muted text-sm">{b.service_category} · {b.date}</div>
                    </div>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROVIDERS */}
        {!loading && tab === 'providers' && (
          <div>
            <div className="flex-between mb-lg">
              <div className="flex gap-sm">
                {['', 'pending','approved','rejected'].map(s => (
                  <button key={s} className={`btn btn-sm ${provFilter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setProvFilter(s)}>
                    {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                  </button>
                ))}
              </div>
              <span className="text-muted text-sm">{providers.length} providers</span>
            </div>
            {providers.length === 0 ? <div className="empty-state"><div className="icon">👷</div><h3>No providers found</h3></div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Category</th><th>Location</th><th>Contact</th><th>App. Status</th><th>Subscription</th><th>Rating</th><th>Registered</th><th>Actions</th></tr></thead>
                  <tbody>
                    {providers.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="badge badge-primary">{p.category}</span></td>
                        <td>{p.city}, {p.country}</td>
                        <td>
                          <div className="text-sm">{p.email}</div>
                          <div className="text-muted text-sm">{p.phone}</div>
                        </td>
                        <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                        <td><span className={`badge badge-${p.subscription_status}`}>{p.subscription_status}</span></td>
                        <td>⭐ {p.rating?.toFixed(1) || '—'} ({p.total_reviews})</td>
                        <td className="text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="flex-col gap-sm" style={{ gap: 4 }}>
                            {p.status === 'pending' && <>
                              <button className="btn btn-success btn-sm" onClick={() => approve(p.id)}>✅ Approve</button>
                              <button className="btn btn-danger btn-sm" onClick={() => setRejectModal(p.id)}>❌ Reject</button>
                            </>}
                            {p.status === 'approved' && p.subscription_status === 'active' && (
                              <button className="btn btn-ghost btn-sm" onClick={() => suspend(p.id)}>⏸ Suspend</button>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={() => deleteProvider(p.id)}>🗑 Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIPTIONS */}
        {!loading && tab === 'subs' && (
          <div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Provider</th><th>Category</th><th>Country</th><th>Amount</th><th>Reference</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
                <tbody>
                  {subs.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div><strong>{s.provider_name}</strong></div>
                        <div className="text-muted text-sm">{s.provider_email}</div>
                      </td>
                      <td>{s.category}</td>
                      <td>{s.country}</td>
                      <td><strong>{s.currency} {s.amount}</strong></td>
                      <td>{s.payment_reference || <span className="text-muted">Not provided</span>}</td>
                      <td><span className={`badge badge-${s.status === 'confirmed' ? 'approved' : s.status}`}>{s.status}</span></td>
                      <td className="text-sm">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td>
                        {s.status === 'pending' && (
                          <button className="btn btn-success btn-sm" onClick={() => confirmSub(s.id)}>✅ Confirm Payment</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {subs.length === 0 && <div className="empty-state"><div className="icon">💳</div><h3>No subscription payments yet</h3></div>}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {!loading && tab === 'bookings' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Customer</th><th>Provider</th><th>Service</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.customer_name}</td>
                    <td>{b.provider_name}</td>
                    <td>{b.category}</td>
                    <td>{b.date} {b.time}</td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    <td>{b.total_price ? `${b.currency} ${b.total_price}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <div className="empty-state"><div className="icon">📋</div><h3>No bookings yet</h3></div>}
          </div>
        )}

        {/* CUSTOMERS */}
        {!loading && tab === 'users' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Country</th><th>City</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.country === 'ZA' ? '🇿🇦' : '🇿🇼'} {u.country}</td>
                    <td>{u.city}</td>
                    <td><span className="badge badge-primary">{u.role}</span></td>
                    <td className="text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="empty-state"><div className="icon">👥</div><h3>No users yet</h3></div>}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {tab === 'notifs' && (
          <div>
            <div className="flex-between mb-lg">
              <h3>System Notifications</h3>
              <button className="btn btn-ghost btn-sm" onClick={markNotifsRead}>Mark all read</button>
            </div>
            <div className="notif-list">
              {notifications.map(n => (
                <div key={n.id} className={`notif-item${n.is_read ? '' : ' unread'}`}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="text-muted text-sm">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))}
              {notifications.length === 0 && <div className="empty-state"><div className="icon">🔔</div><h3>No notifications</h3></div>}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Reject Provider Application</h3>
            <p className="text-muted mb-md">Provide a reason for rejection (sent to the provider)</p>
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <textarea className="form-control" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Incomplete documents, unverifiable qualifications..." />
            </div>
            <div className="flex gap-md">
              <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={reject}>Reject Application</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-header { margin-bottom: 24px; padding-top: 16px; }
        .admin-header h1 { font-size: 1.8rem; margin-bottom: 4px; }
        .admin-tabs { display: flex; flex-wrap: wrap; gap: 4px; border-bottom: 2px solid var(--border); margin-bottom: 32px; }
        .admin-tab { background: none; border: none; padding: 10px 16px; font-family: var(--font-body); font-size: 0.85rem; font-weight: 600; color: var(--text-3); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; white-space: nowrap; }
        .admin-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
        .stat-label { font-size: 0.75rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        .stat-value { font-family: var(--font-heading); font-size: 1.7rem; font-weight: 800; }
        .stat-icon-big { font-size: 1.8rem; opacity: 0.5; }
        .cat-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; font-size: 0.88rem; }
        .cat-row > span:first-child { width: 120px; flex-shrink: 0; color: var(--text-2); }
        .cat-bar-wrap { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
        .cat-bar { height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.5s ease; }
        .cat-count { width: 28px; text-align: right; font-weight: 700; color: var(--text-2); }
        .recent-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .recent-row:last-child { border-bottom: none; }
        .notif-list { display: flex; flex-direction: column; gap: 10px; }
        .notif-item { padding: 14px; background: white; border-radius: var(--radius-md); border: 1px solid var(--border); }
        .notif-item.unread { border-left: 4px solid var(--primary); background: rgba(196,82,26,0.02); }
        .notif-title { font-weight: 700; margin-bottom: 4px; }
        .notif-msg { font-size: 0.88rem; color: var(--text-2); margin-bottom: 6px; line-height: 1.5; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 16px; }
        .modal { background: white; border-radius: var(--radius-xl); padding: 32px; max-width: 480px; width: 100%; box-shadow: var(--shadow-xl); }
        .modal h3 { margin-bottom: 4px; }
        @media(max-width:600px) { .admin-tab { padding: 8px 10px; font-size: 0.78rem; } }
      `}</style>
    </div>
  );
};

export default AdminPanel;
