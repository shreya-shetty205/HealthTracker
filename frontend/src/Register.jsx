import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from './api';

const BG = "https://images.unsplash.com/photo-1547592180-85f173990554?w=1400&q=80&auto=format&fit=crop";

const INSIGHTS = [
  { icon: '🌱', type: 'tip',     text: "Tip: Setting up your allergy profile now prevents dangerous food mistakes later." },
  { icon: '🏆', type: 'success', text: "Users who complete their health profile see 2x better results in the first month!" },
  { icon: '💡', type: 'tip',     text: "Insight: A strong password with symbols & numbers is 100x harder to crack." },
  { icon: '🥗', type: 'success', text: "Over 10,000 users have joined HealthTracker. Start your journey today!" },
];

const getPasswordStrength = (pwd) => {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 6)          score++;
  if (pwd.length >= 10)         score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: 'Weak',   color: '#ef4444', width: '25%'  };
  if (score <= 2) return { label: 'Fair',   color: '#f97316', width: '50%'  };
  if (score <= 3) return { label: 'Good',   color: '#eab308', width: '70%'  };
  return             { label: 'Strong', color: '#16a34a', width: '100%' };
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', allergy: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [insightIdx, setInsightIdx] = useState(0);
  const [insVisible, setInsVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setInsVisible(false);
      setTimeout(() => { setInsightIdx(i => (i + 1) % INSIGHTS.length); setInsVisible(true); }, 350);
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  const ins = INSIGHTS[insightIdx];
  const insStyle = ins.type === 'success'
    ? { bg: 'rgba(240,253,244,0.96)', border: '#86efac', color: '#15803d' }
    : { bg: 'rgba(239,246,255,0.96)', border: '#93c5fd', color: '#1d4ed8' };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) { setError('Name, email, and password are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await registerUser({ name: form.name.trim(), email: form.email.trim(), password: form.password, allergy: form.allergy.trim() });
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const focusStyle = { borderColor: '#16a34a', boxShadow: '0 0 0 3px rgba(22,163,74,0.12)', background: '#fff' };
  const blurStyle  = { borderColor: '#e5e7eb', boxShadow: 'none', background: '#f9fafb' };

  const steps = ['Personal Info', 'Security', 'Health Prefs'];
  const currentStep = form.name && form.email ? (form.password ? 2 : 1) : 0;
  const pwdStrength = getPasswordStrength(form.password);

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(22,163,74,0.4) !important; }
        .submit-btn { transition: all 0.2s ease !important; }
        @media (max-width: 768px) {
          .reg-left-panel { display: none !important; }
          .reg-right-panel { flex: 1 !important; width: 100% !important; padding-top: 32px !important; }
          .reg-form-wrap { padding: 24px 24px 32px !important; }
        }
      `}</style>

      {/* Left panel: bg image */}
      <div style={{ ...S.leftPanel, backgroundImage: `url(${BG})` }} className="reg-left-panel">
        <div style={S.leftOverlay} />
        <div style={S.leftContent}>
          <Link to="/" style={S.leftLogo}>
            <div style={S.leftLogoIcon}>🥗</div>
            <span style={S.leftLogoText}>HealthTracker</span>
          </Link>
          <div style={{ animation: 'float 6s ease-in-out infinite', textAlign: 'center' }}>
            <h2 style={S.illusTitle}>Start your health<br/>journey today</h2>
            <p style={S.illusSub}>Join thousands tracking their nutrition and building healthier habits every day.</p>
          </div>
          <div style={S.statsRow}>
            {[['10k+','Users'],['500k+','Meals logged'],['95%','Satisfaction']].map(([n,l]) => (
              <div key={l} style={S.stat}>
                <div style={S.statNum}>{n}</div>
                <div style={S.statLabel}>{l}</div>
              </div>
            ))}
          </div>
          <div style={S.featureList}>
            {['✅ Free forever — no credit card','🔒 Your data stays private','📱 Works on all devices','🏆 AI-powered health insights'].map(f => (
              <div key={f} style={S.featureItem}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div style={S.rightPanel} className="reg-right-panel">
        <div style={S.rightBlob1}/><div style={S.rightBlob2}/>

        {/* Insight banner */}
        <div style={{ ...S.insightBanner, background: insStyle.bg, borderColor: insStyle.border, color: insStyle.color, opacity: insVisible ? 1 : 0, transition: 'opacity 0.35s ease' }}>
          <span style={{ fontSize: '1.1rem' }}>{ins.icon}</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>{ins.text}</span>
        </div>

        <div style={S.formWrap}>
          {/* Mobile logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, textDecoration: 'none' }}>
            <div style={S.mobileLogoIcon}>🥗</div>
            <div>
              <div style={S.mobileLogoText}>HealthTracker</div>
              <div style={S.mobileLogoSub}>Your nutrition companion</div>
            </div>
          </Link>

          {/* Progress steps */}
          <div style={S.stepRow}>
            {steps.map((s, i) => (
              <div key={s} style={S.stepItem}>
                <div style={{ ...S.stepDot, ...(i <= currentStep ? S.stepDotActive : {}) }}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span style={{ ...S.stepLabel, ...(i <= currentStep ? { color: '#16a34a' } : {}) }}>{s}</span>
                {i < steps.length - 1 && <div style={{ ...S.stepLine, ...(i < currentStep ? S.stepLineActive : {}) }}/>}
              </div>
            ))}
          </div>

          <h1 style={S.title}>Create account</h1>
          <p style={S.subtitle}>Start tracking your meals and health score</p>

          {error   && <div style={{ ...S.alert, ...S.alertError   }}>⚠️ {error}</div>}
          {success && <div style={{ ...S.alert, ...S.alertSuccess }}>✅ {success}</div>}

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.field}>
              <label style={S.label}>Full Name <span style={S.required}>*</span></label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                placeholder="Jane Doe" style={S.input} disabled={loading}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, blurStyle)}/>
            </div>
            <div style={S.field}>
              <label style={S.label}>Email <span style={S.required}>*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="jane@example.com" style={S.input} disabled={loading}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, blurStyle)}/>
            </div>
            <div style={S.field}>
              <label style={S.label}>Password <span style={S.required}>*</span></label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters" style={S.input} disabled={loading}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, blurStyle)}/>
              {pwdStrength && (
                <div>
                  <div style={{ height: 5, borderRadius: 100, background: '#e5e7eb', marginTop: 8 }}>
                    <div style={{ height: '100%', borderRadius: 100, width: pwdStrength.width, background: pwdStrength.color, transition: 'width 0.3s, background 0.3s' }}/>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: pwdStrength.color, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>{pwdStrength.label} password</span>
                </div>
              )}
            </div>
            <div style={S.field}>
              <label style={S.label}>Food Allergy <span style={S.optional}>(optional)</span></label>
              <input name="allergy" type="text" value={form.allergy} onChange={handleChange}
                placeholder="e.g. nuts, dairy, gluten" style={S.input} disabled={loading}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, blurStyle)}/>
              <div style={S.hint}>🚫 Meals containing this allergen will be highlighted with allergy warnings.</div>
            </div>
            <button type="submit" className="submit-btn"
              style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? '⏳ Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p style={S.footer}>
            Already have an account?{' '}
            <Link to="/login" style={S.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },

  leftPanel: { flex: '0 0 42%', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', flexDirection: 'column' },
  leftOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(21,128,61,0.88) 0%, rgba(20,83,45,0.82) 100%)' },
  leftContent: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '36px 32px', gap: 28 },
  leftLogo: { display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'flex-start', textDecoration: 'none' },
  leftLogoIcon: { width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(255,255,255,0.3)' },
  leftLogoText: { color: '#fff', fontWeight: 800, fontSize: '1.2rem' },
  illusTitle: { color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.25 },
  illusSub: { color: 'rgba(255,255,255,0.78)', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 },
  statsRow: { display: 'flex', gap: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 20px' },
  stat: { textAlign: 'center' },
  statNum: { color: '#fff', fontWeight: 800, fontSize: '1.2rem' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', marginTop: 2 },
  featureList: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%' },
  featureItem: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.82rem', fontWeight: 600 },

  rightPanel: { flex: 1, background: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', overflow: 'hidden', paddingTop: 0 },
  rightBlob1: { position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(22,163,74,0.05)', pointerEvents: 'none' },
  rightBlob2: { position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(134,239,172,0.07)', pointerEvents: 'none' },

  insightBanner: { width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', borderBottom: '1.5px solid', flexShrink: 0 },

  formWrap: { width: '100%', maxWidth: 420, padding: '28px 48px 40px', position: 'relative', zIndex: 1 },
  mobileLogoIcon: { width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  mobileLogoText: { fontWeight: 800, fontSize: '1rem', color: '#15803d' },
  mobileLogoSub: { fontSize: '0.7rem', color: '#86efac', fontWeight: 500 },

  stepRow: { display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20, position: 'relative' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, position: 'relative' },
  stepDot: { width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', zIndex: 1, transition: 'all 0.3s' },
  stepDotActive: { background: '#16a34a', border: '2px solid #16a34a', color: '#fff' },
  stepLabel: { fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textAlign: 'center' },
  stepLine: { position: 'absolute', top: 14, left: '50%', right: '-50%', height: 2, background: '#e5e7eb', zIndex: 0 },
  stepLineActive: { background: '#16a34a' },

  title: { fontSize: '1.55rem', fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' },
  subtitle: { fontSize: '0.9rem', color: '#6b7280', margin: '0 0 18px' },
  alert: { padding: '10px 14px', borderRadius: 10, fontSize: '0.875rem', marginBottom: 14 },
  alertError: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
  alertSuccess: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.85rem', fontWeight: 700, color: '#374151' },
  required: { color: '#ef4444' },
  optional: { fontWeight: 400, color: '#9ca3af', fontSize: '0.82rem' },
  input: { padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.95rem', color: '#1f2937', background: '#f9fafb', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', width: '100%' },
  hint: { fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.5 },
  btn: { marginTop: 4, padding: '13px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.98rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px rgba(22,163,74,0.3)', width: '100%' },
  footer: { textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: 18 },
  link: { color: '#16a34a', fontWeight: 700, textDecoration: 'none' },
};
