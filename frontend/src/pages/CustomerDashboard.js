import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = { pending:'Pending', accepted:'Accepted', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' };

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('bookings');
  const [reviewModal, setReviewModal] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/bookings/my'),
      api.get('/bookings/notifications/me')
    ]).then(([b, n]) => {
      setBookings(b.data);
      setNotifications(n.data);
    }).finally(() => setLoading(false));
  }, []);

  const markRead = () => {
    api.put('/bookings/notifications/read').then(() =>
      setNotifications(n => n.map(x => ({ ...x, is_read: 1 })))
    );
  };

  const submitReview = async () => {
    try {
      await api.post(`/bookings/${reviewModal.id}/review`, review);
      setReviewMsg('Review submitted! Thank you.');
      setBookings(bs => bs.map(b => b.id === reviewModal.id ? { ...b, reviewed: true } : b));
      setTimeout(() => { setReviewModal(null); setReviewMsg(''); }, 1500);
    } catch (err) {
      setReviewMsg(err.response?.data?.error || 'Failed');
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await api.put(`/bookings/${id}/status`, { status: 'cancelled' });
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container fade-in">
        <div className="dash-header">
          <div>
            <h1>My Dashboard</h1>
            <p className="text-muted">Welcome back, <strong>{user.name}</strong> · {user.city}, {user.country === 'ZA' ? 'South Africa' : 'Zimbabwe'}</p>
          </div>
          <Link to="/services" className="btn btn-primary">+ Book a Service</Link>
        </div>

        {/* Stats */}
        <div className="grid-3 mb-lg">
          {[
            { label: 'Total Bookings', value: stats.total, icon: '📋', color: '#C4521A' },
            { label: 'Pending',        value: stats.pending, icon: '⏳', color: '#E9821D' },
            { label: 'Completed',      value: stats.completed, icon: '✅', color: '#2D6A4F' },
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
          <button className={`tab${tab === 'bookings' ? ' active' : ''}`} onClick={() => setTab('bookings')}>My Bookings ({bookings.length})</button>
          <button className={`tab${tab === 'notifications' ? ' active' : ''}`} onClick={() => { setTab('notifications'); markRead(); }}>
            Notifications {notifications.filter(n => !n.is_read).length > 0 && <span className="tab-badge">{notifications.filter(n => !n.is_read).length}</span>}
          </button>
        </div>

        {tab === 'bookings' && (
          bookings.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <h3>No bookings yet</h3>
              <p>Browse services and book your first appointment</p>
              <Link to="/services" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Services</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Service</th><th>Provider</th><th>Date & Time</th><th>Address</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.category || b.service_category}</strong></td>
                      <td>
                        <div>{b.provider_name}</div>
                        <div className="text-muted text-sm">{b.provider_phone}</div>
                      </td>
                      <td>{b.date} at {b.time}</td>
                      <td style={{ maxWidth: 160, fontSize: '0.82rem' }}>{b.address}</td>
                      <td><span className={`badge badge-${b.status}`}>{STATUS_LABELS[b.status] || b.status}</span></td>
                      <td>
                        <div className="flex gap-sm">
                          {b.status === 'completed' && !b.reviewed && (
                            <button className="btn btn-outline btn-sm" onClick={() => setReviewModal(b)}>⭐ Review</button>
                          )}
                          {['pending'].includes(b.status) && (
                            <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(b.id)}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'notifications' && (
          notifications.length === 0 ? (
            <div className="empty-state"><div className="icon">🔔</div><h3>No notifications</h3></div>
          ) : (
            <div className="notif-list">
              {notifications.map(n => (
                <div key={n.id} className={`notif-item${n.is_read ? '' : ' unread'}`}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="text-muted text-sm">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Review {reviewModal.provider_name}</h3>
            <p className="text-muted mb-md">{reviewModal.category} on {reviewModal.date}</p>
            {reviewMsg && <div className={`alert ${reviewMsg.includes('Thank') ? 'alert-success' : 'alert-danger'}`}>{reviewMsg}</div>}
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="star-picker">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" className={`star-btn${review.rating >= n ? ' active' : ''}`} onClick={() => setReview(r => ({...r, rating: n}))}>★</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea className="form-control" rows={3} value={review.comment} onChange={e => setReview(r => ({...r, comment: e.target.value}))} placeholder="How was the service?" />
            </div>
            <div className="flex gap-md">
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={submitReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-top: 16px; }
        .stat-card { transition: box-shadow 0.2s; }
        .stat-label { font-size: 0.8rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
        .stat-value { font-family: var(--font-heading); font-size: 2rem; font-weight: 800; }
        .stat-icon-big { font-size: 2.2rem; opacity: 0.6; }
        .tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--border); }
        .tab { background: none; border: none; padding: 10px 20px; font-family: var(--font-body); font-size: 0.9rem; font-weight: 600; color: var(--text-3); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .tab.active { color: var(--primary); border-bottom-color: var(--primary); }
        .tab-badge { background: var(--primary); color: white; border-radius: 20px; font-size: 0.65rem; padding: 1px 6px; }
        .notif-list { display: flex; flex-direction: column; gap: 12px; }
        .notif-item { padding: 16px; background: white; border-radius: var(--radius-md); border: 1px solid var(--border); }
        .notif-item.unread { border-left: 4px solid var(--primary); background: rgba(196,82,26,0.03); }
        .notif-title { font-weight: 700; margin-bottom: 4px; }
        .notif-msg { font-size: 0.9rem; color: var(--text-2); margin-bottom: 6px; line-height: 1.5; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 16px; }
        .modal { background: white; border-radius: var(--radius-xl); padding: 32px; max-width: 440px; width: 100%; box-shadow: var(--shadow-xl); }
        .modal h3 { margin-bottom: 4px; }
        .star-picker { display: flex; gap: 8px; margin: 8px 0; }
        .star-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: #ddd; transition: color 0.15s; line-height: 1; }
        .star-btn.active { color: var(--gold); }
      `}</style>
    </div>
  );
};

export default CustomerDashboard;
