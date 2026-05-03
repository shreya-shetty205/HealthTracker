const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const User = require('../models/User');

// ── Resend email client ────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, allergy } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      allergy: allergy ? allergy.trim().toLowerCase() : ''
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        allergy: user.allergy
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        allergy: user.allergy
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/forgot-password
// Generates a reset token, saves it on the user, and emails a reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success — don't reveal whether the email exists (security best practice)
    if (!user) {
      return res.json({ message: 'If this email is registered, a reset link has been sent.' });
    }

    // Generate a short-lived reset token (15 minutes)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Save the token and expiry on the user document
    // Add these two fields to your User model:
    //   resetPasswordToken: String
    //   resetPasswordExpires: Date
    // Use updateOne so the pre('save') password-hash hook does NOT run
    await User.updateOne(
      { _id: user._id },
      {
        resetPasswordToken:   resetToken,
        resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      }
    );

    // Build the reset link pointing to your frontend
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send the email
    await resend.emails.send({
      from: 'HealthTracker <onboarding@resend.dev>',
      to: user.email,
      subject: 'Reset your HealthTracker password',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 28px;">🥗</span>
            <span style="font-weight: 700; font-size: 1.1rem; color: #16a34a; margin-left: 8px;">HealthTracker</span>
          </div>
          <h2 style="color: #111827; margin: 0 0 8px;">Reset your password</h2>
          <p style="color: #6b7280; margin: 0 0 24px;">
            We received a request to reset your password. Click the button below — this link expires in <strong>15 minutes</strong>.
          </p>
          <a href="${resetLink}"
             style="display: inline-block; padding: 12px 28px; background: #16a34a; color: #fff;
                    text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.95rem;">
            Reset Password
          </a>
          <p style="color: #9ca3af; font-size: 0.8rem; margin-top: 24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 0.75rem;">
            Or copy this link into your browser:<br/>
            <span style="color: #16a34a;">${resetLink}</span>
          </p>
        </div>
      `,
    });

    res.json({ message: 'If this email is registered, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
});

// POST /api/reset-password
// Verifies the token and updates the user's password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Verify the JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    // Find the user and check the stored token still matches
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    // Update password (pre-save hook hashes it automatically)
    // Set token fields to null first via updateOne (no hook), then save new password
    user.password = newPassword;
    user.resetPasswordToken   = null;
    user.resetPasswordExpires = null;
    // markModified ensures Mongoose picks up null values
    user.markModified('resetPasswordToken');
    user.markModified('resetPasswordExpires');
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
