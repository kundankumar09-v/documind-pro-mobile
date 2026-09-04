import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload, MessageSquare, Shield, Send, LogOut,
  FileText, Plus, Trash2, Copy, Check,
  ChevronLeft, ChevronRight, ChevronDown,
  Pencil, X, Sparkles, Brain,
} from 'lucide-react';

/* ─── Supported formats config ─── */
const SUPPORTED_ACCEPT = '.pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.pptx,.ipynb';
const SUPPORTED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/json', // .ipynb
];

/* Map extension → badge color */
const EXT_COLORS = {
  pdf:   { bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.30)',  color: '#f87171' },
  docx:  { bg: 'rgba(37,99,235,0.12)',  border: 'rgba(37,99,235,0.30)',  color: '#60a5fa' },
  xlsx:  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.30)', color: '#34d399' },
  xls:   { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.30)', color: '#34d399' },
  csv:   { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.30)',  color: '#22d3ee' },
  txt:   { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.30)', color: '#c084fc' },
  md:    { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.30)', color: '#c084fc' },
  pptx:  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.30)', color: '#fbbf24' },
  ipynb: { bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.35)', color: '#f59e0b' },
};

function getExt(filename) {
  return (filename || '').rsplit ? filename.rsplit('.', 1)[1]?.toLowerCase() : filename?.split('.').pop()?.toLowerCase();
}

function FileBadge({ filename }) {
  const ext = (filename || '').split('.').pop()?.toLowerCase();
  const style = EXT_COLORS[ext] || { bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.25)', color: '#a855f7' };
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
      textTransform: 'uppercase', letterSpacing: '0.05em',
      background: style.bg, border: `1px solid ${style.border}`, color: style.color,
      flexShrink: 0, marginLeft: 'auto',
    }}>
      {ext}
    </span>
  );
}

/* ─── Markdown renderer ─────────────────────────────────────────────────────── */
const TECH_KW = [
  'Machine Learning','Deep Learning','Neural Network','NLP','LLM','RAG',
  'Vector','Embedding','Semantic','Retrieval','FastAPI','Docker','Python',
  'JavaScript','React','PostgreSQL','MongoDB','Redis','AWS','GCP','Azure',
  'Kubernetes','REST API','GraphQL','WebSocket','OAuth','JWT','OCR','PDF',
  'RoBERTa','BERT','GPT','Transformer','Tokenization','API','Authentication',
];
function hi(text) {
  if (!text) return text;
  let o = text;
  for (const kw of TECH_KW) o = o.replace(new RegExp(`\\b(${kw})\\b`, 'gi'), '**$1**');
  return o;
}
function Inline({ text }) {
  const parts = hi(text).split(/\*\*([\s\S]*?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ background: 'linear-gradient(90deg,#7c3aed,#f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{p}</strong>
      : <span key={i}>{p}</span>
  );
}
function Markdown({ raw }) {
  if (!raw) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {raw.split('\n').map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} style={{ height: 8 }} />;
        
        // Match image markdown: ![alt](url)
        const imgMatch = t.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          return (
            <div key={i} style={{ margin: '16px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
              <img src={imgMatch[2]} alt={imgMatch[1]} style={{ maxWidth: '100%', display: 'block', maxHeight: '400px', objectFit: 'contain', background: 'var(--bg-elevated)' }} />
            </div>
          );
        }

        if (t.startsWith('### ')) return <h4 key={i} style={{ fontSize: 13.5, fontWeight: 700, color: '#a855f7', margin: '14px 0 8px', letterSpacing: '0.02em' }}>{t.slice(4)}</h4>;
        if (t.startsWith('## '))  return <h3 key={i} style={{ fontSize: 15, fontWeight: 800, color: '#c084fc', margin: '16px 0 10px' }}>{t.slice(3)}</h3>;
        if (t.startsWith('# '))   return <h2 key={i} style={{ fontSize: 17, fontWeight: 800, background: 'linear-gradient(90deg,#7c3aed,#f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '18px 0 12px' }}>{t.slice(2)}</h2>;
        if (/^\d+\.\s/.test(t)) {
          const m = t.match(/^\d+\.\s(.+)$/);
          return m ? <div key={i} style={{ marginBottom: 8, paddingLeft: 22, color: '#cbd5e1', fontSize: 14, lineHeight: 1.75, display: 'list-item', listStyleType: 'decimal', listStylePosition: 'outside' }}><Inline text={m[1]} /></div> : null;
        }
        if (t.startsWith('- ') || t.startsWith('* ')) return <div key={i} style={{ marginBottom: 8, paddingLeft: 18, color: '#cbd5e1', fontSize: 14, lineHeight: 1.75, display: 'list-item', listStyleType: 'disc', listStylePosition: 'outside' }}><Inline text={t.slice(2)} /></div>;
        return <p key={i} style={{ marginBottom: 10, color: '#cbd5e1', fontSize: 14, lineHeight: 1.75 }}><Inline text={t} /></p>;
      })}
    </div>
  );
}

