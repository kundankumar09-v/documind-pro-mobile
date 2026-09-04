import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff, Brain, FileText, Zap } from 'lucide-react';

/* ─── Left panel — reusable art section ─── */
function AuthLeftPanel() {
  return (
    <div className="auth-left">
      <div className="auth-left-mesh" />
      <div className="auth-left-grid" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-left-content">
        <div className="auth-left-logo">
          <div className="auth-left-logo-mark">
            <Shield size={22} color="white" strokeWidth={2} />
          </div>
          <span className="auth-left-logo-name">Docu<span>Mind</span></span>
        </div>

        <h2 className="auth-left-tagline">
          Intelligence,<br />not complexity.
        </h2>
        <p className="auth-left-subtitle">
          Sign in to your workspace and start querying your documents with the power of local AI.
        </p>

        <div className="auth-features-list">
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <Brain size={16} color="var(--brand-secondary)" />
            </div>
            <span className="auth-feature-text">Chat with any document in plain English</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <FileText size={16} color="var(--brand-accent)" />
            </div>
            <span className="auth-feature-text">9+ file formats: PDF, Excel, PPT, IPYNB and more</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <Zap size={16} color="#f59e0b" />
            </div>
            <span className="auth-feature-text">Streaming answers with source citations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Login failed. Please try again.');
      }

      localStorage.setItem('dm_token', data.access_token);
      localStorage.setItem('dm_user_identity', data.email);
      navigate('/workspace');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthLeftPanel />

      <div className="auth-right">
        <div className="auth-right-inner">
          {/* Step indicator — single active dot for login */}
          <div className="auth-steps" style={{ marginBottom: 36 }}>
            <div className="auth-step-dot active" />
          </div>

          <div className="auth-card-header">
            <div className="auth-logo-icon">
              <Shield size={24} color="var(--brand-secondary)" />
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue to your workspace</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-field">
                <Mail size={16} color="var(--text-muted)" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <label className="form-label">Password</label>
                <Link to="/forgot-password" className="form-link">Forgot password?</Link>
              </div>
              <div className="input-field">
                <Lock size={16} color="var(--text-muted)" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0 4px', display: 'flex', alignItems: 'center',
                    color: 'var(--text-muted)', flexShrink: 0,
                    transition: 'color 0.2s',
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert-error">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? 'Signing In…' : 'Sign In to Workspace'}
            </button>
          </form>

          <div className="auth-footer">
            New to DocuMind?{' '}
            <Link to="/signup" style={{ color: 'var(--brand-secondary)', fontWeight: 700 }}>
              Create an account
            </Link>
          </div>

          {/* Security note */}
          <p style={{
            marginTop: 24, fontSize: 11.5, color: 'var(--text-muted)',
            textAlign: 'center', lineHeight: 1.6,
          }}>
            🔒 Your session is secured with JWT. Documents never leave your machine.
          </p>
        </div>
      </div>
    </div>
  );
}