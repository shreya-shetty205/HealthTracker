/**
 * InsightBar — rotating contextual insight banner
 * Usage: <InsightBar insights={[...]} /> or <InsightBar /> for defaults
 *
 * Props:
 *   insights: array of { icon, type ('success'|'warning'|'tip'|'allergy'), text }
 *   style:    optional extra style for the bar container
 */

import { useState, useEffect } from 'react';

const DEFAULT_INSIGHTS = [
  { icon: '💡', type: 'tip',     text: "Tip: Log every meal to get accurate health scores and protein tracking." },
  { icon: '🥗', type: 'success', text: "Eating 5+ servings of vegetables weekly reduces disease risk by up to 20%." },
  { icon: '⚠️', type: 'warning', text: "Watch out — processed snacks are often the biggest source of hidden sugars." },
  { icon: '🏆', type: 'success', text: "You're building great habits! Consistency is the #1 factor in long-term health." },
  { icon: '🥩', type: 'tip',     text: "Aim for 0.8–1g of protein per kg of body weight daily for optimal health." },
];

function getStyle(type) {
  switch (type) {
    case 'success': return { background: 'linear-gradient(90deg,#f0fdf4,#dcfce7)', borderColor: '#86efac', color: '#15803d' };
    case 'warning': return { background: 'linear-gradient(90deg,#fffbeb,#fef9c3)', borderColor: '#fde047', color: '#92400e' };
    case 'allergy': return { background: 'linear-gradient(90deg,#fef2f2,#fee2e2)', borderColor: '#fca5a5', color: '#b91c1c' };
    default:        return { background: 'linear-gradient(90deg,#eff6ff,#dbeafe)', borderColor: '#93c5fd', color: '#1d4ed8' };
  }
}

export default function InsightBar({ insights = DEFAULT_INSIGHTS, style = {} }) {
  const [idx, setIdx]           = useState(0);
  const [visible, setVisible]   = useState(true);

  useEffect(() => {
    if (insights.length <= 1) return;
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % insights.length); setVisible(true); }, 380);
    }, 4500);
    return () => clearInterval(iv);
  }, [insights]);

  const ins = insights[idx] || DEFAULT_INSIGHTS[0];
  const ts  = getStyle(ins.type);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 20px',
      background: ts.background,
      borderBottom: `1.5px solid ${ts.borderColor}`,
      color: ts.color,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.38s ease',
      fontSize: '0.86rem',
      fontWeight: 600,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      ...style,
    }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{ins.icon}</span>
      <span style={{ flex: 1 }}>{ins.text}</span>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.65, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {ins.type === 'success' ? '✨ Insight' : ins.type === 'warning' ? '⚡ Alert' : ins.type === 'allergy' ? '🚨 Allergy' : '💬 Tip'}
      </span>
    </div>
  );
}

// ── Convenience preset for Dashboard ──────────────────────
export function DashboardInsights({ meals = [], userAllergy = '' }) {
  const auto = [];

  // Allergy check
  if (userAllergy && meals.length > 0) {
    const w = userAllergy.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const hit = meals.filter(m => w.some(k => (m?.foodName || '').toLowerCase().includes(k)));
    if (hit.length > 0) {
      auto.push({ icon: '🚨', type: 'allergy', text: `Allergy risk! ${hit.length} meal(s) contain your allergen (${userAllergy}). Please avoid these foods.` });
    } else {
      auto.push({ icon: '✅', type: 'success', text: `No allergen (${userAllergy}) detected in your recent meals. Stay safe!` });
    }
  }

  // Protein
  const PROTEIN_DB = { chicken:31,'chicken breast':31,egg:13,eggs:13,milk:3,beef:26,fish:22,salmon:25,tuna:30,tofu:8,paneer:18,lentils:9,dal:9,rice:3,bread:9,pasta:5,oats:17,banana:1,apple:0,burger:17,pizza:11,yogurt:10,cheese:25,protein:25,shake:25,almonds:21,nuts:20,peanut:26,soya:36,chickpea:19 };
  let totalProtein = 0;
  meals.forEach(m => {
    const lower = (m?.foodName || '').toLowerCase();
    for (const [k,v] of Object.entries(PROTEIN_DB)) { if (lower.includes(k)) { totalProtein += v; break; } }
  });

  if (meals.length > 0 && totalProtein < 30) {
    auto.push({ icon: '🥩', type: 'warning', text: `Your estimated protein is low (~${totalProtein}g). Add eggs, chicken, paneer or lentils today.` });
  } else if (totalProtein >= 60) {
    auto.push({ icon: '💪', type: 'success', text: `Great protein intake (~${totalProtein}g)! You're fueling your body well.` });
  }

  // Healthy ratio
  const healthy   = meals.filter(m => m?.category === 'healthy').length;
  const unhealthy = meals.filter(m => m?.category === 'junk').length;
  if (meals.length > 0) {
    const hPct = Math.round((healthy / meals.length) * 100);
    if (hPct >= 60) auto.push({ icon: '🎉', type: 'success', text: `Excellent! ${hPct}% of your logged meals are healthy — keep that momentum going!` });
    else if (hPct < 30 && unhealthy > healthy) auto.push({ icon: '⚠️', type: 'warning', text: `${100-hPct}% of your meals are unhealthy. Try swapping one junk meal for a nutritious option today.` });
  }

  // Streak
  if (meals.length >= 5 && unhealthy === 0) {
    auto.push({ icon: '🏆', type: 'success', text: "Outstanding! You haven't logged a junk meal in this session. Incredible discipline!" });
  }

  // Fallback
  if (auto.length === 0) {
    auto.push({ icon: '🍽️', type: 'tip', text: "Start logging meals to unlock personalized health insights and track your progress." });
  }

  return <InsightBar insights={auto} />;
}
