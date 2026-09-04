import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <Navbar />
        <div className="auth-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2 style={{ color: 'var(--brand-accent)', marginBottom: 10 }}>Invalid Link</h2>
          <p style={{ color: 'var(--text-muted)' }}>This reset link is missing or invalid.</p>
          <Link to="/forgot-password" style={{ color: 'var(--brand-primary)' }}>Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-card">
        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: 12, color: 'var(--success)' }}>
              Password Reset!
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Your password has been changed successfully. Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <div className="auth-card-header">
              <div className="auth-logo-icon">
                <KeyRound size={26} color="var(--brand-accent)" />
              </div>
              <h1>Set New Password</h1>
              <p>Enter your new password below</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error-banner" style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--brand-accent)', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid rgba(244,63,94,0.2)' }}>{error}</div>}
              
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-field">
                  <Lock size={16} color="var(--text-muted)" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" style={{ marginTop: '20px' }}>
                Update Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
