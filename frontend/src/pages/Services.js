import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProviderCard from '../components/ProviderCard';

const CATEGORIES = ['','Electrician','Plumber','Mechanic','Carpenter','Painter','Cleaner','Gardener','Tiler','Roofer','HVAC Technician','General Handyman'];
const ZA_CITIES = ['','Johannesburg','Cape Town','Durban','Pretoria','Port Elizabeth','Bloemfontein','East London','Nelspruit','Polokwane','Kimberley'];
const ZW_CITIES = ['','Harare','Bulawayo','Mutare','Gweru','Kwekwe','Masvingo','Chinhoyi','Marondera'];

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const country  = searchParams.get('country')  || '';
  const city     = searchParams.get('city')     || '';
  const search   = searchParams.get('search')   || '';

  const cities = country === 'ZW' ? ZW_CITIES : ZA_CITIES;

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (country)  params.country  = country;
    if (city)     params.city     = city;
    if (search)   params.search   = search;
    api.get('/providers', { params }).then(r => setProviders(r.data)).catch(() => setProviders([])).finally(() => setLoading(false));
  }, [category, country, city, search]);

  const update = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    if (key === 'country') next.delete('city');
    setSearchParams(next);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="services-header fade-in">
          <h1>Browse Service Providers</h1>
          <p>Find trusted professionals in your area</p>
        </div>

        {/* Filters */}
        <div className="filters-bar card card-body fade-in">
          <div className="filters-grid">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Search</label>
              <input className="form-control" placeholder="Name or keyword..." value={search}
                onChange={e => update('search', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Service</label>
              <select className="form-control" value={category} onChange={e => update('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Services'}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Country</label>
              <select className="form-control" value={country} onChange={e => update('country', e.target.value)}>
                <option value="">All Countries</option>
                <option value="ZA">🇿🇦 South Africa</option>
                <option value="ZW">🇿🇼 Zimbabwe</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">City</label>
              <select className="form-control" value={city} onChange={e => update('city', e.target.value)}>
                {cities.map(c => <option key={c} value={c}>{c || 'All Cities'}</option>)}
              </select>
            </div>
          </div>
          {(category || country || city || search) && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setSearchParams({})}>
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Results */}
        <div className="services-results fade-in">
          {loading ? (
            <div className="spinner" />
          ) : providers.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <h3>No providers found</h3>
              <p>Try adjusting your search filters</p>
            </div>
          ) : (
            <>
              <div className="results-count">{providers.length} provider{providers.length !== 1 ? 's' : ''} found</div>
              <div className="grid-3">
                {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .services-header { text-align: center; padding: 40px 0 32px; }
        .services-header h1 { font-size: 2rem; margin-bottom: 8px; }
        .services-header p { color: var(--text-3); }
        .filters-bar { margin-bottom: 32px; }
        .filters-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .results-count { font-size: 0.88rem; color: var(--text-3); margin-bottom: 20px; }
        .services-results { padding-bottom: 60px; }
        @media (max-width: 900px) { .filters-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .filters-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default Services;
