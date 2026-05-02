import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMeal, getMeals, deleteMeal, getHealthScore, getInsightsAPI } from './api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ── Global responsive styles ───────────────────────────────────────────────────
const ResponsiveStyles = () => (
  <style>{`
    * { box-sizing: border-box; }
    @media (max-width: 640px) {
      .dash-header-inner { padding: 0 12px !important; height: 58px !important; }
      .dash-header-tagline { display: none !important; }
      .dash-desktop-nav { display: none !important; }
      .dash-user-name { display: none !important; }
      .dash-main { padding: 16px 12px 100px !important; gap: 16px !important; }
      .dash-hero-row { padding: 20px 16px !important; flex-wrap: wrap !important; }
      .dash-hero-title { font-size: 1.25rem !important; line-height: 1.3 !important; }
      .dash-hero-sub { font-size: 0.82rem !important; }
      .dash-hero-btns { flex-direction: column !important; align-items: stretch !important; }
      .dash-hero-btns button, .dash-hero-btns label { width: 100% !important; justify-content: center !important; box-sizing: border-box !important; }
      .dash-hero-illustration { display: none !important; }
      .dash-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
      .dash-filter-row { flex-direction: column !important; align-items: flex-start !important; }
      .dash-table-wrapper { overflow-x: auto !important; }
      .dash-add-row { flex-wrap: wrap !important; flex-direction: column !important; }
      .dash-add-row button { width: 100% !important; box-sizing: border-box !important; }
      .dash-sick-label { width: 100% !important; }
      * { max-width: 100vw !important; overflow-x: hidden; }
    }
    @media (min-width: 641px) {
      .dash-mobile-nav { display: none !important; }
    }
  `}</style>
);

// ── Smart insights (priority-based, max 1 message) ────────────────────────────
const getInsights = ({ filteredMeals, totalProtein, healthyPct, unhealthyPct, userAllergy, catFilter, feelingSick }) => {
  if (catFilter === 'allergy') {
    if (filteredMeals.length === 0) return [{ icon: '✅', type: 'success', text: `No meals containing your allergen (${userAllergy}) found. You're staying safe!` }];
    return [{ icon: '🚨', type: 'allergy', text: `ALLERGY WARNING! You've eaten ${filteredMeals.length} meal(s) containing your allergen (${userAllergy}). Avoid these foods!` }];
  }

  // Priority 1: Sick
  if (feelingSick) return [{ icon: '🤒', type: 'warning', text: "You're not feeling well. Eat light & healthy food 🍲 — avoid junk, fried, or heavy meals today." }];

  // Priority 2: Allergy hit
  if (userAllergy && filteredMeals.length > 0) {
    const words = userAllergy.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const hit = filteredMeals.filter(m => words.some(w => (m?.foodName ?? '').toLowerCase().includes(w)));
    if (hit.length > 0) return [{ icon: '⚠️', type: 'allergy', text: `Allergy risk! ${hit.length} meal(s) contain your allergen (${userAllergy}). Avoid these foods!` }];
  }

  if (filteredMeals.length === 0) return [{ icon: '🍽️', type: 'neutral', text: "No meals logged yet — start tracking to see your personalized health insights!" }];

  // Priority 3: Low protein
  if (totalProtein < 30) return [{ icon: '🥩', type: 'warning', text: "Your protein intake is low. Add eggs, chicken, paneer, or lentils." }];

  // Priority 4: Too many unhealthy
  if (unhealthyPct > healthyPct) return [{ icon: '⚠️', type: 'warning', text: "Too many unhealthy meals. Try to balance your diet." }];

  // Priority 5: Default good
  return [{ icon: '🎉', type: 'success', text: "Great healthy balance! Keep it up 👍" }];
};

// ── Illustrations ──────────────────────────────────────────────────────────────
const DashboardHeroIllustration = () => (
  <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Glow */}
    <circle cx="100" cy="70" r="60" fill="rgba(22,163,74,0.08)"/>
    {/* Chart bars */}
    <rect x="22" y="75" width="20" height="40" rx="5" fill="#bbf7d0"/>
    <rect x="50" y="55" width="20" height="60" rx="5" fill="#86efac"/>
    <rect x="78" y="35" width="20" height="80" rx="5" fill="#4ade80"/>
    <rect x="106" y="48" width="20" height="67" rx="5" fill="#22c55e"/>
    <rect x="134" y="30" width="20" height="85" rx="5" fill="#16a34a"/>
    {/* Trend line */}
    <path d="M32 75 L60 55 L88 35 L116 48 L144 30" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="32" cy="75" r="4" fill="#f97316"/>
    <circle cx="60" cy="55" r="4" fill="#f97316"/>
    <circle cx="88" cy="35" r="4" fill="#f97316"/>
    <circle cx="116" cy="48" r="4" fill="#f97316"/>
    <circle cx="144" cy="30" r="4" fill="#f97316"/>
    {/* Base */}
    <rect x="14" y="115" width="150" height="2" rx="1" fill="#e5e7eb"/>
    {/* Trophy */}
    <text x="158" y="45" fontSize="28">🏆</text>
    {/* Sparkles */}
    <circle cx="170" cy="80" r="3" fill="#fde68a"/>
    <circle cx="10" cy="50" r="3" fill="#86efac"/>
  </svg>
);

const AddMealHeroIllustration = () => (
  <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="70" r="60" fill="rgba(22,163,74,0.08)"/>
    {/* Plate */}
    <ellipse cx="90" cy="95" rx="58" ry="16" fill="#dcfce7"/>
    <ellipse cx="90" cy="88" rx="58" ry="16" fill="#bbf7d0"/>
    <ellipse cx="90" cy="83" rx="44" ry="12" fill="#86efac"/>
    {/* Food */}
    <circle cx="78" cy="78" r="10" fill="#22c55e"/>
    <circle cx="97" cy="74" r="8" fill="#16a34a"/>
    <circle cx="112" cy="80" r="9" fill="#15803d"/>
    <circle cx="85" cy="70" r="6" fill="#f97316"/>
    <circle cx="103" cy="71" r="5" fill="#ef4444"/>
    {/* Steam */}
    <path d="M78 58 Q80 50 78 42" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M90 54 Q92 45 90 37" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M102 58 Q104 50 102 42" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* Plus badge */}
    <circle cx="158" cy="38" r="22" fill="#16a34a"/>
    <circle cx="158" cy="38" r="22" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
    <rect x="149" y="35" width="18" height="5" rx="2.5" fill="white"/>
    <rect x="155.5" y="28" width="5" height="18" rx="2.5" fill="white"/>
    {/* Utensils */}
    <rect x="28" y="40" width="5" height="60" rx="2.5" fill="#d1d5db"/>
    <rect x="23" y="40" width="2" height="20" rx="1" fill="#d1d5db"/>
    <rect x="29" y="40" width="2" height="20" rx="1" fill="#d1d5db"/>
    <rect x="35" y="40" width="2" height="20" rx="1" fill="#d1d5db"/>
  </svg>
);

