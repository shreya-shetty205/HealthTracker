/**
 * AddMeal.jsx — styled to match existing dashboard UI (table style)
 * Props:
 *   token: JWT string
 *   onMealAdded(meal): called after a meal is added
 *   userAllergy: string (optional, e.g. "nuts")
 */

import { useState } from 'react';
import axios from 'axios';

export default function AddMeal({ token, onMealAdded, userAllergy = '' }) {
  const [foodName, setFoodName] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [lastMeal, setLastMeal] = useState(null);

  const handleAdd = async () => {
    const name = foodName.trim();
    if (!name) { setError('Please enter a food name.'); return; }
    if (!navigator.onLine) { setError('No internet connection ❌ Please check your network and try again.'); return; }
    setError('');
    setLoading(true);
    setLastMeal(null);
    try {
      const res = await axios.post(
        '/api/add-meal',
        { foodName: name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const meal = res.data?.meal;
      setFoodName('');
      setLastMeal(meal);
      if (onMealAdded) onMealAdded(meal);
    } catch (err) {
      if (!navigator.onLine) {
        setError('No internet connection ❌ Please check your network and try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to add meal. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isAllergyHit = (name) => {
    if (!userAllergy || !name) return false;
    const words = userAllergy.toLowerCase().split(/[\s,]+/).filter(Boolean);
    return words.some(w => name.toLowerCase().includes(w));
  };

  const getCat = (cat) => {
    if (cat === 'healthy')   return { label: 'Healthy',   bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a' };
    if (cat === 'unhealthy') return { label: 'Unhealthy', bg: '#fef2f2', color: '#ef4444', dot: '#ef4444' };
    return                          { label: 'Other',     bg: '#eff6ff', color: '#3b82f6', dot: '#3b82f6' };
  };

  const scoreColor = (s) => s > 0 ? '#16a34a' : s < 0 ? '#ef4444' : '#6b7280';
  const hasAllergy = lastMeal && isAllergyHit(lastMeal.foodName);
  const cat        = lastMeal ? getCat(lastMeal.category) : null;

  return (
    <div style={S.card}>
      <style>{`
        @keyframes fadeSlide { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .am-input:focus { border-color:#16a34a !important; box-shadow:0 0 0 3px rgba(22,163,74,0.1) !important; background:#fff !important; }
        .am-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(22,163,74,0.35) !important; }
        .am-btn, .am-input { transition: all 0.18s ease !important; }
        @media (max-width: 640px) {
          .am-input-row { flex-direction: column !important; }
          .am-btn { width: 100% !important; justify-content: center !important; }
          .am-thead { display: none !important; }
          .am-trow { flex-direction: column !important; align-items: flex-start !important; padding: 12px !important; gap: 6px !important; }
          .am-tcell { flex: none !important; width: 100% !important; justify-content: space-between !important; }
          .am-tcell::before { content: attr(data-label); font-size: 0.65rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-right: 8px; }
        }
      `}</style>

      {/* Header */}
      <div style={S.cardHeader}>
        <span style={{ fontSize: '1.8rem' }}>🍽️</span>
        <div>
          <h2 style={S.cardTitle}>Add a Meal</h2>
          <p style={S.cardSub}>Log what you ate to track your nutrition &amp; health score</p>
        </div>
      </div>

      {/* Input row */}
      <div style={S.inputRow} className="am-input-row">
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={S.inputEmoji}>🍎</span>
          <input
            className="am-input"
            type="text"
            value={foodName}
            onChange={e => { setFoodName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="What did you eat? (e.g., egg, chicken, rice)"
            disabled={loading}
            style={S.input}
          />
        </div>
        <button
          className="am-btn"
          onClick={handleAdd}
          disabled={loading || !foodName.trim() || !navigator.onLine}
          style={{ ...S.addBtn, opacity: (loading || !foodName.trim() || !navigator.onLine) ? 0.6 : 1, cursor: (loading || !foodName.trim() || !navigator.onLine) ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '⏳ Adding…' : '+ Add Meal'}
        </button>
      </div>

      <p style={S.helperText}>💬 Tip: Use simple food names for better results (e.g., "chicken", "oats", "pizza")</p>

      {error && <div style={S.errorBox}>⚠️ {error}</div>}

      {/* ── Nutrition result — table style matching dashboard ── */}
      {lastMeal && cat && (
        <div style={{ ...S.resultCard, borderColor: hasAllergy ? '#fca5a5' : '#e5e7eb', background: hasAllergy ? '#fffbfb' : '#fafafa', animation: 'fadeSlide 0.28s ease' }}>

          {hasAllergy && (
            <div style={S.allergyWarn}>
              🚨 Allergy alert! This meal may contain your allergen ({userAllergy}).
            </div>
          )}

          {/* Table header row */}
          <div style={S.tHead} className="am-thead">
            <span style={{ ...S.tH, flex: '2 1 0' }}>FOOD</span>
            <span style={S.tH}>CATEGORY</span>
            <span style={S.tH}>SCORE</span>
            <span style={S.tH}>PROTEIN</span>
            <span style={S.tH}>CALORIES</span>
            <span style={S.tH}>FAT</span>
          </div>

          {/* Data row */}
          <div style={{ ...S.tRow, borderLeftColor: cat.dot }} className="am-trow">
            {/* Food */}
            <div style={{ ...S.tCell, flex: '2 1 0', gap: 6 }} className="am-tcell" data-label="Food">
              <span style={S.foodName}>{lastMeal.foodName}</span>
              {hasAllergy && <span style={S.allergyBadge}>⚠️ Allergy</span>}
            </div>
            {/* Category */}
            <div style={S.tCell} className="am-tcell" data-label="Category">
              <span style={{ ...S.catBadge, background: cat.bg, color: cat.color }}>{cat.label}</span>
            </div>
            {/* Score */}
            <div style={S.tCell} className="am-tcell" data-label="Score">
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: scoreColor(lastMeal.score) }}>
                {lastMeal.score > 0 ? `+${lastMeal.score}` : lastMeal.score}
              </span>
            </div>
            {/* Protein */}
            <div style={S.tCell} className="am-tcell" data-label="Protein">
              {lastMeal.protein != null
                ? <span style={S.proteinPill}>{lastMeal.protein != null ? (Number.isInteger(lastMeal.protein) ? '' : '~') : ''}{lastMeal.protein}g</span>
                : <span style={S.na}>—</span>}
            </div>
            {/* Calories */}
            <div style={S.tCell} className="am-tcell" data-label="Calories">
              {lastMeal.calories != null
                ? <span style={S.calText}>{lastMeal.calories} kcal</span>
                : <span style={S.na}>—</span>}
            </div>
            {/* Fat */}
            <div style={S.tCell} className="am-tcell" data-label="Fat">
              {lastMeal.fat != null
                ? <span style={S.fatText}>{lastMeal.fat}g</span>
                : <span style={S.na}>—</span>}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
            <button onClick={() => setLastMeal(null)} style={S.dismissBtn}>✕ Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  card: {
    background: '#fff', borderRadius: 16,
    border: '1.5px solid #e5e7eb', padding: '22px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 14 },
  cardTitle:  { margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#111827' },
  cardSub:    { margin: '2px 0 0', fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 },

  inputRow:   { display: 'flex', gap: 10, alignItems: 'center' },
  inputEmoji: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '12px 14px 12px 40px',
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: '0.92rem', color: '#1f2937', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  addBtn: {
    padding: '12px 20px', flexShrink: 0,
    background: 'linear-gradient(135deg,#16a34a,#22c55e)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(22,163,74,0.28)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  helperText: { margin: 0, fontSize: '0.76rem', color: '#9ca3af', fontWeight: 500 },
  errorBox:   { padding: '10px 14px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600 },

  // Result table
  resultCard: { border: '1.5px solid', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 0 },
  allergyWarn: { marginBottom: 10, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c', fontSize: '0.82rem', fontWeight: 700 },

  tHead: { display: 'flex', alignItems: 'center', padding: '0 0 8px 16px', borderBottom: '1px solid #f3f4f6', gap: 8 },
  tH:    { flex: 1, fontSize: '0.67rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' },

  tRow:  { display: 'flex', alignItems: 'center', padding: '13px 0 13px 12px', gap: 8, borderLeft: '3px solid', marginTop: 4 },
  tCell: { flex: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' },

  foodName:    { fontWeight: 700, fontSize: '0.92rem', color: '#111827', textTransform: 'capitalize' },
  allergyBadge:{ padding: '2px 8px', borderRadius: 100, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '0.68rem', fontWeight: 700, marginLeft: 6 },
  catBadge:    { padding: '4px 12px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700 },
  proteinPill: { padding: '3px 10px', borderRadius: 100, background: '#f0fdf4', color: '#15803d', fontSize: '0.8rem', fontWeight: 700 },
  calText:     { fontSize: '0.88rem', fontWeight: 700, color: '#f97316' },
  fatText:     { fontSize: '0.88rem', fontWeight: 700, color: '#6b7280' },
  na:          { fontSize: '0.82rem', color: '#d1d5db', fontWeight: 600 },

  dismissBtn: { background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem', color: '#9ca3af', cursor: 'pointer', fontWeight: 600 },
};
