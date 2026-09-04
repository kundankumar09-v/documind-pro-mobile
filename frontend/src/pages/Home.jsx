import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Cpu, Lock, Terminal, ArrowRight, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Background elements */}
      <div className="home-bg-mesh" aria-hidden="true" />
      <div className="home-bg-grid" aria-hidden="true" />

      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="hero-section">
        <div className="hero-badge">
          <Terminal size={13} />
          Next-Generation Document Intelligence
        </div>

        <h1 className="hero-title">
          Analyze Complex Documents
          <br />
          <span className="highlight">Completely Offline</span>
        </h1>

        <p className="hero-subtitle">
          Instantly parse, query, and extract intelligence from your documents
          using local AI. No API leaks. No cloud dependencies. Your data stays yours.
        </p>

        <div className="hero-actions">
          <button className="hero-btn-primary" onClick={() => navigate('/signup')}>
            Start for Free
            <ArrowRight size={16} />
          </button>
          <button className="hero-btn-secondary" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto 80px', padding: '0 32px' }}>
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-number">9+</div>
            <div className="stat-label">File Formats</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">25MB</div>
            <div className="stat-label">Max Document Size</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">∞</div>
            <div className="stat-label">Chat Sessions</div>
          </div>
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card" style={{ animationDelay: '0s' }}>
            <div className="feature-icon-wrap">
              <Terminal size={22} color="var(--brand-accent)" />
            </div>
            <h3 className="feature-title">Smart Multi-Format Parsing</h3>
            <p className="feature-desc">
              Unrivaled format support. Drop in <strong>PDF, DOCX, PPTX, Excel, CSV, Markdown, TXT, and Jupyter Notebooks</strong>. DocuMind intelligently chunks and vectorizes everything seamlessly.
            </p>
          </div>

          <div className="feature-card" style={{ animationDelay: '0.1s' }}>
            <div className="feature-icon-wrap">
              <Lock size={22} color="var(--brand-accent)" />
            </div>
            <h3 className="feature-title">Zero Cloud Leakage</h3>
            <p className="feature-desc">
              All document extraction and AI inference runs locally on your machine.
              No third-party API calls. No telemetry. Your files never leave your device.
            </p>
          </div>

          <div className="feature-card" style={{ animationDelay: '0.2s' }}>
            <div className="feature-icon-wrap">
              <Shield size={22} color="var(--brand-accent)" />
            </div>
            <h3 className="feature-title">Secure OTP Authentication</h3>
            <p className="feature-desc">
              Enterprise-grade access control. Secure your workspace with 
              two-step email verification, timed OTP rings, and JWT-based 
              multi-tenant isolation.
            </p>
          </div>

          <div className="feature-card" style={{ animationDelay: '0.3s' }}>
            <div className="feature-icon-wrap">
              <Cpu size={22} color="var(--brand-accent)" />
            </div>
            <h3 className="feature-title">Isolated RAG Pipelines</h3>
            <p className="feature-desc">
              Each chat session maintains its own isolated vector store. Documents uploaded
              to one session never bleed into another — strict metadata containment guaranteed.
            </p>
          </div>

          <div className="feature-card" style={{ animationDelay: '0.4s' }}>
            <div className="feature-icon-wrap">
              <Zap size={22} color="var(--brand-accent)" />
            </div>
            <h3 className="feature-title">Instant Answers (Gemma2)</h3>
            <p className="feature-desc">
              Ask natural language questions and get precise, cited answers in seconds.
              Powered by Ollama and Gemma2 — highly optimized for local hardware.
            </p>
          </div>

          <div className="feature-card" style={{ animationDelay: '0.5s' }}>
            <div className="feature-icon-wrap">
              <ArrowRight size={22} color="var(--brand-accent)" />
            </div>
            <h3 className="feature-title">Citation Tracking</h3>
            <p className="feature-desc">
              Every AI response includes traceable source citations back to the
              exact document sections — full auditability for enterprise compliance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}