import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Stars } from '../components/ProviderCard';

const ProviderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ date:'', time:'', address:'', description:'' });
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');
  const [booking_loading, setBookingLoading] = useState(false);

  useEffect(() => {
    api.get(`/providers/${id}`).then(r => setProvider(r.data)).catch(() => navigate('/services')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: `/providers/${id}` } });
    if (user.role !== 'customer') return setBookError('Only customers can make bookings');
    setBookError(''); setBookingLoading(true);
    try {
      await api.post('/bookings', { provider_id: id, service_category: provider.category, ...booking, total_price: provider.hourly_rate });
      setBookSuccess('🎉 Booking submitted! The provider will confirm shortly.');
      setBooking({ date:'', time:'', address:'', description:'' });
    } catch (err) {
      setBookError(err.response?.data?.error || 'Booking failed');
    } finally { setBookingLoading(false); }
  };

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!provider) return null;

  const currency = provider.country === 'ZW' ? 'USD' : 'ZAR';

  return (
    <div className="page">
      <div className="container">
        <Link to="/services" className="back-link">← Back to Services</Link>

        <div className="pdetail-grid">
          {/* Left — Provider Info */}
          <div>
            <div className="card pdetail-card fade-in">
              <div className="pdetail-hero">
                <div className="pdetail-avatar">{provider.name?.charAt(0)}</div>
                <div>
                  <h1 className="pdetail-name">{provider.name}</h1>
                  <div className="pdetail-cat">🛠️ {provider.category}</div>
                  <div className="pdetail-loc">📍 {provider.city}, {provider.country === 'ZA' ? 'South Africa' : 'Zimbabwe'}</div>
                </div>
              </div>
              <div className="card-body">
                <div className="pdetail-stats">
                  <div className="pstat"><strong>{currency} {provider.hourly_rate}</strong><span>Per Hour</span></div>
                  <div className="pstat"><strong>{provider.experience_years}</strong><span>Years Exp.</span></div>
                  <div className="pstat"><div style={{ display:'flex', alignItems:'center', gap:4 }}><Stars rating={provider.rating || 0} /><strong>{provider.rating?.toFixed(1) || '—'}</strong></div><span>{provider.total_reviews} reviews</span></div>
                </div>
                <div className="divider" />
                <h3 style={{ marginBottom: 12 }}>About</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>{provider.bio}</p>

                {provider.reviews?.length > 0 && (
                  <>
                    <div className="divider" />
                    <h3 style={{ marginBottom: 16 }}>Reviews</h3>
                    <div className="reviews-list">
                      {provider.reviews.map(r => (
                        <div key={r.id} className="review-item">
                          <div className="review-header">
                            <strong>{r.customer_name}</strong>
                            <div style={{ display:'flex', alignItems:'center', gap:4 }}><Stars rating={r.rating} /><span className="text-muted">{r.rating}/5</span></div>
                          </div>
                          {r.comment && <p style={{ fontSize:'0.88rem', color:'var(--text-2)', marginTop:6 }}>{r.comment}</p>}
                          <span className="text-muted text-sm">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right — Booking Form */}
          <div>
            <div className="card booking-form-card fade-in">
              <div className="booking-form-header">
                <h2>Book {provider.name}</h2>
                <p className="text-muted">Fill in your details to make a booking</p>
              </div>
              <div className="card-body">
                {bookSuccess ? (
                  <div>
                    <div className="alert alert-success">{bookSuccess}</div>
                    <Link to="/dashboard" className="btn btn-primary btn-full">View My Bookings</Link>
                  </div>
                ) : (
                  <form onSubmit={handleBook}>
                    {bookError && <div className="alert alert-danger">{bookError}</div>}
                    {!user && <div className="alert alert-info">Please <Link to="/login"><strong>login</strong></Link> or <Link to="/register"><strong>register</strong></Link> to book.</div>}
                    <div className="form-group">
                      <label className="form-label">Preferred Date *</label>
                      <input className="form-control" type="date" required min={minDateStr} value={booking.date} onChange={e => setBooking({...booking, date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Preferred Time *</label>
                      <select className="form-control" required value={booking.time} onChange={e => setBooking({...booking, time: e.target.value})}>
                        <option value="">Select time</option>
                        {['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Service Address *</label>
                      <input className="form-control" required placeholder="Street, Suburb, City" value={booking.address} onChange={e => setBooking({...booking, address: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Job Description</label>
                      <textarea className="form-control" rows={3} placeholder="Describe the work needed..." value={booking.description} onChange={e => setBooking({...booking, description: e.target.value})} />
                    </div>
                    <div className="booking-price-summary">
                      <span>Estimated Rate</span>
                      <strong>{currency} {provider.hourly_rate}/hr</strong>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={booking_loading || !user}>
                      {booking_loading ? 'Submitting...' : '📅 Request Booking'}
                    </button>
                    <p className="text-muted text-sm text-center" style={{ marginTop: 10 }}>
                      Provider will confirm or suggest alternative time
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .back-link { display: inline-block; color: var(--text-3); font-size: 0.9rem; margin-bottom: 24px; transition: color 0.2s; }
        .back-link:hover { color: var(--primary); }
        .pdetail-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 32px; align-items: start; padding-bottom: 60px; }
        .pdetail-card { overflow: visible; }
        .pdetail-hero { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); padding: 32px; display: flex; align-items: center; gap: 20px; }
        .pdetail-avatar { width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,0.2); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; font-family: var(--font-heading); border: 3px solid rgba(255,255,255,0.4); flex-shrink: 0; }
        .pdetail-name { font-size: 1.4rem; color: white; margin-bottom: 6px; }
        .pdetail-cat, .pdetail-loc { font-size: 0.88rem; color: rgba(255,255,255,0.8); margin-bottom: 4px; }
        .pdetail-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .pstat { text-align: center; padding: 12px; background: var(--bg-alt); border-radius: var(--radius-md); }
        .pstat strong { display: block; font-size: 1.1rem; font-weight: 700; margin-bottom: 4px; }
        .pstat span { font-size: 0.75rem; color: var(--text-3); }
        .reviews-list { display: flex; flex-direction: column; gap: 12px; }
        .review-item { padding: 14px; background: var(--bg-alt); border-radius: var(--radius-md); }
        .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .booking-form-card { position: sticky; top: 90px; }
        .booking-form-header { background: var(--bg-alt); padding: 24px; border-bottom: 1px solid var(--border); }
        .booking-form-header h2 { font-size: 1.2rem; margin-bottom: 4px; }
        .booking-price-summary { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--bg-alt); border-radius: var(--radius-md); margin-bottom: 16px; font-size: 0.9rem; }
        @media (max-width: 900px) { .pdetail-grid { grid-template-columns: 1fr; } .booking-form-card { position: static; } }
      `}</style>
    </div>
  );
};

export default ProviderDetail;
