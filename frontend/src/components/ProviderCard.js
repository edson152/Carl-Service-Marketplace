import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  Electrician: '⚡', Plumber: '🔧', Mechanic: '🔩', Carpenter: '🪚',
  Painter: '🎨', Cleaner: '🧹', Gardener: '🌿', Tiler: '🏠',
  Roofer: '🏗️', 'HVAC Technician': '❄️', 'General Handyman': '🛠️',
};

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="stars" title={`${rating}/5`}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`star${i < full ? ' filled' : i === full && half ? ' half' : ''}`}>★</span>
      ))}
    </div>
  );
};

const ProviderCard = ({ provider }) => {
  const icon = CATEGORY_ICONS[provider.category] || '🛠️';
  const currency = provider.country === 'ZW' ? 'USD' : 'ZAR';

  return (
    <div className="provider-card card fade-in">
      <div className="pcard-header">
        <div className="pcard-avatar">{provider.name?.charAt(0)}</div>
        <div className="pcard-badge">{icon} {provider.category}</div>
      </div>
      <div className="card-body">
        <div className="pcard-name">{provider.name}</div>
        <div className="pcard-location">📍 {provider.city}, {provider.country === 'ZA' ? 'South Africa' : 'Zimbabwe'}</div>
        <p className="pcard-bio">{provider.bio?.substring(0, 90)}{provider.bio?.length > 90 ? '...' : ''}</p>
        <div className="pcard-meta">
          <div className="pcard-rating">
            <Stars rating={provider.rating || 0} />
            <span className="text-muted">{provider.rating ? provider.rating.toFixed(1) : '—'} ({provider.total_reviews || 0})</span>
          </div>
          <div className="pcard-rate">
            <strong>{currency} {provider.hourly_rate}</strong>
            <span className="text-muted">/hr</span>
          </div>
        </div>
        <div className="pcard-exp">{provider.experience_years} yrs experience</div>
        <Link to={`/providers/${provider.id}`} className="btn btn-primary btn-full btn-sm" style={{ marginTop: 12 }}>
          View & Book
        </Link>
      </div>
      <style>{`
        .provider-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .provider-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .pcard-header { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); padding: 20px; display: flex; align-items: center; justify-content: space-between; }
        .pcard-avatar { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.2); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800; font-family: var(--font-heading); border: 2px solid rgba(255,255,255,0.4); }
        .pcard-badge { background: rgba(255,255,255,0.15); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
        .pcard-name { font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; margin-bottom: 4px; }
        .pcard-location { font-size: 0.82rem; color: var(--text-3); margin-bottom: 10px; }
        .pcard-bio { font-size: 0.88rem; color: var(--text-2); line-height: 1.5; margin-bottom: 12px; min-height: 52px; }
        .pcard-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .pcard-rating { display: flex; align-items: center; gap: 6px; }
        .pcard-rate { font-size: 0.9rem; }
        .pcard-exp { font-size: 0.78rem; color: var(--text-3); }
        .star.half { color: var(--gold); opacity: 0.5; }
      `}</style>
    </div>
  );
};

export { Stars, CATEGORY_ICONS };
export default ProviderCard;
