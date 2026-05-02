import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const getPasswordStrength = (pwd) => {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 6)            score++;
  if (pwd.length >= 10)           score++;
  if (/[A-Z]/.test(pwd))          score++;
  if (/[0-9]/.test(pwd))          score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;
  if (score <= 1) return { label: 'Weak',   color: '#ef4444', width: '25%'  };
  if (score <= 2) return { label: 'Fair',   color: '#f97316', width: '50%'  };
  if (score <= 3) return { label: 'Good',   color: '#eab308', width: '70%'  };
  return             { label: 'Strong', color: '#16a34a', width: '100%' };
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [loading,  setLoading]    = useState(false);
  const [showPwd,  setShowPwd]    = useState(false);
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState(false);

  // If no token in URL, show an error immediately
  useEffect(() => {
    if (!token) setError('Invalid or missing reset link. Please request a new one.');
  }, [token]);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) { setError('Please enter a new password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await axios.post('/api/reset-password', { token, newPassword: password });
      setSuccess(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🥗</span>
          <span style={styles.logoText}>HealthTracker</span>
        </div>

        {success ? (
          /* ── Success state ── */
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <h1 style={styles.title}>Password reset!</h1>
            <p style={styles.subtitle}>
              Your password has been updated successfully.
              Redirecting you to login in a moment…
            </p>
            <Link to="/login" style={styles.btn}>Go to Login</Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h1 style={styles.title}>Set new password</h1>
            <p style={styles.subtitle}>
              Choose a strong password for your account.
            </p>

            {error && (
              <div style={{ ...styles.alert, ...styles.alertError }}>
                ⚠️ {error}
                {!token && (
                  <span>
                    {' '}
                    <Link to="/login" style={{ color: '#b91c1c', fontWeight: 700 }}>
                      Back to login →
                    </Link>
                  </span>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* New password */}
              <div style={styles.field}>
                <label style={styles.label}>New Password</label>
                <div style={styles.inputWrap}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    style={styles.input}
                    disabled={loading || !token}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPwd(v => !v)}
                    tabIndex={-1}
                  >
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength bar */}
                {password && strength && (
                  <div>
                    <div style={styles.strengthTrack}>
                      <div style={{ ...styles.strengthFill, width: strength.width, background: strength.color }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: strength.color, fontWeight: 600 }}>
                      {strength.label} password
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  style={{
                    ...styles.input,
                    borderColor: confirm && confirm !== password ? '#fca5a5' : undefined,
                  }}
                  disabled={loading || !token}
                  autoComplete="new-password"
                />
                {confirm && confirm !== password && (
                  <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>Passwords do not match</span>
                )}
                {confirm && confirm === password && (
                  <span style={{ fontSize: '0.78rem', color: '#16a34a' }}>✓ Passwords match</span>
                )}
              </div>

              <button
                type="submit"
                style={{
                  ...styles.btn,
                  opacity: (loading || !token) ? 0.6 : 1,
                  cursor:  (loading || !token) ? 'not-allowed' : 'pointer',
                }}
                disabled={loading || !token}
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>

            <p style={styles.footer}>
              Remembered it?{' '}
              <Link to="/login" style={styles.link}>Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: '#fff', borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    padding: '40px 36px', width: '100%', maxWidth: 420,
  },
  logo:     { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 },
  logoIcon: { fontSize: 28 },
  logoText: { fontWeight: 700, fontSize: '1.1rem', color: '#16a34a' },
  title:    { fontSize: '1.6rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' },
  subtitle: { fontSize: '0.9rem', color: '#6b7280', margin: '0 0 24px' },
  alert: {
    padding: '10px 14px', borderRadius: 8, fontSize: '0.875rem', marginBottom: 16,
  },
  alertError: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
  form:   { display: 'flex', flexDirection: 'column', gap: 18 },
  field:  { display: 'flex', flexDirection: 'column', gap: 5 },
  label:  { fontSize: '0.85rem', fontWeight: 600, color: '#374151' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: {
    width: '100%', padding: '10px 40px 10px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 8,
    fontSize: '0.95rem', color: '#1f2937', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute', right: 10,
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
  },
  strengthTrack: {
    height: 4, borderRadius: 100, background: '#e5e7eb', marginTop: 6,
  },
  strengthFill: {
    height: '100%', borderRadius: 100, transition: 'width 0.3s, background 0.3s',
  },
  btn: {
    display: 'block', textAlign: 'center',
    padding: '12px', background: '#16a34a', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: '0.95rem',
    fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
    marginTop: 4,
  },
  footer: { textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: 20 },
  link:   { color: '#16a34a', fontWeight: 600, textDecoration: 'none' },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' },
  successIcon: { fontSize: 48, marginBottom: 4 },
};
