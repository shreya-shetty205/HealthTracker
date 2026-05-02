import { Link, useNavigate } from 'react-router-dom';

const HERO_BG = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80&auto=format&fit=crop";
const FEATURE_IMGS = [
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80&auto=format&fit=crop",
];
const TESTIMONIAL_BG = "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=80&auto=format&fit=crop";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .hero-cta:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 12px 36px rgba(22,163,74,0.45) !important; }
        .hero-cta { transition: all 0.22s ease; }
        .nav-link:hover { color: #16a34a !important; }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 56px rgba(0,0,0,0.15) !important; }
        .feature-card { transition: all 0.28s cubic-bezier(0.4,0,0.2,1); }
        .stat-card:hover { transform: scale(1.05); }
        .stat-card { transition: all 0.2s ease; }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo}>
            <div style={S.logoIcon}>🥗</div>
            <span style={S.logoText}>HealthTracker</span>
          </div>
          <div style={S.navLinks}>
            <a href="#features" className="nav-link" style={S.navLink}>Features</a>
            <a href="#how" className="nav-link" style={S.navLink}>How it works</a>
            <a href="#testimonials" className="nav-link" style={S.navLink}>Reviews</a>
          </div>
          <div style={S.navCtas}>
            <Link to="/login" style={S.navLogin}>Sign in</Link>
            <Link to="/register" style={S.navRegister} className="hero-cta">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ ...S.hero, backgroundImage: `url(${HERO_BG})` }}>
        <div style={S.heroOverlay} />
        <div style={S.heroContent}>
          <div style={S.heroBadge}>🌿 Smart Nutrition Tracking</div>
          <h1 style={S.heroTitle}>
            Eat Smarter,<br/>
            <span style={S.heroAccent}>Live Better</span>
          </h1>
          <p style={S.heroSub}>
            Log meals, track protein, detect allergy risks, and get personalized AI insights — all in one beautiful app.
          </p>
          <div style={S.heroBtns}>
            <Link to="/register" className="hero-cta" style={S.heroCta}>
              🚀 Start Free Today
            </Link>
            <Link to="/login" style={S.heroSecondary}>
              Sign in →
            </Link>
          </div>
          <div style={S.heroStats}>
            {[['10k+','Active Users'],['500k+','Meals Logged'],['4.9★','App Rating']].map(([n,l]) => (
              <div key={l} className="stat-card" style={S.heroStat}>
                <div style={S.heroStatNum}>{n}</div>
                <div style={S.heroStatLabel}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" style={S.section}>
        <div style={S.sectionInner}>
          <p style={S.sectionTag}>Simple & Powerful</p>
          <h2 style={S.sectionTitle}>How HealthTracker Works</h2>
          <div style={S.stepsGrid}>
            {[
              { n:'01', icon:'📝', title:'Log Your Meals', desc:'Quickly add what you eat. Our smart system auto-detects protein content and meal categories.' },
              { n:'02', icon:'📊', title:'Get Health Score', desc:'Receive an instant health score based on your meal balance, protein intake, and dietary diversity.' },
              { n:'03', icon:'💡', title:'Smart Insights', desc:'Personalized insights highlight risks like allergy exposure, low protein days, and streak milestones.' },
              { n:'04', icon:'🏆', title:'Build Habits', desc:'Track progress over time, celebrate streaks, and build lasting healthy eating habits.' },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} style={S.stepCard}>
                <div style={S.stepNum}>{n}</div>
                <div style={S.stepIconCircle}>{icon}</div>
                <h3 style={S.stepTitle}>{title}</h3>
                <p style={S.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ ...S.section, background: '#f8fafc' }}>
        <div style={S.sectionInner}>
          <p style={S.sectionTag}>Everything You Need</p>
          <h2 style={S.sectionTitle}>Features Built for Real Results</h2>
          <div style={S.featuresGrid}>
            {[
              { img: FEATURE_IMGS[0], icon: '🥗', title: 'Smart Meal Logging', desc: 'Log any food in seconds. Automatic protein detection and meal categorization (healthy, junk, other).' },
              { img: FEATURE_IMGS[1], icon: '⚠️', title: 'Allergy Alerts', desc: 'Set your food allergies once. Get instant warnings whenever a logged meal contains your allergens.' },
              { img: FEATURE_IMGS[2], icon: '💡', title: 'Daily Insights', desc: 'AI-powered insights on every page — from allergy warnings to protein tips to streak celebrations.' },
            ].map(({ img, icon, title, desc }) => (
              <div key={title} className="feature-card" style={S.featureCard}>
                <div style={{ ...S.featureImg, backgroundImage: `url(${img})` }}>
                  <div style={S.featureImgOverlay} />
                  <div style={S.featureBadge}>{icon}</div>
                </div>
                <div style={S.featureBody}>
                  <h3 style={S.featureTitle}>{title}</h3>
                  <p style={S.featureDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={{ ...S.section, backgroundImage: `url(${TESTIMONIAL_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={S.testimonialOverlay} />
        <div style={{ ...S.sectionInner, position: 'relative', zIndex: 1 }}>
          <p style={{ ...S.sectionTag, color: '#86efac' }}>Real People, Real Results</p>
          <h2 style={{ ...S.sectionTitle, color: '#fff' }}>What Travelers Trackers Say</h2>
          <div style={S.testimonialsGrid}>
            {[
              { name: 'Priya S.', role: 'Fitness Coach', text: 'The allergy alerts saved me twice! I had no idea some sauces contained nuts. HealthTracker is a must-have.', stars: 5 },
              { name: 'Rahul M.', role: 'Software Engineer', text: 'I went from 40g to 120g protein/day using the daily insights. Lost 8kg in 3 months. Incredible app.', stars: 5 },
              { name: 'Sneha K.', role: 'Nutritionist', text: 'I recommend this to all my clients. The health score and insights are surprisingly accurate and motivating.', stars: 5 },
            ].map(({ name, role, text, stars }) => (
              <div key={name} style={S.testimonialCard}>
                <div style={S.stars}>{'⭐'.repeat(stars)}</div>
                <p style={S.testimonialText}>"{text}"</p>
                <div style={S.testimonialUser}>
                  <div style={S.testimonialAvatar}>{name[0]}</div>
                  <div>
                    <div style={S.testimonialName}>{name}</div>
                    <div style={S.testimonialRole}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={S.ctaSection}>
        <div style={S.ctaInner}>
          <h2 style={S.ctaTitle}>Ready to Transform Your Health?</h2>
          <p style={S.ctaSub}>Join 10,000+ users tracking smarter. Free forever, no credit card needed.</p>
          <div style={S.ctaBtns}>
            <Link to="/register" className="hero-cta" style={S.heroCta}>
              🚀 Create Free Account
            </Link>
            <Link to="/login" style={{ ...S.heroSecondary, color: '#16a34a', borderColor: '#16a34a' }}>
              Already have an account? →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div style={S.footerBrand}>
            <div style={S.logo}><div style={S.logoIcon}>🥗</div><span style={{ ...S.logoText, color: '#fff' }}>HealthTracker</span></div>
            <p style={S.footerTagline}>Your nutrition companion — track meals, build habits, live better.</p>
          </div>
          <div style={S.footerLinks}>
            <Link to="/login" style={S.footerLink}>Sign In</Link>
            <Link to="/register" style={S.footerLink}>Register</Link>
          </div>
        </div>
        <div style={S.footerBottom}>© 2026 HealthTracker. Built with 💚 for healthier lives.</div>
      </footer>
    </div>
  );
}

const S = {
  page: { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#fff', overflowX: 'hidden' },

  // Nav
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(229,231,235,0.6)', padding: '0 24px' },
  navInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  logoText: { fontWeight: 800, fontSize: '1.1rem', color: '#15803d', letterSpacing: '-0.01em' },
  navLinks: { display: 'flex', gap: 28 },
  navLink: { fontSize: '0.9rem', fontWeight: 600, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' },
  navCtas: { display: 'flex', gap: 12, alignItems: 'center' },
  navLogin: { fontSize: '0.9rem', fontWeight: 700, color: '#374151', textDecoration: 'none', padding: '8px 16px', borderRadius: 10, transition: 'all 0.15s' },
  navRegister: { fontSize: '0.9rem', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #16a34a, #22c55e)', padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' },

  // Insight Banner
  insightBanner: { position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 24px', borderBottom: '1px solid', fontSize: '0.875rem', fontWeight: 600 },
  insightIcon: { fontSize: '1.1rem' },
  insightText: { flex: 1, textAlign: 'center', maxWidth: 600 },
  insightLabel: { fontSize: '0.75rem', fontWeight: 700, opacity: 0.7, whiteSpace: 'nowrap' },

  // Hero
  hero: { minHeight: '100vh', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', paddingTop: 80, paddingBottom: 60 },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,30,10,0.55) 60%, rgba(0,0,0,0.2) 100%)' },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: 640, padding: '0 48px', animation: 'fadeSlide 0.8s ease' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(22,163,74,0.3)', border: '1px solid rgba(134,239,172,0.4)', color: '#86efac', padding: '6px 16px', borderRadius: 100, fontSize: '0.82rem', fontWeight: 700, marginBottom: 24 },
  heroTitle: { fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' },
  heroAccent: { background: 'linear-gradient(90deg, #4ade80, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: '1.05rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, marginBottom: 36 },
  heroBtns: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 44 },
  heroCta: { display: 'inline-block', padding: '14px 32px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', fontWeight: 800, fontSize: '1rem', borderRadius: 14, textDecoration: 'none', boxShadow: '0 6px 24px rgba(22,163,74,0.4)' },
  heroSecondary: { display: 'inline-flex', alignItems: 'center', padding: '14px 28px', border: '2px solid rgba(255,255,255,0.5)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', borderRadius: 14, textDecoration: 'none', backdropFilter: 'blur(4px)' },
  heroStats: { display: 'flex', gap: 24 },
  heroStat: { textAlign: 'left' },
  heroStatNum: { fontSize: '1.6rem', fontWeight: 900, color: '#4ade80' },
  heroStatLabel: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600, marginTop: 2 },

  // Floating cards
  floatCard: { position: 'absolute', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '10px 18px', borderRadius: 14, fontSize: '0.82rem', fontWeight: 700, color: '#111827', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 2, whiteSpace: 'nowrap' },
  floatCard1: { bottom: '30%', right: '8%' },
  floatCard2: { bottom: '20%', right: '14%' },
  floatCard3: { top: '35%', right: '6%' },

  // Sections
  section: { padding: '80px 24px' },
  sectionInner: { maxWidth: 1200, margin: '0 auto' },
  sectionTag: { textAlign: 'center', fontSize: '0.82rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 },
  sectionTitle: { textAlign: 'center', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: '#111827', marginBottom: 52, letterSpacing: '-0.02em' },

  // Steps
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 },
  stepCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 24px', background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' },
  stepNum: { fontSize: '0.75rem', fontWeight: 800, color: '#22c55e', letterSpacing: '0.1em', marginBottom: 14 },
  stepIconCircle: { width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 },
  stepTitle: { fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: 8 },
  stepDesc: { fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65 },

  // Features
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 },
  featureCard: { background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  featureImg: { height: 200, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  featureImgOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' },
  featureBadge: { position: 'absolute', bottom: 14, left: 16, fontSize: 28 },
  featureBody: { padding: '20px 24px 28px' },
  featureTitle: { fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginBottom: 8 },
  featureDesc: { fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65 },

  // Testimonials
  testimonialOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' },
  testimonialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 },
  testimonialCard: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: 28 },
  stars: { fontSize: '0.9rem', marginBottom: 12 },
  testimonialText: { fontSize: '0.92rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, marginBottom: 18, fontStyle: 'italic' },
  testimonialUser: { display: 'flex', alignItems: 'center', gap: 12 },
  testimonialAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem' },
  testimonialName: { color: '#fff', fontWeight: 700, fontSize: '0.9rem' },
  testimonialRole: { color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' },

  // CTA
  ctaSection: { padding: '80px 24px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' },
  ctaInner: { maxWidth: 640, margin: '0 auto', textAlign: 'center' },
  ctaTitle: { fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: '#111827', marginBottom: 14, letterSpacing: '-0.02em' },
  ctaSub: { fontSize: '1rem', color: '#6b7280', marginBottom: 36 },
  ctaBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },

  // Footer
  footer: { background: '#111827', padding: '48px 24px 0' },
  footerInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap', paddingBottom: 40 },
  footerBrand: { maxWidth: 300 },
  footerTagline: { color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.65, marginTop: 12 },
  footerLinks: { display: 'flex', gap: 24 },
  footerLink: { color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 },
  footerBottom: { borderTop: '1px solid #1f2937', padding: '16px 0', textAlign: 'center', color: '#6b7280', fontSize: '0.8rem', maxWidth: 1200, margin: '0 auto' },
};
