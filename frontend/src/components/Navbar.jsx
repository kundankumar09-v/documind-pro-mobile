import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dm_token');

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="url(#navGrad)" />
          <path d="M14 6L7 9.5V15.5C7 19.09 10.13 22.5 14 23C17.87 22.5 21 19.09 21 15.5V9.5L14 6Z"
            fill="white" fillOpacity="0.92" />
          <defs>
            <linearGradient id="navGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7c3aed" />
              <stop offset="1" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
        </svg>
        <span className="navbar-brand-name">
          Docu<span>Mind</span>
        </span>
      </Link>

      <div className="navbar-actions">
        {token ? (
          <button className="navbar-cta" onClick={() => navigate('/workspace')}>
            Go to Workspace
          </button>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Log In</Link>
            <button className="navbar-cta" onClick={() => navigate('/signup')}>
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}