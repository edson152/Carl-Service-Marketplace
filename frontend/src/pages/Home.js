import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORY_ICONS } from '../components/ProviderCard';

const CATEGORIES = ['Electrician','Plumber','Mechanic','Carpenter','Painter','Cleaner','Gardener','Tiler','Roofer','HVAC Technician','General Handyman'];

const Home = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services?search=${search}`);
  };

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-content fade-in">
            <div className="hero-badge">🇿🇦 South Africa &nbsp;•&nbsp; 🇿🇼 Zimbabwe</div>
            <h1 className="hero-title">
              Trusted Local<br />
              <span>Services Near You</span>
            </h1>
            <p className="hero-subtitle">
              Book verified electricians, plumbers, mechanics &amp; more — on demand, in your city.
            </p>
            <form className="hero-search" onSubmit={handleSearch}>
              <input
                className="hero-input"
                type="text"
                placeholder="What service do you need? (e.g., Electrician, Plumber...)"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-lg">Search</button>
            </form>
            <div className="hero-stats">
              <div className="stat"><strong>500+</strong><span>Providers</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>2 Countries</strong><span>ZA & ZW</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>5,000+</strong><span>Jobs Done</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Browse by Service</h2>
            <p>Choose from a wide range of trusted local services</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/services?category=${cat}`} className="cat-card">
                <div className="cat-icon">{CATEGORY_ICONS[cat] || '🛠️'}</div>
                <div className="cat-name">{cat}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Book a service in 3 simple steps</p>
          </div>
          <div className="steps">
            {[
              { num: '01', icon: '🔍', title: 'Search & Browse', desc: 'Search by service type, city, and country. Compare ratings and prices.' },
              { num: '02', icon: '📅', title: 'Book a Provider', desc: 'Select your preferred provider, choose a date and time, describe the job.' },
              { num: '03', icon: '✅', title: 'Get It Done', desc: 'The provider arrives, completes the job, and you leave a review.' },
            ].map(s => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="section">
        <div className="container">
          <div className="provider-cta">
            <div className="cta-left">
              <h2>Are you a service professional?</h2>
              <p>Join Carl Service Marketplace and grow your business. Get bookings directly from customers in your area.</p>
              <ul className="cta-list">
                <li>✅ Verified badge builds customer trust</li>
                <li>✅ Manage bookings from your dashboard</li>
                <li>✅ Available in Zimbabwe &amp; South Africa</li>
                <li>✅ Monthly subscription: ZAR 200 / USD 20</li>
              </ul>
              <Link to="/register/provider" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>
                Register as Provider →
              </Link>
            </div>
            <div className="cta-right">
              <div className="cta-card">
                <div className="cta-emoji">🛠️</div>
                <div className="cta-card-title">For Providers</div>
                <div className="cta-card-items">
                  <div>Register &amp; Submit Documents</div>
                  <div>Admin Reviews &amp; Approves</div>
                  <div>Pay Monthly Subscription</div>
                  <div>Get Listed &amp; Start Earning</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hero { min-height: 92vh; display: flex; align-items: center; position: relative; overflow: hidden; padding: 100px 0 60px; }
        .hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #FFF8F3 0%, #FFE8D6 40%, #F4C59A 100%); z-index: 0; }
        .hero-bg::after { content: ''; position: absolute; bottom: 0; right: 0; width: 60%; height: 100%; background: url("data:image/svg+xml,%3Csvg width='600' height='600' viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C4521A' stroke-width='1' opacity='0.07'%3E%3Ccircle cx='300' cy='300' r='200'/%3E%3Ccircle cx='300' cy='300' r='250'/%3E%3Ccircle cx='300' cy='300' r='300'/%3E%3C/g%3E%3C/svg%3E") center/contain no-repeat; z-index: 0; }
        .hero .container { position: relative; z-index: 1; }
        .hero-content { max-width: 680px; }
        .hero-badge { display: inline-block; background: white; color: var(--text-2); padding: 6px 18px; border-radius: 30px; font-size: 0.85rem; font-weight: 600; margin-bottom: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
        .hero-title { font-size: clamp(2.4rem, 6vw, 4rem); font-weight: 800; line-height: 1.1; margin-bottom: 20px; }
        .hero-title span { color: var(--primary); }
        .hero-subtitle { font-size: 1.15rem; color: var(--text-2); max-width: 500px; margin-bottom: 36px; line-height: 1.7; }
        .hero-search { display: flex; gap: 8px; max-width: 560px; background: white; border-radius: var(--radius-xl); padding: 6px 6px 6px 20px; box-shadow: var(--shadow-lg); border: 1px solid var(--border); }
        .hero-input { flex: 1; border: none; outline: none; font-family: var(--font-body); font-size: 0.95rem; background: transparent; color: var(--text); }
        .hero-stats { display: flex; align-items: center; gap: 24px; margin-top: 48px; }
        .stat { display: flex; flex-direction: column; }
        .stat strong { font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: var(--text); }
        .stat span { font-size: 0.82rem; color: var(--text-3); }
        .stat-divider { width: 1px; height: 36px; background: var(--border); }

        .section { padding: var(--space-2xl) 0; }
        .section-header { text-align: center; margin-bottom: 48px; }
        .section-header h2 { font-size: 2rem; margin-bottom: 8px; }
        .section-header p { color: var(--text-2); }

        .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
        .cat-card { background: white; border: 2px solid var(--border); border-radius: var(--radius-lg); padding: 20px 12px; text-align: center; transition: all 0.2s ease; text-decoration: none; color: var(--text); }
        .cat-card:hover { border-color: var(--primary); background: rgba(196,82,26,0.04); transform: translateY(-3px); box-shadow: var(--shadow-md); color: var(--primary); }
        .cat-icon { font-size: 1.8rem; margin-bottom: 10px; }
        .cat-name { font-size: 0.82rem; font-weight: 600; }

        .how-section { background: var(--secondary); color: white; }
        .how-section .section-header h2 { color: white; }
        .how-section .section-header p { color: rgba(255,255,255,0.7); }
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .step-card { text-align: center; padding: 32px 24px; background: rgba(255,255,255,0.08); border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.12); }
        .step-num { font-family: var(--font-heading); font-size: 3rem; font-weight: 800; color: var(--accent); line-height: 1; margin-bottom: 12px; opacity: 0.6; }
        .step-icon { font-size: 2rem; margin-bottom: 16px; }
        .step-card h3 { font-size: 1.1rem; color: white; margin-bottom: 10px; }
        .step-card p { font-size: 0.88rem; color: rgba(255,255,255,0.7); line-height: 1.6; }

        .provider-cta { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; background: var(--bg-alt); border-radius: var(--radius-xl); padding: 60px; border: 1px solid var(--border); }
        .cta-left h2 { font-size: 1.8rem; margin-bottom: 16px; }
        .cta-left p { color: var(--text-2); line-height: 1.7; margin-bottom: 20px; }
        .cta-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .cta-list li { font-size: 0.9rem; color: var(--text-2); }
        .cta-right { display: flex; justify-content: center; }
        .cta-card { background: var(--primary); color: white; border-radius: var(--radius-xl); padding: 40px 36px; text-align: center; box-shadow: var(--shadow-xl); }
        .cta-emoji { font-size: 3rem; margin-bottom: 12px; }
        .cta-card-title { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; margin-bottom: 24px; }
        .cta-card-items { display: flex; flex-direction: column; gap: 12px; }
        .cta-card-items div { background: rgba(255,255,255,0.15); border-radius: var(--radius-md); padding: 10px 16px; font-size: 0.88rem; font-weight: 500; }

        @media (max-width: 900px) {
          .steps { grid-template-columns: 1fr; }
          .provider-cta { grid-template-columns: 1fr; padding: 32px; gap: 32px; }
        }
        @media (max-width: 600px) {
          .hero-search { flex-direction: column; border-radius: var(--radius-lg); }
          .hero-stats { flex-wrap: wrap; gap: 16px; }
          .stat-divider { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Home;
