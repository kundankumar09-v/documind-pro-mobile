import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Mail, Lock, AlertCircle, CheckCircle,
  KeyRound, RefreshCw, ArrowLeft, Eye, EyeOff,
  Zap, FileText, Brain
} from 'lucide-react';

/* ─── OTP Timer Ring ─── */
function OTPTimerRing({ totalSeconds, remainingSeconds }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = remainingSeconds / totalSeconds;
  const offset = circumference * (1 - progress);
  const color = remainingSeconds > 120 ? '#a855f7' : remainingSeconds > 60 ? '#f59e0b' : '#f43f5e';
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  return (
    <div className="otp-timer-wrap">
      <div style={{ position: 'relative', width: 70, height: 70 }}>
        <svg width="70" height="70" className="otp-timer-svg">
          <circle className="otp-timer-track" cx="35" cy="35" r={radius} />
          <circle
            className="otp-timer-bar"
            cx="35" cy="35" r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="otp-timer-text">
        {remainingSeconds <= 0 ? 'Code expired' : 'Code expires in'}
      </span>
    </div>
  );
}

/* ─── OTP Input: 6 single-char animated boxes ─── */
function OTPInput({ value, onChange, disabled }) {
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleKey = (e, idx) => {
    const char = e.target.value.replace(/\D/g, '');
    const digits = value.split('');
    digits[idx] = char.slice(-1);
    const next = digits.join('');
    onChange(next);
    if (char && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    const focusIdx = Math.min(pasted.length, 5);
    setTimeout(() => inputsRef.current[focusIdx]?.focus(), 10);
    e.preventDefault();
  };

  return (
    <div className="otp-container">
      {Array(6).fill('').map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          id={`otp-box-${idx}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={(e) => handleKey(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`otp-box${value[idx] ? ' filled' : ''}`}
          aria-label={`OTP digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}

/* ─── Left panel art content ─── */
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
          Your documents,<br />your intelligence.
        </h2>
        <p className="auth-left-subtitle">
          Upload any document. Ask anything. Get instant, accurate answers powered entirely on your machine.
        </p>

        <div className="auth-features-list">
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <Brain size={16} color="var(--brand-secondary)" />
            </div>
            <span className="auth-feature-text">AI answers grounded in your documents</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <FileText size={16} color="var(--brand-accent)" />
            </div>
            <span className="auth-feature-text">PDF, DOCX, Excel, PowerPoint, CSV, Notebooks & more</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <Zap size={16} color="#f59e0b" />
            </div>
            <span className="auth-feature-text">100% local — zero cloud, zero data leaks</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN SIGNUP COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Signup() {
  const navigate = useNavigate();

  // Step: 'form' | 'otp'
  const [step, setStep] = useState('form');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // OTP
  const [otp, setOtp] = useState('');
  const OTP_TOTAL = 600; // 10 minutes in seconds
  const [otpRemaining, setOtpRemaining] = useState(OTP_TOTAL);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password strength
  const pwStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const pwColors = ['', '#f43f5e', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];
  const pwLabels = ['', 'Weak', 'Fair', 'Fair', 'Strong', 'Very Strong'];

  // Start OTP countdown when step = otp
  useEffect(() => {
    if (step !== 'otp') return;
    setOtpRemaining(OTP_TOTAL);
    const t = setInterval(() => {
      setOtpRemaining(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  /* ── Submit step 1: create account ── */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed.');
      setSuccess(data.message);
      setTimeout(() => { setSuccess(''); setStep('otp'); setOtp(''); }, 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Submit step 2: verify OTP ── */
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    if (otpRemaining <= 0) {
      setError('Your OTP has expired. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Verification failed.');
      setSuccess('✓ Email verified! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Resend failed.');
      setSuccess('New code sent! Check your inbox.');
      setOtp('');
      setOtpRemaining(OTP_TOTAL);
      let secs = 30;
      setResendCooldown(secs);
      const timer = setInterval(() => {
        secs -= 1;
        setResendCooldown(secs);
        if (secs === 0) clearInterval(timer);
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  /* ── Render ── */
  return (
    <div className="auth-page">
      <AuthLeftPanel />

      <div className="auth-right">
        <div className="auth-right-inner">

          {/* Step indicator */}
          <div className="auth-steps">
            <div className={`auth-step-dot ${step === 'form' ? 'active' : 'done'}`} />
            <div className="auth-step-line" />
            <div className={`auth-step-dot ${step === 'otp' ? 'active' : step === 'form' ? '' : 'done'}`} />
          </div>

          {/* ─── Step 1: Registration form ─── */}
          {step === 'form' && (
            <>
              <div className="auth-card-header">
                <div className="auth-logo-icon">
                  <Shield size={24} color="var(--brand-secondary)" />
                </div>
                <h1>Create Account</h1>
                <p>Set up your secure DocuMind workspace</p>
              </div>

              <form className="auth-form" onSubmit={handleSignUp}>
                {/* Email */}
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
                    />
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Mail size={10} /> Only <strong style={{ color: 'var(--brand-secondary)' }}>@gmail.com</strong> addresses are accepted
                  </p>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-field">
                    <Lock size={16} color="var(--text-muted)" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Password strength meter */}
                  {password && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 2,
                            background: i <= pwStrength ? pwColors[pwStrength] : 'var(--border-subtle)',
                            transition: 'background 0.3s ease',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: pwColors[pwStrength] || 'var(--text-muted)' }}>
                        {pwLabels[pwStrength]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-field" style={{
                    borderColor: confirmPassword && confirmPassword !== password
                      ? 'rgba(244,63,94,0.45)'
                      : confirmPassword && confirmPassword === password
                      ? 'rgba(16,185,129,0.45)'
                      : undefined
                  }}>
                    <Lock size={16} color="var(--text-muted)" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {confirmPassword && (
                      <div style={{ flexShrink: 0 }}>
                        {confirmPassword === password
                          ? <CheckCircle size={15} color="var(--success)" />
                          : <AlertCircle size={15} color="var(--error)" />
                        }
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="alert-error">
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="alert-success">
                    <CheckCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="signup-submit-btn"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Creating Account…' : 'Create Account & Send OTP'}
                </button>
              </form>

              <div className="auth-footer">
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--brand-secondary)', fontWeight: 600 }}>
                  Sign in
                </Link>
              </div>
            </>
          )}

          {/* ─── Step 2: OTP Verification ─── */}
          {step === 'otp' && (
            <>
              <div className="auth-card-header">
                <div className="auth-logo-icon">
                  <KeyRound size={24} color="var(--brand-accent)" />
                </div>
                <h1>Verify Your Email</h1>
                <p>
                  We sent a 6-digit code to{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>
                  Check your inbox (and Spam folder)
                </p>
              </div>

              <OTPTimerRing totalSeconds={OTP_TOTAL} remainingSeconds={otpRemaining} />

              <form className="auth-form" onSubmit={handleVerifyOTP} style={{ marginTop: 8 }}>
                <div className="form-group" style={{ alignItems: 'center' }}>
                  <label className="form-label">One-Time Password</label>
                  <OTPInput value={otp} onChange={setOtp} disabled={loading || otpRemaining <= 0} />
                </div>

                {error && (
                  <div className="alert-error">
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="alert-success">
                    <CheckCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="otp-verify-btn"
                  className="auth-submit-btn"
                  disabled={loading || otp.length < 6 || otpRemaining <= 0}
                >
                  {loading ? 'Verifying…' : 'Verify & Activate Account'}
                </button>
              </form>

              <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  id="resend-otp-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--brand-secondary)',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'color 0.2s',
                  }}
                >
                  <RefreshCw size={13} style={{ animation: resendCooldown > 0 ? 'spin 1s linear infinite' : 'none' }} />
                  {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend OTP'}
                </button>

                <button
                  onClick={() => { setStep('form'); setError(''); setOtp(''); setSuccess(''); }}
                  id="back-to-signup-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'color 0.2s',
                  }}
                >
                  <ArrowLeft size={13} />
                  Back to signup
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}