// models/Meal.js
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    foodName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['healthy', 'unhealthy', 'other'],
      default: 'other',
    },
    score: {
      type: Number,
      default: 0,
    },
    // ── Edamam nutrition fields (null if API unavailable) ──────────────────
    calories: { type: Number, default: null },
    protein:  { type: Number, default: null },
    fat:      { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meal', mealSchema);
