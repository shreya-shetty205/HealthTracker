import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from './api';
import axios from 'axios';

const BG = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1400&q=80&auto=format&fit=crop";

const INSIGHTS = [
  { icon: '💡', type: 'tip',     text: "Tip: Logging meals consistently can improve your health score by up to 40%." },
  { icon: '🥗', type: 'success', text: "Users who log breakfast daily report 30% better energy throughout the day." },
  { icon: '⚠️', type: 'warning', text: "Did you know? 1 in 10 meals contains hidden allergens. Always track what you eat." },
  { icon: '🏆', type: 'success', text: "Consistency beats perfection. Even logging 1 meal/day builds lasting habits!" },
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showForgot, setShowForgot]   = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg]     = useState(null);
  const [insightIdx, setInsightIdx]   = useState(0);
  const [insVisible, setInsVisible]   = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setInsVisible(false);
      setTimeout(() => { setInsightIdx(i => (i + 1) % INSIGHTS.length); setInsVisible(true); }, 350);
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  const ins = INSIGHTS[insightIdx];

  const handleForgotSubmit = async () => {
    if (!forgotEmail.trim()) { setForgotMsg({ type: 'error', text: 'Please enter your email address.' }); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail.trim())) { setForgotMsg({ type: 'error', text: 'Please enter a valid email.' }); return; }
    setForgotLoading(true); setForgotMsg(null);
    try {
      const res = await axios.post('/api/forgot-password', { email: forgotEmail.trim().toLowerCase() });
      setForgotMsg({ type: 'success', text: res.data?.message || `Reset link sent to ${forgotEmail.trim()}.` });
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send reset link.' });
    } finally { setForgotLoading(false); }
  };

  const closeForgot = () => { setShowForgot(false); setForgotEmail(''); setForgotMsg(null); };
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.email.trim() || !form.password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const res = await loginUser({ email: form.email.trim(), password: form.password });
      const token = res.data?.token; const user = res.data?.user;
      if (!token) { setError('Login failed: no token received.'); return; }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user || {}));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const insStyle = ins.type === 'success'
    ? { bg: 'rgba(240,253,244,0.95)', border: '#86efac', color: '#15803d' }
    : ins.type === 'warning'
    ? { bg: 'rgba(255,251,235,0.95)', border: '#fde047', color: '#92400e' }
    : { bg: 'rgba(239,246,255,0.95)', border: '#93c5fd', color: '#1d4ed8' };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blob { 0%,100%{border-radius:60% 40% 70% 30%/50% 60% 40% 50%} 50%{border-radius:40% 60% 30% 70%/60% 40% 60% 40%} }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(22,163,74,0.4) !important; }
        .submit-btn { transition: all 0.2s ease !important; }
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          .login-right-panel { flex: 1 !important; width: 100% !important; padding-top: 32px !important; }
          .login-form-wrap { padding: 24px 24px 32px !important; }
        }
      `}</style>

      {/* Left panel: bg image */}
      <div style={{ ...S.leftPanel, backgroundImage: `url(${BG})` }} className="login-left-panel">
        <div style={S.leftOverlay} />
        <div style={S.leftContent}>
          <Link to="/" style={S.leftLogo}>
            <div style={S.leftLogoIcon}>🥗</div>
            <span style={S.leftLogoText}>HealthTracker</span>
          </Link>
          <div style={{ animation: 'float 6s ease-in-out infinite', textAlign: 'center' }}>
            <h2 style={S.illusTitle}>Track your nutrition,<br/>transform your health</h2>
            <p style={S.illusSub}>Log meals, monitor protein, and build lasting healthy habits with smart insights.</p>
          </div>
          <div style={S.pillsGrid}>
            {[
              { icon: '🥗', label: 'Smart food logging' },
              { icon: '📊', label: 'Health scoring' },
              { icon: '⚠️', label: 'Allergy alerts' },
              { icon: '💡', label: 'Daily insights' },
            ].map(({ icon, label }) => (
              <div key={label} style={S.featurePill}><span>{icon}</span><span>{label}</span></div>
            ))}
          </div>
          <div style={S.trustRow}>
            {['10k+ Users', '500k+ Meals', '4.9★ Rating'].map(t => (
              <div key={t} style={S.trustBadge}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div style={S.rightPanel} className="login-right-panel">
        <div style={S.rightBlob1} /><div style={S.rightBlob2} />

        {/* Insight banner */}
        <div style={{ ...S.insightBanner, background: insStyle.bg, borderColor: insStyle.border, color: insStyle.color, opacity: insVisible ? 1 : 0, transition: 'opacity 0.35s ease' }}>
          <span style={{ fontSize: '1.1rem' }}>{ins.icon}</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>{ins.text}</span>
        </div>

        <div style={S.formWrap}>
          {/* Mobile logo */}
          <Link to="/" style={{ ...S.mobileLogo, display: 'flex' }}>
            <div style={S.mobileLogoIcon}>🥗</div>
            <div>
              <div style={S.mobileLogoText}>HealthTracker</div>
              <div style={S.mobileLogoSub}>Your nutrition companion</div>
            </div>
          </Link>

          <div style={S.formHeader}>
            <h1 style={S.title}>Welcome back 👋</h1>
            <p style={S.subtitle}>Sign in to continue your health journey</p>
          </div>

          {error && (
            <div style={S.errorBox}><span>⚠️</span><span>{error}</span></div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.field}>
              <label style={S.label}>Email address</label>
              <div style={{ position: 'relative' }}>
                <span style={S.inputIcon}>📧</span>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="jane@example.com" style={S.input} disabled={loading} autoComplete="email"
                  onFocus={e => { e.target.style.borderColor='#16a34a'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)'; e.target.style.background='#fff'; }}
                  onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.boxShadow='none'; e.target.style.background='#f9fafb'; }}
                />
              </div>
            </div>

            <div style={S.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={S.label}>Password</label>
                <button type="button" onClick={() => setShowForgot(true)} style={S.forgotLink}>Forgot password?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={S.inputIcon}>🔒</span>
                <input name="password" type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="Your password"
                  style={{ ...S.input, paddingRight: 46 }} disabled={loading} autoComplete="current-password"
                  onFocus={e => { e.target.style.borderColor='#16a34a'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)'; e.target.style.background='#fff'; }}
                  onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.boxShadow='none'; e.target.style.background='#f9fafb'; }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={S.eyeBtn}>{showPwd ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button type="submit" className="submit-btn" style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? '⏳ Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={S.divider}><div style={S.dividerLine}/><span style={S.dividerText}>or</span><div style={S.dividerLine}/></div>

          <p style={S.footer}>
            Don't have an account?{' '}
            <Link to="/register" style={S.registerLink}>Create one free</Link>
          </p>

          <div style={S.miniFeatures}>
            {['🔒 Secure & private','🆓 Free forever','📱 Works on all devices'].map(t => (
              <span key={t} style={S.miniFeature}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div style={S.overlay} onClick={closeForgot}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={S.modalTitle}>Reset password</h2>
              <button onClick={closeForgot} style={S.closeBtn}>✕</button>
            </div>
            <p style={{ ...S.modalSubtitle, marginBottom: 16 }}>Enter your email and we'll send a reset link.</p>
            <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
              placeholder="jane@example.com" style={{ ...S.input, marginBottom: 12 }}
              onFocus={e => { e.target.style.borderColor='#16a34a'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.12)'; }}
              onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.boxShadow='none'; }}
            />
            {forgotMsg && (
              <div style={{ ...S.errorBox, ...(forgotMsg.type === 'success' ? { background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' } : {}), marginBottom: 12 }}>
                {forgotMsg.type === 'success' ? '✅' : '⚠️'} {forgotMsg.text}
              </div>
            )}
            <button onClick={handleForgotSubmit} disabled={forgotLoading}
              style={{ ...S.submitBtn, width: '100%', opacity: forgotLoading ? 0.7 : 1 }}>
              {forgotLoading ? '⏳ Sending…' : 'Send Reset Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },

  leftPanel: { flex: '0 0 45%', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', flexDirection: 'column' },
  leftOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(21,128,61,0.88) 0%, rgba(20,83,45,0.82) 100%)' },
  leftContent: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '36px 32px', gap: 24 },
  leftLogo: { display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'flex-start', textDecoration: 'none' },
  leftLogoIcon: { width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(255,255,255,0.3)' },
  leftLogoText: { color: '#fff', fontWeight: 800, fontSize: '1.2rem' },
  illusTitle: { color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.25 },
  illusSub: { color: 'rgba(255,255,255,0.78)', fontSize: '0.92rem', margin: 0, lineHeight: 1.65 },
  pillsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' },
  featurePill: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: '0.82rem', fontWeight: 600 },
  trustRow: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  trustBadge: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '5px 14px', color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', fontWeight: 600 },

  rightPanel: { flex: 1, background: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', overflow: 'hidden', paddingTop: 16 },
  rightBlob1: { position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(22,163,74,0.05)', pointerEvents: 'none' },
  rightBlob2: { position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(134,239,172,0.07)', pointerEvents: 'none' },

  insightBanner: { width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', borderBottom: '1.5px solid', marginBottom: 0, flexShrink: 0 },

  formWrap: { width: '100%', maxWidth: 420, padding: '32px 48px 40px', position: 'relative', zIndex: 1 },
  mobileLogo: { alignItems: 'center', gap: 12, marginBottom: 24, textDecoration: 'none' },
  mobileLogoIcon: { width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  mobileLogoText: { fontWeight: 800, fontSize: '1.1rem', color: '#15803d' },
  mobileLogoSub: { fontSize: '0.72rem', color: '#86efac', fontWeight: 500 },

  formHeader: { marginBottom: 24 },
  title: { fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' },
  subtitle: { fontSize: '0.95rem', color: '#6b7280', margin: 0 },
  errorBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 12, fontSize: '0.875rem', marginBottom: 18 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: '0.875rem', fontWeight: 700, color: '#374151' },
  inputIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none', zIndex: 1 },
  input: { width: '100%', padding: '13px 16px 13px 44px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: '0.95rem', color: '#1f2937', background: '#f9fafb', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: 0 },
  forgotLink: { background: 'none', border: 'none', padding: 0, fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' },
  submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', color: '#fff', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(22,163,74,0.3)' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: '#e5e7eb' },
  dividerText: { fontSize: '0.8rem', color: '#9ca3af' },
  footer: { textAlign: 'center', fontSize: '0.9rem', color: '#6b7280', margin: 0 },
  registerLink: { color: '#16a34a', fontWeight: 700, textDecoration: 'none' },
  miniFeatures: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 },
  miniFeature: { fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16, backdropFilter: 'blur(4px)' },
  modal: { background: '#fff', borderRadius: 20, boxShadow: '0 12px 48px rgba(0,0,0,0.18)', padding: '36px 32px', width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 },
  modalSubtitle: { fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0' },
  closeBtn: { background: '#f3f4f6', border: 'none', fontSize: '0.9rem', color: '#6b7280', cursor: 'pointer', padding: '6px 10px', borderRadius: 8 },
};
