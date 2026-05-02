// routes/meals.js
// ─────────────────────────────────────────────────────────────────────────────
// Meal routes: add, get, delete, health score, insights
// Requires env vars:
//   EDAMAM_APP_ID  — from developer.edamam.com (Food Database API)
//   EDAMAM_APP_KEY — from developer.edamam.com
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const axios   = require('axios');
const router  = express.Router();
const auth    = require('../middleware/auth'); // your existing JWT middleware
const Meal    = require('../models/Meal');     // your existing Meal model

// ── Edamam helper ─────────────────────────────────────────────────────────────
// Returns { calories, protein, fat } or null on failure
async function fetchNutrition(foodName) {
  try {
    const appId  = process.env.EDAMAM_APP_ID;
    const appKey = process.env.EDAMAM_APP_KEY;

    // Skip if env vars are not configured
    if (!appId || !appKey) return null;

    const url = 'https://api.edamam.com/api/food-database/v2/parser';
    const res = await axios.get(url, {
      params: { ingr: foodName, 'app_id': appId, 'app_key': appKey },
      timeout: 5000,
    });

    const hints = res.data?.hints;
    if (!hints || hints.length === 0) return null;

    const nutrients = hints[0]?.food?.nutrients;
    if (!nutrients) return null;

    return {
      calories: Math.round(nutrients.ENERC_KCAL ?? 0),
      protein:  Math.round(nutrients.PROCNT      ?? 0),
      fat:      Math.round(nutrients.FAT         ?? 0),
    };
  } catch {
    return null;
  }
}

// ── Smart category + score logic ───────────────────────────────────────────────
// Keywords checked FIRST (most reliable for common foods),
// then Edamam nutrition data used as secondary signal.
function classifyMeal(foodName, nutrition) {
  const food = foodName.toLowerCase();

  const healthyKeywords = [
    'salad', 'fruit', 'vegetable', 'broccoli', 'spinach', 'apple', 'banana',
    'oats', 'yogurt', 'fish', 'salmon', 'chicken', 'dal', 'lentil', 'tofu',
    'paneer', 'egg', 'milk', 'orange', 'mango', 'grapes', 'carrot', 'tomato',
    'cucumber', 'watermelon', 'strawberry', 'blueberry', 'pear', 'peach',
    'papaya', 'guava', 'pomegranate', 'kiwi', 'idli', 'dosa', 'upma',
    'poha', 'roti', 'chapati', 'rice', 'quinoa', 'avocado', 'almond',
    'walnut', 'peanut', 'chickpea', 'soya', 'tofu', 'sprouts',
  ];

  const unhealthyKeywords = [
    'burger', 'pizza', 'fries', 'chips', 'cake', 'donut', 'soda', 'candy',
    'junk', 'fried', 'alcohol', 'beer', 'wine', 'noodles', 'cookie',
    'chocolate', 'ice cream', 'samosa', 'wafer', 'biscuit', 'pastry',
    'maggi', 'puff', 'roll', 'hotdog', 'nugget',
  ];

  // Step 1: keyword check first
  if (healthyKeywords.some(k => food.includes(k)))   return { category: 'healthy',   score: 10 };
  if (unhealthyKeywords.some(k => food.includes(k))) return { category: 'unhealthy', score: -5 };

  // Step 2: use Edamam nutrition as secondary signal
  if (nutrition) {
    const { calories, protein, fat } = nutrition;
    if (protein > 8 && calories < 500)  return { category: 'healthy',   score: 10 };
    if (fat > 20 || calories > 600)     return { category: 'unhealthy', score: -5 };
  }

  return { category: 'other', score: 2 };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/add-meal
// ─────────────────────────────────────────────────────────────────────────────
router.post('/add-meal', auth, async (req, res) => {
  try {
    const foodName = (req.body.foodName || req.body.name || req.body.food || '').trim();
    if (!foodName) return res.status(400).json({ message: 'Food name is required.' });

    // 1. Try Edamam API
    const nutrition = await fetchNutrition(foodName);

    // 2. Classify meal (keyword first, then nutrition fallback)
    const { category, score } = classifyMeal(foodName, nutrition);

    // 3. Save to MongoDB
    const meal = await Meal.create({
      user:     req.user.id,
      foodName,
      category,
      score,
      calories: nutrition?.calories ?? null,
      protein:  nutrition?.protein  ?? null,
      fat:      nutrition?.fat      ?? null,
    });

    res.status(201).json({ message: 'Meal added successfully.', meal });
  } catch (err) {
    console.error('add-meal error:', err.message);
    res.status(500).json({ message: 'Server error adding meal.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/get-meals
// ─────────────────────────────────────────────────────────────────────────────
router.get('/get-meals', auth, async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ meals });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching meals.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/delete-meal/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/delete-meal/:id', auth, async (req, res) => {
  try {
    await Meal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Meal deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting meal.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/health-score
// ─────────────────────────────────────────────────────────────────────────────
router.get('/health-score', auth, async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.user.id });
    const totalScore = meals.reduce((acc, m) => acc + (m.score ?? 0), 0);
    const breakdown  = {
      healthy:   meals.filter(m => m.category === 'healthy').length,
      unhealthy: meals.filter(m => m.category === 'unhealthy').length,
      other:     meals.filter(m => m.category === 'other').length,
    };
    res.json({ totalScore, breakdown });
  } catch (err) {
    res.status(500).json({ message: 'Server error calculating score.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/insights
// ─────────────────────────────────────────────────────────────────────────────
router.get('/insights', auth, async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.user.id });

    const totalMeals   = meals.length;
    const totalProtein = meals.reduce((acc, m) => acc + (m.protein ?? 0), 0);
    const healthy      = meals.filter(m => m.category === 'healthy').length;
    const unhealthy    = meals.filter(m => m.category === 'unhealthy').length;
    const other        = meals.filter(m => m.category === 'other').length;

    const healthyPct   = totalMeals > 0 ? Math.round((healthy   / totalMeals) * 100) : 0;
    const unhealthyPct = totalMeals > 0 ? Math.round((unhealthy / totalMeals) * 100) : 0;
    const otherPct     = totalMeals > 0 ? Math.round((other     / totalMeals) * 100) : 0;

    const messages = [];

    if (totalMeals === 0) {
      messages.push('Start logging meals to unlock personalized health insights!');
    } else {
      if (totalProtein > 0 && totalProtein < 30) {
        messages.push(`Your protein intake is low (~${Math.round(totalProtein)}g total). Add eggs, chicken, paneer, or lentils.`);
      }
      if (unhealthyPct > healthyPct) {
        messages.push(`Too many unhealthy meals (${unhealthyPct}%). Try swapping one junk meal for something nutritious today.`);
      }
      if (healthyPct >= 60) {
        messages.push(`Great healthy balance! ${healthyPct}% of your meals are healthy — excellent consistency!`);
      }
      if (healthyPct >= 80) {
        messages.push(`Outstanding discipline! You're maintaining an ${healthyPct}% healthy meal ratio. Keep it up!`);
      }
      if (otherPct > 60) {
        messages.push(`Most of your meals are in "Other". Try logging more varied foods for a better health score.`);
      }
      if (messages.length === 0) {
        messages.push(`You have ${totalMeals} meals logged. Keep tracking consistently for better insights!`);
      }
    }

    res.json({ totalMeals, totalProtein: Math.round(totalProtein), healthyPct, unhealthyPct, otherPct, messages });
  } catch (err) {
    console.error('insights error:', err.message);
    res.status(500).json({ message: 'Server error generating insights.' });
  }
});

module.exports = router;