/* ─── Copy button component ─────────────────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} title="Copy response" style={{
      position: 'absolute', top: 10, right: 10,
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 5,
      color: copied ? 'var(--success)' : 'var(--text-muted)',
      fontSize: 11, fontWeight: 600,
      transition: 'all 0.2s',
    }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ─── Session rename inline editor ─────────────────────────────────────────── */
function SessionTitle({ title, onRename }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    const trimmed = val.trim();
    if (trimmed && trimmed !== title) onRename(trimmed);
    else setVal(title);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(title); setEditing(false); } }}
        style={{
          flex: 1, background: 'transparent', border: 'none',
          borderBottom: '1px solid var(--brand-accent)',
          color: 'var(--text-primary)', fontSize: 13, outline: 'none',
          padding: '1px 0', fontFamily: 'var(--font-sans)',
        }}
        maxLength={40}
      />
    );
  }
  return (
    <span
      className="session-item-title"
      onDoubleClick={() => setEditing(true)}
      title="Double-click to rename"
    >
      {title}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WORKSPACE COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function Workspace() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('dm_user_identity') || 'user@domain.com';
  const username  = userEmail.split('@')[0];
  const chatEndRef    = useRef(null);
  const messagesRef   = useRef(null);

  /* ── Core state ── */
  const [sessions, setSessions]           = useState([]);
  const [activeSessionId, setActiveId]    = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [question, setQuestion]           = useState('');
  const [streaming, setStreaming]         = useState(false);
  const [dragOver, setDragOver]           = useState(false);
  const [selectedFile, setSelectedFile]   = useState(null);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [summaryMap, setSummaryMap]       = useState({}); // { sessionId: { filename, summary, pages, chunks } }
  const [backendOk, setBackendOk]         = useState(null); // null=unknown, true/false

  /* ── Auth guard ── */
  useEffect(() => { if (!localStorage.getItem('dm_token')) navigate('/login'); }, [navigate]);

  /* ── Backend health check ── */
  useEffect(() => {
    fetch('/health').then(r => setBackendOk(r.ok)).catch(() => setBackendOk(false));
  }, []);

  /* ── Load sessions ── */
  useEffect(() => {
    const saved = localStorage.getItem(`dm_sessions_${username}`);
    if (saved) {
      const parsed = JSON.parse(saved).map(s => ({ ...s, files: s.files || [] }));
      setSessions(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
    } else {
      const id  = 'sess_' + Date.now();
      const def = [{ id, title: 'New Chat', history: [], files: [] }];
      setSessions(def);
      setActiveId(id);
      localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(def));
    }
  }, [username]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); handleNewChat(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  /* ── Scroll-to-bottom detection ── */
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const onScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 200);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [sessions, activeSessionId, streaming]);

  /* ── Persistence helper ── */
  const saveSessions = useCallback((updated) => {
    setSessions(updated);
    localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(updated));
  }, [username]);

  /* ── Derived state ── */
  const activeSession = sessions.find(s => s.id === activeSessionId)
    || { id: '', title: '', history: [], files: [] };
  const activeFiles = activeSession.files || [];

  /* ── Delete backend vectors ── */
  const deleteVectors = async (id) => {
    try { await fetch(`/api/session/${id}`, { method: 'DELETE' }); }
    catch {}
  };

  /* ── New chat ── */
  const handleNewChat = () => {
    const blank = sessions.find(s => s.history.length === 0 && s.files.length === 0);
    if (blank) { setActiveId(blank.id); return; }
    const id = 'sess_' + Date.now();
    saveSessions([{ id, title: 'New Chat', history: [], files: [] }, ...sessions]);
    setActiveId(id);
  };

  /* ── Rename session ── */
  const handleRenameSession = (id, newTitle) => {
    saveSessions(sessions.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  /* ── Delete session ── */
  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    deleteVectors(id);
    const rest = sessions.filter(s => s.id !== id);
    if (rest.length === 0) {
      const nid = 'sess_' + Date.now();
      saveSessions([{ id: nid, title: 'New Chat', history: [], files: [] }]);
      setActiveId(nid);
    } else {
      saveSessions(rest);
      if (activeSessionId === id) setActiveId(rest[0].id);
    }
    // Clear summary for deleted session
    setSummaryMap(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  /* ── File upload ── */
  const handleFileChange = async (e) => {
    if (!e.target.files?.[0]) return;
    const files = Array.from(e.target.files);
    setUploading(true);
    for (const f of files) {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('session_id', activeSessionId);
      try {
        const res  = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) {
          setSessions(prev => {
            const updated = prev.map(s =>
              s.id === activeSessionId
                ? { ...s, files: [...new Set([...(s.files || []), f.name])] }
                : s
            );
            localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(updated));
            return updated;
          });
          // Store summary for this session
          if (data.summary) {
            setSummaryMap(prev => ({
              ...prev,
              [activeSessionId]: {
                filename: data.filename,
                summary: data.summary,
                pages: data.page_count,
                chunks: data.indexed_chunks,
                file_type: data.file_type,
              },
            }));
          }
        }
      } catch (err) { console.error('Upload failed:', err); }
    }
    setUploading(false);
    e.target.value = '';
  };

  /* ── Drag & drop ── */
  const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    // Accept any supported MIME type or check extension
    const ext = f.name?.split('.').pop()?.toLowerCase();
    const supported = ['pdf','docx','xlsx','xls','csv','txt','md','pptx','ipynb'];
    if (SUPPORTED_MIMES.includes(f.type) || supported.includes(ext)) {
      setSelectedFile(f);
    }
  };

  /* ── Process document from overlay ── */
  const handleProcessDocument = async () => {
    if (!selectedFile || !activeSessionId) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', selectedFile);
    fd.append('session_id', activeSessionId);
    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setSessions(prev => {
          const updated = prev.map(s =>
            s.id === activeSessionId
              ? { ...s, files: [...new Set([...(s.files || []), selectedFile.name])] }
              : s
          );
          localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(updated));
          return updated;
        });
        if (data.summary) {
          setSummaryMap(prev => ({
            ...prev,
            [activeSessionId]: { filename: data.filename, summary: data.summary, pages: data.page_count, chunks: data.indexed_chunks },
          }));
        }
        setSelectedFile(null);
      }
    } catch (err) { console.error('Processing failed:', err); }
    setUploading(false);
  };

  /* ── Streaming chat submit ── */
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || streaming) return;

    const userPrompt = question;
    setQuestion('');
    setStreaming(true);

    // Snapshot history for conversation memory (last 6 messages)
    const historyForApi = activeSession.history.slice(-6).map(m => ({ role: m.role, text: m.text }));

    // Optimistically add user message
    const userMsg = { role: 'user', text: userPrompt };
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id !== activeSessionId) return s;
        const title = s.title === 'New Chat'
          ? (userPrompt.length > 26 ? userPrompt.slice(0, 26) + '…' : userPrompt)
          : s.title;
        return { ...s, title, history: [...s.history, userMsg] };
      });
      localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(updated));
      return updated;
    });

    // Add a placeholder AI message that will be streamed into
    const aiPlaceholder = { role: 'assistant', text: '', citations: [], streaming: true };
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === activeSessionId ? { ...s, history: [...s.history, aiPlaceholder] } : s
      );
      localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(updated));
      return updated;
    });

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userPrompt,
          session_id: activeSessionId,
          history: historyForApi,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';
      let citations = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';   // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let event;
          try { event = JSON.parse(raw); } catch { continue; }

          if (event.type === 'meta') {
            citations = event.citations || [];
          } else if (event.type === 'token') {
            setSessions(prev => {
              const updated = prev.map(s => {
                if (s.id !== activeSessionId) return s;
                const history = [...s.history];
                const last = history[history.length - 1];
                if (last && last.streaming) {
                  history[history.length - 1] = { ...last, text: last.text + event.content, citations };
                }
                return { ...s, history };
              });
              localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(updated));
              return updated;
            });
          } else if (event.type === 'done' || event.type === 'error') {
            setSessions(prev => {
              const updated = prev.map(s => {
                if (s.id !== activeSessionId) return s;
                const history = [...s.history];
                const last = history[history.length - 1];
                if (last && last.streaming) {
                  const finalText = event.type === 'error'
                    ? `⚠️ Stream error: ${event.message}`
                    : last.text;
                  history[history.length - 1] = { ...last, text: finalText, citations, streaming: false };
                }
                return { ...s, history };
              });
              localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(updated));
              return updated;
            });
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err);
      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id !== activeSessionId) return s;
          const history = [...s.history];
          const last = history[history.length - 1];
          if (last && last.streaming) {
            history[history.length - 1] = {
              ...last,
              text: '⚠️ Could not reach backend. Make sure the FastAPI server is running.',
              citations: [], streaming: false,
            };
          }
          return { ...s, history };
        });
        localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(updated));
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  const activeSummary = summaryMap[activeSessionId];

  /* ═══════════════════════════════ RENDER ═══════════════════════════════ */
  return (
    <div className="workspace-layout" style={{ position: 'relative' }}>

      {/* ── SIDEBAR ── */}
      <aside className="workspace-sidebar" style={{
        width: sidebarOpen ? 268 : 0,
        minWidth: sidebarOpen ? 268 : 0,
        overflow: 'hidden',
        transition: 'width 0.3s var(--ease-spring), min-width 0.3s var(--ease-spring)',
      }}>
        <div style={{ width: 268, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Brand + collapse button */}
          <div className="sidebar-header">
            <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none' }}>
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#sbG)" />
                <path d="M14 6L7 9.5V15.5C7 19.09 10.13 22.5 14 23C17.87 22.5 21 19.09 21 15.5V9.5L14 6Z" fill="white" fillOpacity="0.9" />
                <defs><linearGradient id="sbG" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#2563eb" /><stop offset="1" stopColor="#06b6d4" /></linearGradient></defs>
              </svg>
              <span className="sidebar-brand-name">Docu<span>Mind</span></span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Session list */}
          <div className="sidebar-content">
            <button className="new-chat-btn" onClick={handleNewChat} title="New chat (Ctrl+K)">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={15} color="var(--brand-accent)" />New Chat
              </span>
              <Plus size={15} color="var(--text-muted)" />
            </button>

            <span className="sidebar-section-label">Chat History</span>

            {sessions.map(sess => (
              <div key={sess.id} onClick={() => setActiveId(sess.id)}
                className={`session-item ${sess.id === activeSessionId ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', flex: 1, minWidth: 0 }}>
                  <MessageSquare size={13} color={sess.id === activeSessionId ? 'var(--brand-accent)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                  <SessionTitle
                    title={sess.title}
                    onRename={(t) => handleRenameSession(sess.id, t)}
                  />
                </div>
                <button className="session-delete-btn" onClick={(e) => handleDeleteSession(sess.id, e)} title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* File panel */}
          <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            <button className="upload-btn-sidebar" onClick={() => document.getElementById('sb-upload')?.click()}>
              <Upload size={13} />
              {uploading ? 'Uploading…' : 'Add Document'}
            </button>
            <input id="sb-upload" type="file" accept={SUPPORTED_ACCEPT} onChange={handleFileChange} style={{ display: 'none' }} multiple />

            {activeFiles.length > 0 ? (
              <div style={{ marginTop: 10 }}>
                <span className="sidebar-section-label" style={{ paddingLeft: 0 }}>This Chat's Files</span>
                <div className="sidebar-files-list" style={{ marginTop: 4 }}>
                  {activeFiles.map((name, i) => (
                    <div key={i} className="file-item">
                      <FileText size={10} style={{ flexShrink: 0, color: 'var(--brand-secondary)' }} />
                      <span title={name} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <FileBadge filename={name} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8, lineHeight: 1.55 }}>
                No files yet.<br />Upload PDF, Excel, DOCX, PPT and more.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="sidebar-footer">
            <span className="sidebar-username">@{username}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Backend status indicator */}
              {backendOk !== null && (
                <span title={backendOk ? 'Backend online' : 'Backend offline'} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: backendOk ? 'var(--success)' : 'var(--error)',
                  boxShadow: backendOk ? '0 0 6px var(--success)' : '0 0 6px var(--error)',
                  display: 'inline-block',
                }} />
              )}
              <button className="logout-btn" title="Sign out" onClick={() => { localStorage.clear(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--brand-accent)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <LogOut size={14} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Collapsed sidebar toggle ── */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          zIndex: 100, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <ChevronRight size={16} />
        </button>
      )}

      {/* ── MAIN CHAT ── */}
      <main className="chat-main" style={{ position: 'relative' }}>

        {/* Upload overlay */}
        {selectedFile && (
          <div className="upload-overlay">
            <div className="upload-card">
              <div className="upload-header">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(244,63,94,0.12))', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Brain size={22} color="var(--brand-secondary)" />
                </div>
                <h2>Index Document</h2>
                <p>Adds to this session's isolated vector store only</p>
              </div>
              <div className={`dropzone ${dragOver ? 'drag-over' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => document.getElementById('ov-upload')?.click()}>
                <Upload size={32} color="var(--brand-secondary)" strokeWidth={1.5} />
                <p className="dropzone-title">{selectedFile.name}</p>
                <span className="dropzone-hint">Click to change file</span>
                <div className="dropzone-formats">
                  {['PDF','DOCX','XLSX','CSV','PPTX','TXT','IPYNB','MD'].map(f => (
                    <span key={f} className="format-tag" style={{ background: 'rgba(124,58,237,0.08)', borderColor: 'rgba(124,58,237,0.20)', color: 'var(--brand-secondary)' }}>{f}</span>
                  ))}
                </div>
                <input id="ov-upload" type="file" accept={SUPPORTED_ACCEPT} style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} />
              </div>
              <button className="process-btn" onClick={handleProcessDocument} disabled={uploading}>
                <FileText size={16} />
                {uploading ? 'Indexing document…' : 'Process & Index Document'}
              </button>
              <button className="cancel-btn" onClick={() => setSelectedFile(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Drag-over zone */}
        {!selectedFile && (
          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} style={{ position: 'absolute', inset: 0, zIndex: dragOver ? 40 : -1, pointerEvents: dragOver ? 'auto' : 'none' }}>
            {dragOver && (
              <div style={{ position: 'absolute', inset: 16, borderRadius: 20, border: '2px dashed var(--brand-accent)', background: 'rgba(6,182,212,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                <div style={{ textAlign: 'center' }}>
                  <Upload size={36} color="var(--brand-accent)" strokeWidth={1.5} />
                  <p style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: 'var(--brand-accent)' }}>Drop to upload to this chat</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div ref={messagesRef} className="chat-messages">
          {activeSession.history.length === 0 ? (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <Brain size={28} color="var(--brand-secondary)" strokeWidth={1.5} />
              </div>
              <div>
                <h2>Welcome to DocuMind</h2>
                <p style={{ marginTop: 10 }}>
                  Upload a document to this chat, then ask questions about it. Supports
                  <strong> PDF, DOCX, Excel, PowerPoint, CSV, Jupyter Notebooks, TXT</strong> and more.
                  Each session has its own <strong>isolated</strong> vector store.
                </p>
              </div>

              {/* Auto-summary card */}
              {activeSummary && (
                <div style={{
                  width: '100%', padding: '20px 24px', borderRadius: 16,
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(244,63,94,0.05) 100%)',
                  border: '1px solid rgba(124,58,237,0.18)',
                  textAlign: 'left', animation: 'fadeUp 0.4s var(--ease-spring) both',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Sparkles size={14} color="var(--brand-secondary)" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Auto Summary · {activeSummary.filename}
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                    {activeSummary.summary}
                  </p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📄 {activeSummary.pages} page{activeSummary.pages !== 1 ? 's' : ''}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🧩 {activeSummary.chunks} chunks indexed</span>
                    {activeSummary.file_type && <span style={{ fontSize: 11, color: 'var(--brand-secondary)' }}>📂 {activeSummary.file_type}</span>}
                  </div>
                </div>
              )}

              <div className="chat-hint-cards">
                <div className="chat-hint-card">
                  <div className="chat-hint-card-label">9+ File Formats</div>
                  <p>PDF, DOCX, XLSX, CSV, PPTX, IPYNB, TXT, MD — all supported.</p>
                </div>
                <div className="chat-hint-card">
                  <div className="chat-hint-card-label">Session Isolation</div>
                  <p>Each chat has its own vector store. Files never cross sessions.</p>
                </div>
              </div>

              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                💡 Press <kbd style={{ padding: '2px 6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 10 }}>Ctrl+K</kbd> for a new chat
              </p>
            </div>
          ) : (
            <>
              {/* Auto-summary banner when history exists */}
              {activeSummary && (
                <div style={{
                  padding: '14px 18px', borderRadius: 12, marginBottom: 8,
                  background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.14)',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <Sparkles size={14} color="var(--brand-secondary)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        {activeSummary.filename}
                      </span>
                      {activeSummary.file_type && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: 'var(--brand-secondary)', textTransform: 'uppercase' }}>
                          {activeSummary.file_type}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                      {activeSummary.summary}
                    </p>
                  </div>
                </div>
              )}

              {activeSession.history.map((msg, idx) => (
                <div key={idx} className={`msg-row ${msg.role}`}
                  style={{ animation: `fadeUp 0.3s ${Math.min(idx * 0.03, 0.25)}s var(--ease-spring) both` }}
                >
                  <span className="msg-label">{msg.role === 'user' ? 'You' : 'DocuMind'}</span>
                  <div className={`msg-bubble ${msg.role}`} style={{ position: 'relative' }}>
                    <div>
                      {msg.role === 'user'
                        ? msg.text
                        : <Markdown raw={msg.text} />
                      }
                      {/* Blinking cursor while streaming */}
                      {msg.streaming && (
                        <span style={{
                          display: 'inline-block', width: 2, height: 16,
                          background: 'var(--brand-accent)', marginLeft: 3,
                          animation: 'blink 0.7s ease-in-out infinite', verticalAlign: 'middle',
                        }} />
                      )}
                    </div>
                    {/* Copy button — only on finished AI messages */}
                    {msg.role === 'assistant' && !msg.streaming && msg.text && (
                      <CopyButton text={msg.text} />
                    )}
                    {msg.citations?.length > 0 && (
                      <div className="msg-citations">
                        {msg.citations.map((c, ci) => (
                          <span key={ci} className="citation-pill">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button onClick={scrollToBottom} style={{
            position: 'absolute', bottom: 110, right: 24, zIndex: 20,
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-md)', animation: 'fadeUp 0.2s ease both',
          }}>
            <ChevronDown size={18} />
          </button>
        )}

        {/* Input area */}
        <div className="chat-input-area">
          {activeFiles.length === 0 && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--warning)', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              ⚠️ No document uploaded to this chat yet — upload a file first.
            </p>
          )}
          <form className="chat-form" onSubmit={handleChatSubmit}>
            <input
              className="chat-input"
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={activeFiles.length > 0
                ? `Ask about ${activeFiles.length === 1 ? activeFiles[0] : `${activeFiles.length} documents`}…`
                : 'Upload a document first, then ask questions…'
              }
              disabled={streaming}
            />
            <button
              type="submit"
              disabled={streaming || !question.trim()}
              className={`chat-send-btn ${question.trim() && !streaming ? 'active' : 'inactive'}`}
            >
              <Send size={18} color={question.trim() && !streaming ? 'white' : 'var(--text-muted)'} />
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 10, letterSpacing: '0.02em' }}>
            {streaming
              ? '⚡ DocuMind is generating a response…'
              : 'Runs 100% locally — your documents never leave this machine.'
            }
          </p>
        </div>
      </main>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes neon-pulse {
          0%,100%{box-shadow:0 0 16px rgba(124,58,237,.15)}
          50%{box-shadow:0 0 32px rgba(168,85,247,.35)}
        }
        @keyframes float {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)}
        }
        @keyframes spin { to{transform:rotate(360deg)} }
        .chat-welcome-icon { animation: neon-pulse 3s ease-in-out infinite, float 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}