const HistoryHeroIllustration = () => (
  <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="70" r="60" fill="rgba(124,58,237,0.06)"/>
    {/* Calendar */}
    <rect x="30" y="28" width="110" height="90" rx="12" fill="white" stroke="#e9d5ff" strokeWidth="2"/>
    <rect x="30" y="28" width="110" height="30" rx="12" fill="#7c3aed"/>
    <rect x="30" y="48" width="110" height="10" rx="0" fill="#7c3aed"/>
    {/* Calendar header dots */}
    <circle cx="52" cy="20" r="5" fill="#7c3aed"/>
    <circle cx="118" cy="20" r="5" fill="#7c3aed"/>
    <rect x="50" y="15" width="4" height="12" rx="2" fill="#7c3aed"/>
    <rect x="116" y="15" width="4" height="12" rx="2" fill="#7c3aed"/>
    {/* Calendar grid - days */}
    {[0,1,2,3,4,5,6].map((d, i) => (
      <rect key={i} x={38 + i*14} y="65" width="10" height="10" rx="3" fill={i===2 ? "#16a34a" : i===4 ? "#ef4444" : "#f3f4f6"}/>
    ))}
    {[0,1,2,3,4,5,6].map((d, i) => (
      <rect key={i} x={38 + i*14} y="81" width="10" height="10" rx="3" fill={i===0 ? "#22c55e" : i===3 ? "#16a34a" : "#f3f4f6"}/>
    ))}
    {[0,1,2,3].map((d, i) => (
      <rect key={i} x={38 + i*14} y="97" width="10" height="10" rx="3" fill={i===1 ? "#f97316" : "#f3f4f6"}/>
    ))}
    {/* Checkmark */}
    <circle cx="162" cy="50" r="20" fill="#dcfce7" stroke="#86efac" strokeWidth="2"/>
    <path d="M153 50 L159 56 L171 44" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InsightsIllustration = () => (
  <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="40" r="35" fill="rgba(251,191,36,0.1)"/>
    {/* Light bulb */}
    <path d="M60 15 C48 15 40 23 40 33 C40 40 44 46 51 49 L51 56 L69 56 L69 49 C76 46 80 40 80 33 C80 23 72 15 60 15Z" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5"/>
    <rect x="53" y="56" width="14" height="4" rx="2" fill="#f59e0b"/>
    <rect x="55" y="62" width="10" height="4" rx="2" fill="#f59e0b"/>
    {/* Shine lines */}
    <line x1="60" y1="5" x2="60" y2="10" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
    <line x1="88" y1="10" x2="85" y2="14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
    <line x1="95" y1="33" x2="90" y2="33" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
    <line x1="32" y1="10" x2="35" y2="14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
    <line x1="25" y1="33" x2="30" y2="33" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
    {/* Inner glow */}
    <ellipse cx="56" cy="30" rx="5" ry="8" fill="rgba(255,255,255,0.5)" transform="rotate(-15 56 30)"/>
  </svg>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  const [meals, setMeals]             = useState([]);
  const [scoreData, setScoreData]     = useState({ totalScore: 0, breakdown: { healthy: 0, unhealthy: 0, other: 0 } });
  const [foodInput, setFoodInput]     = useState('');
  const [loading, setLoading]         = useState(true);
  const [addLoading, setAddLoading]   = useState(false);
  const [message, setMessage]         = useState(null);
  const [dateFilter, setDateFilter]   = useState('all');
  const [catFilter, setCatFilter]     = useState('all');

  const [calendarOpen, setCalendarOpen]   = useState(false);
  const [calendarNav, setCalendarNav]     = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [apiInsights, setApiInsights] = useState(null); // from /api/insights
  const [feelingSick, setFeelingSick] = useState(false);
  const [lastAddedMeal, setLastAddedMeal] = useState(null); // for Add Meal nutrition result

  useEffect(() => {
    if (!calendarOpen) return;
    const handler = () => setCalendarOpen(false);
    const tid = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => { clearTimeout(tid); document.removeEventListener('click', handler); };
  }, [calendarOpen]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mealsRes, scoreRes] = await Promise.all([getMeals(), getHealthScore()]);
      setMeals(mealsRes.data?.meals ?? []);
      setScoreData({
        totalScore: scoreRes.data?.totalScore ?? 0,
        breakdown: {
          healthy:   scoreRes.data?.breakdown?.healthy   ?? 0,
          unhealthy: scoreRes.data?.breakdown?.unhealthy ?? 0,
          other:     scoreRes.data?.breakdown?.other     ?? 0,
        },
      });
    } catch (err) {
      showMessage('error', 'Failed to load data. Please refresh.');
    } finally { setLoading(false); }
    // Fetch insights from API (non-blocking, fallback gracefully)
    try {
      const insRes = await getInsightsAPI();
      if (insRes.data) setApiInsights(insRes.data);
    } catch { /* silent — frontend fallback will be used */ }
  };

  const refreshScore = async () => {
    try {
      const scoreRes = await getHealthScore();
      setScoreData({
        totalScore: scoreRes.data?.totalScore ?? 0,
        breakdown: {
          healthy:   scoreRes.data?.breakdown?.healthy   ?? 0,
          unhealthy: scoreRes.data?.breakdown?.unhealthy ?? 0,
          other:     scoreRes.data?.breakdown?.other     ?? 0,
        },
      });
    } catch { /* silent */ }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4500);
  };

  const checkAllergy = (foodName) => {
    if (!user?.allergy) return false;
    const food = foodName.toLowerCase().trim();
    const words = user.allergy.toLowerCase().split(/[\s,]+/).filter(Boolean);
    return words.some(w => food.includes(w) || w.includes(food) || food.startsWith(w) || w.startsWith(food));
  };

  const handleFoodInputChange = (e) => setFoodInput(e.target.value);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    const trimmed = foodInput.trim();
    if (!trimmed) { showMessage('error', 'Please enter a food name.'); return; }
    if (!navigator.onLine) {
      showMessage('error', 'No internet connection ❌ Please check your network and try again.');
      return; // stop here — never set addLoading, so button re-enables immediately
    }
    const isAllergic = checkAllergy(trimmed);
    setAddLoading(true);
    try {
      const res = await addMeal({ foodName: trimmed, name: trimmed, food: trimmed });
      setFoodInput('');
      setLastAddedMeal(res.data?.meal ?? null);
      await fetchAll();
      if (isAllergic) {
        showMessage('warning', `🚨 Allergy Alert! "${trimmed}" contains your allergen (${user.allergy}). This food can make you sick!`);
      } else {
        showMessage('success', `"${trimmed}" added successfully!`);
      }
    } catch (err) {
      if (!navigator.onLine) {
        showMessage('error', 'No internet connection ❌ Please check your network and try again.');
      } else {
        const status = err.response?.status;
        const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to add meal.';
        showMessage('error', `Error ${status ?? ''}: ${errMsg}`);
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id, foodName) => {
    if (!id) return;
    setMeals(prev => prev.filter(m => (m._id ?? m.id) !== id));
    try {
      await deleteMeal(id);
      await refreshScore();
      showMessage('success', `"${foodName}" removed.`);
    } catch {
      showMessage('error', 'Failed to delete meal. Refreshing…');
      await fetchAll();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getFilteredMeals = () => {
    const now = new Date();
    return meals.filter(meal => {
      if (dateFilter !== 'all') {
        if (!meal?.createdAt) return false;
        const mealDate = new Date(meal.createdAt);
        if (dateFilter === 'today') {
          if (!(mealDate.getDate() === now.getDate() && mealDate.getMonth() === now.getMonth() && mealDate.getFullYear() === now.getFullYear())) return false;
        }
        if (dateFilter === 'yesterday') {
          const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
          if (!(mealDate.getDate() === yesterday.getDate() && mealDate.getMonth() === yesterday.getMonth() && mealDate.getFullYear() === yesterday.getFullYear())) return false;
        }
        if (dateFilter === 'week' && (now - new Date(meal.createdAt)) / (1000 * 60 * 60 * 24) > 7) return false;
        if (dateFilter === 'month') {
          const d = new Date(meal.createdAt);
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
        }
        if (dateFilter === 'custom' && selectedMonth) {
          const d = new Date(meal.createdAt);
          if (d.getMonth() !== selectedMonth.month || d.getFullYear() !== selectedMonth.year) return false;
        }
      }
      if (catFilter !== 'all') {
        if (catFilter === 'allergy') { if (!checkAllergy(meal?.foodName ?? '')) return false; }
        else { if ((meal?.category ?? 'other') !== catFilter) return false; }
      }
      return true;
    });
  };

  const filteredMeals  = getFilteredMeals();
  const filteredTotal  = filteredMeals.length;
  const totalProtein   = filteredMeals.reduce((acc, m) => acc + (m?.protein ?? 0), 0);
  const filteredHealthy   = filteredMeals.filter(m => (m?.category ?? 'other') === 'healthy').length;
  const filteredUnhealthy = filteredMeals.filter(m => (m?.category ?? 'other') === 'unhealthy').length;
  const filteredOther     = filteredMeals.filter(m => (m?.category ?? 'other') === 'other').length;
  const healthyPct   = filteredTotal > 0 ? Math.round((filteredHealthy   / filteredTotal) * 100) : 0;
  const unhealthyPct = filteredTotal > 0 ? Math.round((filteredUnhealthy / filteredTotal) * 100) : 0;
  const otherPct     = filteredTotal > 0 ? Math.round((filteredOther     / filteredTotal) * 100) : 0;

  const filteredScore = filteredMeals.reduce((acc, m) => acc + (m?.score ?? 0), 0);
  const displayScore  = (dateFilter === 'all' && catFilter === 'all') ? scoreData.totalScore : filteredScore;

  const normalizedScore   = Math.min(100, Math.max(0, displayScore));
  const ringCircumference = 2 * Math.PI * 54;
  const ringOffset        = ringCircumference - (normalizedScore / 100) * ringCircumference;
  const ringColor         = displayScore >= 50 ? '#16a34a' : displayScore >= 0 ? '#eab308' : '#ef4444';

  const getScoreColor = (s) => s >= 50 ? '#16a34a' : s >= 0 ? '#eab308' : '#ef4444';
  const getScoreLabel = (s) => {
    if (s >= 80) return 'Excellent 🏆';
    if (s >= 50) return 'Great 🌟';
    if (s >= 20) return 'Good 👍';
    if (s >= 0)  return 'Fair 📈';
    return 'Needs Work 💪';
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return '—'; }
  };

  const now2 = new Date();
  const mealsThisMonth = meals.filter(m => { if (!m?.createdAt) return false; const d = new Date(m.createdAt); return d.getMonth() === now2.getMonth() && d.getFullYear() === now2.getFullYear(); });
  const monthScore     = mealsThisMonth.reduce((acc, m) => acc + (m?.score ?? 0), 0);
  const monthHealthy   = mealsThisMonth.filter(m => (m?.category ?? 'other') === 'healthy').length;
  const monthUnhealthy = mealsThisMonth.filter(m => (m?.category ?? 'other') === 'unhealthy').length;

  // ── Insights: prefer API data, fall back to frontend calculation ──────────
  const insights = (() => {
    // Always use frontend logic for allergy filter (real-time)
    if (catFilter === 'allergy' || !apiInsights) {
      return getInsights({ filteredMeals, totalProtein, healthyPct, unhealthyPct, userAllergy: user?.allergy, catFilter, feelingSick });
    }
    // Convert API messages to insight objects — but use priority logic instead
    return getInsights({ filteredMeals, totalProtein, healthyPct, unhealthyPct, userAllergy: user?.allergy, catFilter, feelingSick });
  })();

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const SHORT  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const filterLabel = dateFilter === 'all' ? 'All Time' : dateFilter === 'today' ? 'Today' : dateFilter === 'yesterday' ? 'Yesterday' : dateFilter === 'week' ? 'This Week' : dateFilter === 'month' ? 'This Month' : selectedMonth ? `${SHORT[selectedMonth.month]} ${selectedMonth.year}` : 'Custom';

  // ── Creative nav config ────────────────────────────────────────────────────
  const navItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      emoji: '📊',
      gradient: 'linear-gradient(135deg, #16a34a, #22c55e)',
      glow: 'rgba(22,163,74,0.35)',
      lightBg: '#f0fdf4',
      lightBorder: '#bbf7d0',
      lightColor: '#15803d',
    },
    {
      key: 'addMeal',
      label: 'Add Meal',
      emoji: '➕',
      gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
      glow: 'rgba(249,115,22,0.35)',
      lightBg: '#fff7ed',
      lightBorder: '#fed7aa',
      lightColor: '#c2410c',
    },
    {
      key: 'history',
      label: 'History',
      emoji: '📋',
      gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      glow: 'rgba(124,58,237,0.35)',
      lightBg: '#faf5ff',
      lightBorder: '#e9d5ff',
      lightColor: '#6d28d9',
    },
  ];

  return (
    <div style={S.page}>
      <ResponsiveStyles />
      <div style={S.bgPattern} />

      {/* ── Header ── */}
      <header style={S.header}>
        <div style={S.headerInner} className="dash-header-inner">
          <div style={S.headerLeft}>
            <div style={S.logoCircle}>🥗</div>
            <div>
              <span style={S.headerTitle}>HealthTracker</span>
              <span style={S.headerTagline} className="dash-header-tagline">Your nutrition dashboard</span>
            </div>
          </div>

          {/* ── Creative Desktop Nav ── */}
          <nav style={S.nav} className="dash-desktop-nav">
            {navItems.map(({ key, label, emoji, gradient, glow, lightBg, lightBorder, lightColor }) => {
              const isActive = activePage === key;
              return (
                <button
                  key={key}
                  onClick={() => setActivePage(key)}
                  style={{
                    ...S.navBtn,
                    ...(isActive ? {
                      background: gradient,
                      color: '#fff',
                      boxShadow: `0 4px 16px ${glow}, 0 1px 4px rgba(0,0,0,0.1)`,
                      border: 'none',
                      transform: 'translateY(-1px)',
                    } : {
                      background: 'transparent',
                      color: '#6b7280',
                    }),
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = lightBg; e.currentTarget.style.color = lightColor; e.currentTarget.style.borderColor = lightBorder; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'transparent'; }}}
                >
                  <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                  <span>{label}</span>
                  {isActive && <span style={S.navDot} />}
                </button>
              );
            })}
          </nav>

          <div style={S.headerRight}>
            <div style={S.userPill}>
              <div style={S.userAvatar}>{(user?.name || 'U')[0].toUpperCase()}</div>
              <span style={S.userName} className="dash-user-name">{user?.name || 'User'}</span>
            </div>
            <button onClick={handleLogout} style={S.logoutBtn}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#b91c1c'; e.currentTarget.style.borderColor = '#fecaca'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
            >Sign Out</button>
          </div>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav style={S.mobileNav} className="dash-mobile-nav">
        {navItems.map(({ key, label, emoji, gradient, glow }) => {
          const isActive = activePage === key;
          return (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              style={{
                ...S.mobileNavBtn,
                ...(isActive ? {
                  background: gradient,
                  color: '#fff',
                  boxShadow: `0 2px 10px ${glow}`,
                  transform: 'scale(1.05)',
                } : {}),
              }}
            >
              <span style={{ fontSize: 22 }}>{emoji}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{label}</span>
            </button>
          );
        })}
      </nav>

      <main style={S.main} className="dash-main">
        {/* Toast */}
        {message && (
          <div style={{ ...S.toast, ...(message.type === 'error' ? S.toastError : message.type === 'success' ? S.toastSuccess : S.toastWarning) }}>
            {message.text}
          </div>
        )}

        {/* Allergy banner */}
        {user?.allergy && (
          <div style={S.allergyBanner}>
            🚫 <span>Allergy alert active: <strong>{user.allergy}</strong> — matching meals are highlighted.</span>
          </div>
        )}

        {/* ══════════ DASHBOARD PAGE ══════════ */}
        {activePage === 'dashboard' && (
          <>
            {/* Hero row */}
            <div style={S.heroRow} className="dash-hero-row">
              <div style={S.heroText}>
                <h1 style={S.heroTitle} className="dash-hero-title">Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
                <p style={S.heroSub} className="dash-hero-sub">Here's your nutrition overview. Keep making healthy choices!</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }} className="dash-hero-btns">
                  <button onClick={() => setActivePage('addMeal')} style={S.heroBtn}>
                    ➕ Log a Meal
                  </button>
                  <button onClick={() => setActivePage('history')} style={{ ...S.heroBtn, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                    📋 View History
                  </button>
                  {/* Feeling Sick toggle */}
                  <label className="dash-sick-label" style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${feelingSick ? '#fca5a5' : '#e5e7eb'}`,
                    background: feelingSick ? '#fef2f2' : '#fff',
                    color: feelingSick ? '#b91c1c' : '#6b7280',
                    fontWeight: 700, fontSize: '0.88rem',
                    transition: 'all 0.2s ease', userSelect: 'none',
                    boxShadow: feelingSick ? '0 2px 8px rgba(239,68,68,0.2)' : 'none',
                  }}>
                    <input
                      type="checkbox"
                      checked={feelingSick}
                      onChange={e => setFeelingSick(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#ef4444', cursor: 'pointer' }}
                    />
                    <span>🤒 Feeling sick today?</span>
                  </label>
                </div>
              </div>
              <div style={{ flexShrink: 0 }} className="dash-hero-illustration">
                <DashboardHeroIllustration />
              </div>
            </div>

            {/* Stat cards */}
            <div style={S.statsGrid} className="dash-stats-grid">
              {/* Health Score Ring */}
              <div style={{ ...S.card, textAlign: 'center', background: 'linear-gradient(145deg, #f0fdf4, #dcfce7)', position: 'relative', overflow: 'hidden' }}>
                <div style={S.cardGlow('#16a34a')} />
                <p style={S.cardLabel}>Overall Health Score</p>
                <div style={{ position: 'relative', display: 'inline-block', margin: '4px 0' }}>
                  <svg width="130" height="130" viewBox="0 0 130 130">
                    <circle cx="65" cy="65" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle cx="65" cy="65" r="54" fill="none" stroke={ringColor} strokeWidth="10"
                      strokeLinecap="round" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset}
                      transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.4s' }}
                    />
                    <text x="65" y="60" textAnchor="middle" fontSize="22" fontWeight="800" fill={ringColor}>
                      {displayScore > 0 ? '+' : ''}{displayScore}
                    </text>
                    <text x="65" y="78" textAnchor="middle" fontSize="10" fill="#9ca3af">pts</text>
                  </svg>
                </div>
                <p style={{ fontWeight: 800, color: ringColor, margin: '0 0 4px', fontSize: '0.95rem' }}>
                  {getScoreLabel(displayScore)}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0 0 8px' }}>{filterLabel}</p>
                {filteredTotal > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={S.bar}>
                      {healthyPct   > 0 && <div style={{ ...S.barSeg, background: '#22c55e', width: `${healthyPct}%`   }} />}
                      {unhealthyPct > 0 && <div style={{ ...S.barSeg, background: '#ef4444', width: `${unhealthyPct}%` }} />}
                      {otherPct     > 0 && <div style={{ ...S.barSeg, background: '#3b82f6', width: `${otherPct}%`     }} />}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0 0' }}>{filteredTotal} meals in view</p>
                  </div>
                )}
              </div>

              {/* This Month */}
              <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
                <div style={S.cardGlow('#3b82f6')} />
                <p style={S.cardLabel}>📅 This Month</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                  <div style={S.statRow}><span style={S.statLabel}>🍽️ Meals logged</span><span style={{ ...S.statVal, color: '#374151' }}>{mealsThisMonth.length}</span></div>
                  <div style={S.statRow}><span style={S.statLabel}>🟢 Healthy</span><span style={{ ...S.statVal, color: '#16a34a' }}>{monthHealthy}</span></div>
                  <div style={S.statRow}><span style={S.statLabel}>🔴 Unhealthy</span><span style={{ ...S.statVal, color: '#b91c1c' }}>{monthUnhealthy}</span></div>
                  <div style={{ ...S.statRow, borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                    <span style={S.statLabel}>📊 Month score</span>
                    <span style={{ ...S.statVal, color: getScoreColor(monthScore), fontWeight: 800 }}>{monthScore > 0 ? '+' : ''}{monthScore} pts</span>
                  </div>
                </div>
              </div>

              {/* Category breakdown */}
              <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
                <div style={S.cardGlow('#f97316')} />
                <p style={S.cardLabel}>🥧 Category Breakdown</p>
                <p style={{ fontSize: '0.73rem', color: '#9ca3af', margin: '-4px 0 10px' }}>{filterLabel}</p>
                {filteredTotal === 0 ? (
                  <p style={S.emptyText}>No meals in this range</p>
                ) : (
                  <>
                    <div style={S.bar}>
                      {healthyPct   > 0 && <div style={{ ...S.barSeg, background: '#22c55e', width: `${healthyPct}%`   }} />}
                      {unhealthyPct > 0 && <div style={{ ...S.barSeg, background: '#ef4444', width: `${unhealthyPct}%` }} />}
                      {otherPct     > 0 && <div style={{ ...S.barSeg, background: '#3b82f6', width: `${otherPct}%`     }} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                      <div style={S.pctRow}><span style={{ ...S.pctDot, background: '#22c55e' }} /><span style={S.pctLabel}>Healthy</span><span style={{ fontWeight: 700, color: '#16a34a' }}>{healthyPct}% <small style={{ color: '#9ca3af', fontWeight: 400 }}>({filteredHealthy})</small></span></div>
                      <div style={S.pctRow}><span style={{ ...S.pctDot, background: '#ef4444' }} /><span style={S.pctLabel}>Unhealthy</span><span style={{ fontWeight: 700, color: '#b91c1c' }}>{unhealthyPct}% <small style={{ color: '#9ca3af', fontWeight: 400 }}>({filteredUnhealthy})</small></span></div>
                      <div style={S.pctRow}><span style={{ ...S.pctDot, background: '#3b82f6' }} /><span style={S.pctLabel}>Other</span><span style={{ fontWeight: 700, color: '#1d4ed8' }}>{otherPct}% <small style={{ color: '#9ca3af', fontWeight: 400 }}>({filteredOther})</small></span></div>
                    </div>
                  </>
                )}
              </div>

              {/* Scoring Guide */}
              <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
                <div style={S.cardGlow('#eab308')} />
                <p style={S.cardLabel}>⭐ Scoring Guide</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  {[
                    { label: 'Healthy',   pts: '+10 pts', color: '#16a34a', bg: '#dcfce7' },
                    { label: 'Unhealthy', pts: '−5 pts',  color: '#b91c1c', bg: '#fee2e2' },
                    { label: 'Other',     pts: '+2 pts',  color: '#1d4ed8', bg: '#dbeafe' },
                  ].map(({ label, pts, color, bg }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ ...S.badge, color, background: bg }}>{label}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>{pts}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, marginTop: 4 }}>
                    <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>Aim for 50%+ healthy meals for a positive score.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── PIE CHART ── */}
            {filteredTotal > 0 && (
              <div style={{ ...S.card, padding: '24px 28px' }}>
                <p style={S.cardLabel}>🥧 Meal Distribution — {filterLabel}</p>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Healthy',   value: filteredHealthy,   color: '#22c55e' },
                        { name: 'Unhealthy', value: filteredUnhealthy, color: '#ef4444' },
                        { name: 'Other',     value: filteredOther,     color: '#3b82f6' },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[
                        { name: 'Healthy',   value: filteredHealthy,   color: '#22c55e' },
                        { name: 'Unhealthy', value: filteredUnhealthy, color: '#ef4444' },
                        { name: 'Other',     value: filteredOther,     color: '#3b82f6' },
                      ].filter(d => d.value > 0).map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} meals (${Math.round((value / filteredTotal) * 100)}%)`, name]}
                      contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: '0.85rem' }}
                    />
                    <Legend
                      formatter={(value) => <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── INSIGHTS SECTION (always visible, prominent) ── */}
            <InsightsSection
              insights={insights}
              filteredTotal={filteredTotal}
              totalProtein={totalProtein}
              healthyPct={healthyPct}
              unhealthyPct={unhealthyPct}
              displayScore={displayScore}
              filterLabel={filterLabel}
            />
          </>
        )}

        {/* ══════════ ADD MEAL PAGE ══════════ */}
        {activePage === 'addMeal' && (
          <>
            {/* Hero */}
            <div style={{ ...S.heroRow, background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', borderRadius: 20, padding: '28px 32px', border: '1px solid #fed7aa' }} className="dash-hero-row">
              <div style={S.heroText}>
                <h1 style={{ ...S.heroTitle, color: '#c2410c' }} className="dash-hero-title">Add a Meal 🍴</h1>
                <p style={S.heroSub}>Log what you ate and we'll analyse its nutrition automatically.</p>
                {user?.allergy && (
                  <div style={{ ...S.allergyBanner, marginTop: 12, maxWidth: 380 }}>
                    🚫 Allergy tracking: <strong>{user.allergy}</strong>
                  </div>
                )}
              </div>
              <div className="dash-hero-illustration"><AddMealHeroIllustration /></div>
            </div>

            {/* Add meal form */}
            <div style={S.card}>
              <h3 style={S.sectionTitle}><span>🍴</span> What did you eat?</h3>
              <form onSubmit={handleAddMeal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }} className="dash-add-row">
                  <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🍽️</span>
                      <input
                        type="text" value={foodInput} onChange={handleFoodInputChange}
                        placeholder="e.g. apple, burger, chicken breast, dal rice…"
                        style={{ ...S.addInput, paddingLeft: 44 }}
                        disabled={addLoading} autoFocus
                      />
                    </div>
                    {foodInput.trim() && checkAllergy(foodInput.trim()) && (
                      <div style={{ ...S.proteinHint, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
                        🚨 <strong>Warning!</strong> This food contains your allergen ({user.allergy}). Eating it can make you sick!
                      </div>
                    )}
                  </div>
                  <button type="submit" style={{ ...S.addBtn, opacity: (addLoading || !foodInput.trim() || !navigator.onLine) ? 0.6 : 1, cursor: (addLoading || !foodInput.trim() || !navigator.onLine) ? 'not-allowed' : 'pointer' }} disabled={addLoading || !foodInput.trim() || !navigator.onLine}>
                    {addLoading ? '⏳ Adding…' : '+ Add Meal'}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Nutrition result card (matches screenshot table style) ── */}
            {lastAddedMeal && (() => {
              const lm = lastAddedMeal;
              const getCat = (cat) => {
                if (cat === 'healthy')   return { label: 'Healthy',   bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a' };
                if (cat === 'unhealthy') return { label: 'Unhealthy', bg: '#fef2f2', color: '#ef4444', dot: '#ef4444' };
                return                          { label: 'Other',     bg: '#eff6ff', color: '#3b82f6', dot: '#3b82f6' };
              };
              const cat = getCat(lm.category);
              const scoreColor = lm.score > 0 ? '#16a34a' : lm.score < 0 ? '#ef4444' : '#6b7280';
              const hasAllergy = checkAllergy(lm.foodName ?? '');
              return (
                <div style={{ ...S.card, border: `1.5px solid ${hasAllergy ? '#fca5a5' : '#e5e7eb'}`, background: hasAllergy ? '#fffbfb' : '#fafafa', animation: 'fadeSlideAM 0.28s ease' }}>
                  <style>{`@keyframes fadeSlideAM { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#15803d' }}>✅ Meal added successfully!</span>
                    <button onClick={() => setLastAddedMeal(null)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '3px 10px', fontSize: '0.75rem', color: '#9ca3af', cursor: 'pointer', fontWeight: 600 }}>✕ Dismiss</button>
                  </div>
                  {hasAllergy && (
                    <div style={{ marginBottom: 10, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c', fontSize: '0.82rem', fontWeight: 700 }}>
                      🚨 Allergy alert! This meal may contain your allergen ({user?.allergy}).
                    </div>
                  )}
                  {/* Table header */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 0 8px 16px', borderBottom: '1px solid #f3f4f6', gap: 8 }}>
                    {['FOOD', 'CATEGORY', 'SCORE', 'PROTEIN', 'CALORIES', 'FAT'].map((h, i) => (
                      <span key={h} style={{ flex: i === 0 ? '2 1 0' : 1, fontSize: '0.67rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
                    ))}
                  </div>
                  {/* Data row */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '13px 0 13px 12px', gap: 8, borderLeft: `3px solid ${cat.dot}`, marginTop: 4 }}>
                    {/* Food */}
                    <div style={{ flex: '2 1 0', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111827', textTransform: 'capitalize' }}>{lm.foodName}</span>
                      {hasAllergy && <span style={{ padding: '2px 8px', borderRadius: 100, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '0.68rem', fontWeight: 700 }}>⚠️ Allergy</span>}
                    </div>
                    {/* Category */}
                    <div style={{ flex: 1 }}>
                      <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700, background: cat.bg, color: cat.color }}>{cat.label}</span>
                    </div>
                    {/* Score */}
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: scoreColor }}>{lm.score > 0 ? `+${lm.score}` : lm.score}</span>
                    </div>
                    {/* Protein */}
                    <div style={{ flex: 1 }}>
                      {lm.protein != null
                        ? <span style={{ padding: '3px 10px', borderRadius: 100, background: '#f0fdf4', color: '#15803d', fontSize: '0.8rem', fontWeight: 700 }}>~{lm.protein}g</span>
                        : <span style={{ fontSize: '0.82rem', color: '#d1d5db', fontWeight: 600 }}>—</span>}
                    </div>
                    {/* Calories */}
                    <div style={{ flex: 1 }}>
                      {lm.calories != null
                        ? <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f97316' }}>{lm.calories} kcal</span>
                        : <span style={{ fontSize: '0.82rem', color: '#d1d5db', fontWeight: 600 }}>—</span>}
                    </div>
                    {/* Fat */}
                    <div style={{ flex: 1 }}>
                      {lm.fat != null
                        ? <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#6b7280' }}>{lm.fat}g</span>
                        : <span style={{ fontSize: '0.82rem', color: '#d1d5db', fontWeight: 600 }}>—</span>}
                    </div>
                  </div>
                </div>
              );
            })()}
            <div style={{ ...S.card, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
              <h3 style={{ ...S.sectionTitle, color: '#1d4ed8' }}>💡 Tips for better tracking</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                {[
                  { icon: '🥗', title: 'Be specific', desc: 'Say "grilled chicken breast" instead of just "chicken" for better analysis.' },
                  { icon: '🍳', title: 'Log each item', desc: 'Add ingredients separately to get the most accurate health score.' },
                  { icon: '⏰', title: 'Log right away', desc: 'Logging meals immediately gives the most accurate daily insights.' },
                  { icon: '🥤', title: 'Include drinks', desc: 'Smoothies, juices, and shakes count — add them too!' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 4, fontSize: '0.9rem' }}>{title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#3b82f6', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent meals */}
            {meals.length > 0 && (
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ ...S.sectionTitle, margin: 0 }}>🕐 Recently Added</h3>
                  <button onClick={() => setActivePage('history')} style={S.linkBtn}>View all →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {meals.slice(0, 5).map(meal => {
                    const id  = meal?._id ?? meal?.id;
                    const cat = meal?.category ?? 'other';
                    const catStyle = { healthy: { color: '#16a34a', bg: '#dcfce7' }, unhealthy: { color: '#b91c1c', bg: '#fee2e2' }, other: { color: '#1d4ed8', bg: '#dbeafe' } }[cat] ?? { color: '#1d4ed8', bg: '#dbeafe' };
                    const hasAllergy = checkAllergy(meal?.foodName ?? '');
                    return (
                      <div key={id} style={{ ...S.recentRow, ...(hasAllergy ? { borderLeft: '3px solid #ef4444', background: '#fef2f2' } : {}) }}>
                        <span style={{ fontWeight: 600, flex: 1 }}>
                          {meal?.foodName ?? '—'}
                          {hasAllergy && <span style={S.allergyBadge}>⚠️ Allergy</span>}
                        </span>
                        <span style={{ ...S.badge, color: catStyle.color, background: catStyle.bg, textTransform: 'capitalize', fontSize: '0.75rem' }}>{cat}</span>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af', minWidth: 80, textAlign: 'right' }}>{formatDate(meal?.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════ HISTORY PAGE ══════════ */}
        {activePage === 'history' && (
          <>
            {/* Hero */}
            <div style={{ ...S.heroRow, background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', borderRadius: 20, padding: '28px 32px', border: '1px solid #ddd6fe' }}>
              <div style={S.heroText}>
                <h1 style={{ ...S.heroTitle, color: '#5b21b6' }}>Meal History 📋</h1>
                <p style={S.heroSub}>Filter, explore, and manage all your logged meals.</p>
              </div>
              <HistoryHeroIllustration />
            </div>

            {/* Mini stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14 }}>
              {[
                { label: 'Total Meals', value: filteredTotal, color: '#374151', icon: '🍽️' },
                { label: 'Score',       value: `${displayScore > 0 ? '+' : ''}${displayScore} pts`, color: getScoreColor(displayScore), icon: '📊' },
                { label: 'Healthy',     value: `${filteredHealthy} (${healthyPct}%)`, color: '#16a34a', icon: '🟢' },
                { label: 'Unhealthy',   value: `${filteredUnhealthy} (${unhealthyPct}%)`, color: '#b91c1c', icon: '🔴' },
                { label: 'Protein',     value: `~${totalProtein}g`, color: '#9333ea', icon: '💪' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} style={{ ...S.card, padding: '16px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color }}>{value}</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Filters + table */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
                <h3 style={{ ...S.sectionTitle, margin: 0 }}>
                  <span>📋</span> Meal History
                  <span style={S.mealCount}>{filteredTotal} meals</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  {/* Date filters */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                    {[
                      { key: 'all', label: 'All Time' }, { key: 'today', label: '📅 Today' },
                      { key: 'yesterday', label: '🕐 Yesterday' }, { key: 'week', label: '📆 This Week' },
                      { key: 'month', label: '🗓️ This Month' },
                    ].map(({ key, label }) => (
                      <button key={key} onClick={() => { setDateFilter(key); setSelectedMonth(null); setCalendarOpen(false); }}
                        style={{ ...S.filterTab, ...(dateFilter === key ? S.filterTabActive : {}) }}
                      >{label}</button>
                    ))}
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setCalendarOpen(o => !o)}
                        style={{ ...S.filterTab, ...(dateFilter === 'custom' ? S.filterTabActive : {}), display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        📆 {dateFilter === 'custom' && selectedMonth ? `${SHORT[selectedMonth.month]} ${selectedMonth.year}` : 'Pick Month'}
                        <span style={{ fontSize: '0.7rem' }}>{calendarOpen ? '▲' : '▼'}</span>
                      </button>
                      {calendarOpen && (() => {
                        const nowCal = new Date();
                        return (
                          <div style={S.calDropdown} onClick={e => e.stopPropagation()}>
                            <div style={S.calHeader}>
                              <button style={S.calNavBtn} onClick={() => setCalendarNav(n => ({ ...n, year: n.year - 1 }))}>‹</button>
                              <span style={{ fontWeight: 700, color: '#111827' }}>{calendarNav.year}</span>
                              <button style={S.calNavBtn} onClick={() => setCalendarNav(n => ({ ...n, year: Math.min(n.year + 1, nowCal.getFullYear()) }))} disabled={calendarNav.year >= nowCal.getFullYear()}>›</button>
                            </div>
                            <div style={S.calGrid}>
                              {SHORT.map((m, i) => {
                                const isFuture = calendarNav.year > nowCal.getFullYear() || (calendarNav.year === nowCal.getFullYear() && i > nowCal.getMonth());
                                const isSelected = dateFilter === 'custom' && selectedMonth?.month === i && selectedMonth?.year === calendarNav.year;
                                const isCurrent = i === nowCal.getMonth() && calendarNav.year === nowCal.getFullYear();
                                return (
                                  <button key={m} disabled={isFuture}
                                    onClick={() => { setSelectedMonth({ year: calendarNav.year, month: i }); setDateFilter('custom'); setCalendarOpen(false); }}
                                    style={{ ...S.calMonthBtn, ...(isSelected ? S.calMonthBtnActive : isFuture ? S.calMonthBtnDisabled : isCurrent ? S.calMonthBtnCurrent : {}) }}
                                  >{m}</button>
                                );
                              })}
                            </div>
                            {dateFilter === 'custom' && (
                              <button style={S.calClearBtn} onClick={() => { setDateFilter('all'); setSelectedMonth(null); setCalendarOpen(false); }}>✕ Clear</button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {/* Category filters */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                    {[
                      { key: 'all', label: 'All', activeBg: '#16a34a', activeBorder: '#16a34a', activeColor: '#fff' },
                      { key: 'healthy', label: '🟢 Healthy', activeBg: '#dcfce7', activeBorder: '#16a34a', activeColor: '#15803d' },
                      { key: 'unhealthy', label: '🔴 Unhealthy', activeBg: '#fee2e2', activeBorder: '#ef4444', activeColor: '#b91c1c' },
                      { key: 'other', label: '🔵 Other', activeBg: '#dbeafe', activeBorder: '#3b82f6', activeColor: '#1d4ed8' },
                      { key: 'allergy', label: '⚠️ Allergy', activeBg: '#fef3c7', activeBorder: '#f59e0b', activeColor: '#92400e' },
                    ].map(({ key, label, activeBg, activeBorder, activeColor }) => (
                      <button key={key} onClick={() => setCatFilter(key)}
                        style={{ ...S.filterTab, ...(catFilter === key ? { background: activeBg, color: activeColor, border: `1.5px solid ${activeBorder}` } : {}) }}
                      >{label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {catFilter === 'allergy' && (
                <div style={{ ...S.insightMsg, ...S.insightAllergy, marginBottom: 16 }}>
                  <span style={{ fontSize: 20 }}>🚨</span>
                  <span>
                    {filteredMeals.length === 0
                      ? `No allergy meals found! Great — you're avoiding ${user?.allergy || 'your allergen'} successfully.`
                      : `Warning! You've logged ${filteredMeals.length} meal(s) containing your allergen (${user?.allergy}). Please avoid these!`}
                  </span>
                </div>
              )}

              {loading ? (
                <div style={S.emptyState}><span style={{ fontSize: 36 }}>⏳</span><p>Loading meals…</p></div>
              ) : filteredMeals.length === 0 ? (
                <div style={S.emptyState}>
                  <span style={{ fontSize: 36 }}>🍽️</span>
                  <p>{dateFilter === 'all' && catFilter === 'all' ? 'No meals logged yet.' : 'No meals match the current filters.'}</p>
                  <button onClick={() => setActivePage('addMeal')} style={{ ...S.addBtn, marginTop: 8, fontSize: '0.9rem', padding: '10px 20px' }}>
                    ➕ Add a Meal
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }} className="dash-table-wrapper">
                  <table style={S.table}>
                    <thead>
                      <tr>{['Food', 'Category', 'Score', 'Protein', 'Calories', 'Fat', 'Time', 'Action'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {filteredMeals.map(meal => {
                        const id = meal?._id ?? meal?.id;
                        const cat = meal?.category ?? 'other';
                        const score = meal?.score ?? 0;
                        const catStyle = { healthy: { color: '#16a34a', bg: '#dcfce7' }, unhealthy: { color: '#b91c1c', bg: '#fee2e2' }, other: { color: '#1d4ed8', bg: '#dbeafe' } }[cat] ?? { color: '#1d4ed8', bg: '#dbeafe' };
                        const protein = meal?.protein ?? null;
                        const hasAllergy = checkAllergy(meal?.foodName ?? '');
                        return (
                          <tr key={id} style={{ ...S.tableRow, ...(hasAllergy ? S.allergyRow : {}) }}>
                            <td style={S.td}>
                              <strong>{meal?.foodName ?? '—'}</strong>
                              {hasAllergy && <span style={S.allergyBadge}>⚠️ Allergy</span>}
                            </td>
                            <td style={S.td}><span style={{ ...S.badge, color: catStyle.color, background: catStyle.bg, textTransform: 'capitalize' }}>{cat}</span></td>
                            <td style={S.td}><span style={{ fontWeight: 700, color: score >= 0 ? '#16a34a' : '#ef4444' }}>{score > 0 ? '+' : ''}{score}</span></td>
                            <td style={S.td}>{protein !== null ? <span style={S.proteinBadge}>~{protein}g</span> : meal?.protein ? <span style={S.proteinBadge}>{Math.round(meal.protein)}g</span> : <span style={{ color: '#d1d5db' }}>—</span>}</td>
                            <td style={S.td}>{meal?.calories ? <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f97316', background: '#fff7ed', padding: '3px 10px', borderRadius: 100 }}>{Math.round(meal.calories)} kcal</span> : <span style={{ color: '#d1d5db' }}>—</span>}</td>
                            <td style={S.td}>{meal?.fat ? <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6', background: '#f5f3ff', padding: '3px 10px', borderRadius: 100 }}>{Math.round(meal.fat)}g</span> : <span style={{ color: '#d1d5db' }}>—</span>}</td>
                            <td style={{ ...S.td, color: '#9ca3af', fontSize: '0.85rem' }}>{formatDate(meal?.createdAt)}</td>
                            <td style={S.td}>
                              <button onClick={() => handleDelete(id, meal?.foodName)} style={S.deleteBtn}>🗑 Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .insight-card { animation: fadeUp 0.4s ease both; }
      `}</style>
    </div>
  );
}

// ── Insights Section Component ─────────────────────────────────────────────────
function InsightsSection({ insights, filteredTotal, totalProtein, healthyPct, unhealthyPct, displayScore, filterLabel }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #fffde7 100%)',
      border: '1.5px solid #fde68a',
      borderRadius: 20,
      padding: '28px 28px 24px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(234,179,8,0.1)',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(251,191,36,0.12)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <InsightsIllustration />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#78350f', margin: '0 0 4px' }}>
              💡 Smart Insights
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#a16207', margin: 0 }}>AI-powered analysis of your nutrition patterns</p>
          </div>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#92400e', background: '#fde68a', padding: '4px 14px', borderRadius: 100, fontWeight: 700 }}>
          📅 {filterLabel}
        </span>
      </div>

      {/* Totals row */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0,
        background: 'rgba(255,255,255,0.75)', borderRadius: 14, padding: '16px 20px',
        border: '1px solid rgba(253,230,138,0.6)', marginBottom: 20,
      }}>
        {[
          { num: filteredTotal, label: 'Meals', color: '#92400e' },
          { num: `~${totalProtein}g`, label: 'Protein', color: '#16a34a' },
          { num: `${healthyPct}%`, label: 'Healthy', color: '#16a34a' },
          { num: `${unhealthyPct}%`, label: 'Unhealthy', color: '#b91c1c' },
          { num: `${displayScore > 0 ? '+' : ''}${displayScore}`, label: 'Score', color: displayScore >= 0 ? '#16a34a' : '#ef4444' },
        ].map(({ num, label, color }, i, arr) => (
          <>
            <div key={label} style={{ flex: 1, textAlign: 'center', minWidth: 64 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1.1 }}>{num}</div>
              <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{label}</div>
            </div>
            {i < arr.length - 1 && <div style={{ width: 1, height: 44, background: '#fde68a', flexShrink: 0 }} />}
          </>
        ))}
      </div>

      {/* Insight cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {insights.map((insight, i) => (
          <div
            key={i}
            className="insight-card"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '14px 16px', borderRadius: 12,
              animationDelay: `${i * 0.07}s`,
              ...(insight.type === 'success'
                ? { background: 'rgba(240,253,244,0.9)', border: '1px solid #86efac', color: '#15803d' }
                : insight.type === 'allergy'
                ? { background: '#fef2f2', border: '1.5px solid #fecaca', color: '#b91c1c' }
                : insight.type === 'warning'
                ? { background: 'rgba(255,251,235,0.9)', border: '1px solid #fde68a', color: '#92400e' }
                : { background: 'rgba(249,250,251,0.9)', border: '1px solid #e5e7eb', color: '#374151' })
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.3 }}>{insight.icon}</span>
            <span style={{ fontSize: '0.875rem', lineHeight: 1.6, fontWeight: insight.type === 'allergy' ? 600 : 400 }}>
              {insight.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: `radial-gradient(ellipse at 20% 0%, rgba(134,239,172,0.14) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 10%, rgba(74,222,128,0.09) 0%, transparent 50%),
      #f0fdf4`,
    paddingBottom: 90,
    position: 'relative',
  },
  bgPattern: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%2316a34a' fill-opacity='0.025'%3E%3Cpath d='M30 28v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },

  header: {
    background: 'rgba(255,255,255,0.94)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(229,231,235,0.8)',
    position: 'sticky', top: 0, zIndex: 20,
    boxShadow: '0 1px 16px rgba(22,163,74,0.08)',
  },
  headerInner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 24px',
    height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  logoCircle: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, boxShadow: '0 2px 10px rgba(22,163,74,0.3)', flexShrink: 0,
  },
  headerTitle:   { fontWeight: 800, fontSize: '1.1rem', color: '#15803d', display: 'block', lineHeight: 1.1 },
  headerTagline: { fontSize: '0.7rem', color: '#86efac', display: 'block', fontWeight: 500 },
  headerRight:   { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  userPill: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 100, padding: '5px 14px 5px 5px',
  },
  userAvatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    color: '#fff', fontWeight: 700, fontSize: '0.8rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userName: { fontSize: '0.85rem', fontWeight: 600, color: '#15803d' },
  logoutBtn: {
    padding: '7px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10,
    background: '#fff', color: '#374151', fontSize: '0.85rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
  },

  /* ── Creative Nav ── */
  nav: { display: 'flex', gap: 6, alignItems: 'center' },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '9px 18px', borderRadius: 12,
    border: '1.5px solid transparent',
    fontWeight: 700, fontSize: '0.875rem',
    cursor: 'pointer', transition: 'all 0.2s ease',
    position: 'relative', letterSpacing: '0.01em',
  },
  navDot: {
    position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
    width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.7)',
  },

  /* Mobile nav */
  mobileNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
    background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
    borderTop: '1px solid #e5e7eb',
    display: 'flex', justifyContent: 'space-around',
    padding: '10px 16px 16px', gap: 12,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
  },
  mobileNavBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#6b7280',
    padding: '8px 16px', borderRadius: 14, transition: 'all 0.2s ease',
    minWidth: 72, flex: 1,
  },

  main: {
    maxWidth: 1200, margin: '0 auto', padding: '28px 24px 48px',
    display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', zIndex: 1,
  },

  heroRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  heroText:  { flex: 1, minWidth: 200 },
  heroTitle: { fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.01em' },
  heroSub:   { fontSize: '0.95rem', color: '#6b7280', margin: 0 },
  heroBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(22,163,74,0.3)', transition: 'all 0.2s',
  },

  toast: { padding: '12px 18px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', animation: 'slideIn 0.3s ease' },
  toastError:   { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
  toastSuccess: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
  toastWarning: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' },

  allergyBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 18px', background: '#fffbeb',
    border: '1px solid #fde68a', borderRadius: 12,
    fontSize: '0.9rem', color: '#92400e',
  },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 },

  card: {
    background: '#fff', borderRadius: 18, border: '1px solid rgba(229,231,235,0.8)',
    padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
  },
  cardLabel: {
    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#9ca3af', margin: '0 0 14px',
  },
  cardGlow: (color) => ({
    position: 'absolute', top: -30, right: -30, width: 120, height: 120,
    borderRadius: '50%', background: `${color}0D`, pointerEvents: 'none',
  }),

  bar: { display: 'flex', height: 10, borderRadius: 100, overflow: 'hidden', background: '#f3f4f6', margin: '10px 0 8px' },
  barSeg: { height: '100%', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' },

  statRow:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { fontSize: '0.875rem', color: '#6b7280' },
  statVal:   { fontSize: '1rem', fontWeight: 700 },
  pctRow:   { display: 'flex', alignItems: 'center', gap: 8 },
  pctDot:   { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  pctLabel: { fontSize: '0.875rem', color: '#6b7280', flex: 1 },
  badge:    { display: 'inline-block', padding: '3px 12px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700 },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 },
  mealCount: { fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', background: '#f3f4f6', padding: '3px 10px', borderRadius: 100 },

  insightMsg:     { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 10 },
  insightAllergy: { background: '#fef2f2', border: '1.5px solid #fecaca', color: '#b91c1c', fontWeight: 600 },

  // Add meal
  addInput: {
    width: '100%', padding: '13px 16px',
    border: '1.5px solid #e5e7eb', borderRadius: 12,
    fontSize: '1rem', color: '#1f2937', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  addBtn: {
    flexShrink: 0, padding: '13px 24px',
    background: 'linear-gradient(135deg, #f97316, #fb923c)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 3px 12px rgba(249,115,22,0.3)', whiteSpace: 'nowrap',
  },
  proteinHint: {
    fontSize: '0.82rem', color: '#15803d', background: '#f0fdf4',
    border: '1px solid #bbf7d0', borderRadius: 8, padding: '7px 12px',
  },
  recentRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
    borderRadius: 10, background: '#f9fafb', border: '1px solid #f3f4f6',
  },
  allergyBadge: {
    display: 'inline-block', marginLeft: 8, padding: '2px 8px', borderRadius: 100,
    fontSize: '0.72rem', fontWeight: 700, background: '#fee2e2', color: '#b91c1c',
    border: '1px solid #fecaca', verticalAlign: 'middle',
  },
  linkBtn: { background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', padding: 0, textDecoration: 'underline' },

  // Filters
  filterTab: { padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, borderRadius: 100, border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', transition: 'all 0.15s' },
  filterTabActive: { background: '#16a34a', color: '#fff', border: '1.5px solid #16a34a' },

  // Table
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '2px solid #f3f4f6' },
  tableRow:  { borderBottom: '1px solid #f9fafb', transition: 'background 0.1s' },
  td:        { padding: '13px 14px', fontSize: '0.9rem', color: '#374151', verticalAlign: 'middle' },
  allergyRow: { background: '#fef2f2', borderLeft: '3px solid #ef4444' },
  proteinBadge: { fontSize: '0.8rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: 100 },
  deleteBtn: { padding: '5px 14px', fontSize: '0.8rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' },
  emptyText:  { textAlign: 'center', color: '#9ca3af', padding: '12px 0', fontSize: '0.9rem' },
  emptyState: { textAlign: 'center', padding: '40px 24px', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },

  // Calendar
  calDropdown: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 50, background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 18, width: 248 },
  calHeader:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  calNavBtn:   { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#374151', padding: '2px 8px', borderRadius: 6 },
  calGrid:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 },
  calMonthBtn: { padding: '8px 4px', fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#374151', cursor: 'pointer', transition: 'all 0.15s' },
  calMonthBtnActive:   { background: '#16a34a', color: '#fff', border: '1.5px solid #16a34a' },
  calMonthBtnCurrent:  { border: '1.5px solid #86efac', color: '#15803d', background: '#f0fdf4' },
  calMonthBtnDisabled: { opacity: 0.35, cursor: 'not-allowed', background: '#f9fafb' },
  calClearBtn: { marginTop: 10, width: '100%', padding: 7, fontSize: '0.8rem', fontWeight: 600, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer' },
};
