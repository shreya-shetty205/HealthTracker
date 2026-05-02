import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login         from './Login';
import Register      from './Register';
import Dashboard     from './Dashboard';
import Home          from './Home';
import ResetPassword from './ResetPassword';

// ── Protected Route ────────────────────────────────────────
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

// ── Smart default redirect ─────────────────────────────────
// Logged in  → /dashboard
// Logged out → /          (home page)
function DefaultRedirect() {
  const token = localStorage.getItem('token');
  return <Navigate to={token ? '/dashboard' : '/'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home / Landing page */}
        <Route path="/"               element={<Home />} />

        {/* Public routes */}
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
