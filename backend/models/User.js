const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     String,
  email:    String,
  password: String,
  allergy:  String,

  // ── Password reset ──────────────────────────────────────────────────────────
  resetPasswordToken:   { type: String, default: null },  // JWT token sent in reset email
  resetPasswordExpires: { type: Date,   default: null },  // Expires 15 min after request
});

// ✅ FIXED (NO next, NO callback)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ✅ compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);