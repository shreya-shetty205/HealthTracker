const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded); // 🔥 DEBUG

    req.user = decoded; // ✅ directly use decoded

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};